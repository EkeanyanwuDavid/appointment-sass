import { Response } from "express";
import axios from "axios";
import Business from "../models/Business";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";
import { env } from "../config/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const createBusiness = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, slug, category, description, phone, address, city } =
      req.body;

    const existingBusiness = await Business.findOne({ slug });
    if (existingBusiness) {
      res.status(400).json({ success: false, message: "Slug already taken" });
      return;
    }

    const business = await Business.create({
      ownerId: req.user?._id,
      name,
      slug,
      category,
      description,
      phone,
      address,
      city,
    });

    res.status(201).json({ success: true, business });
  },
);

export const getMyBusiness = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }
    res.status(200).json({ success: true, business });
  },
);

export const updateBusiness = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOneAndUpdate(
      { ownerId: req.user?._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }
    res.status(200).json({ success: true, business });
  },
);

export const getBusinessBySlug = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }
    res.status(200).json({ success: true, business });
  },
);

export const getAllBusinesses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { search, category } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search as string, $options: "i" };
    }

    const businesses = await Business.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, businesses });
  },
);

export const getBanks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank?country=nigeria&currency=NGN`,
        {
          headers: { Authorization: `Bearer ${env.paystackSecretKey}` },
        },
      );

      const banks = response.data.data.map(
        (bank: { name: string; code: string }) => ({
          name: bank.name,
          code: bank.code,
        }),
      );

      res.status(200).json({ success: true, banks });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      res.status(500).json({
        success: false,
        message: error.response?.data?.message || "Failed to fetch banks",
      });
    }
  },
);

export const createSubaccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { settlementBankCode, settlementBankName, accountNumber } = req.body;

    if (!settlementBankCode || !accountNumber) {
      res.status(400).json({
        success: false,
        message: "Bank and account number are required",
      });
      return;
    }

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/subaccount`,
        {
          business_name: business.name,
          settlement_bank: settlementBankCode,
          account_number: accountNumber,
          // percentage_charge is what YOUR main account keeps — the rest
          // (100 - this) is what settles to the business owner automatically.
          percentage_charge: env.platformFeePercentage,
        },
        {
          headers: {
            Authorization: `Bearer ${env.paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data.data;

      business.paystackSubaccountCode = data.subaccount_code;
      business.settlementBankCode = settlementBankCode;
      business.settlementBankName = settlementBankName || "";
      business.accountNumber = accountNumber;
      business.accountName = data.account_name;
      await business.save();

      res.status(200).json({ success: true, business });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      res.status(500).json({
        success: false,
        message: error.response?.data?.message || "Failed to create subaccount",
      });
    }
  },
);
