import { Response } from "express";
import Business from "../models/Business";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

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
