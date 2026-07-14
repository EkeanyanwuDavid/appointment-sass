import { Response } from "express";
import Staff from "../models/Staff";
import User from "../models/User";
import Business from "../models/Business";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const addStaff = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, email, phone } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    let userAccount = await User.findOne({ email });
    if (!userAccount) {
      userAccount = await User.create({
        name,
        email,
        phone,
        password: "password123",
        role: "staff",
        mustChangePassword: true,
      });
      console.log("CREATED USER", userAccount);
    }

    const existingStaff = await Staff.findOne({
      userId: userAccount._id,
      businessId: business._id,
    });
    if (existingStaff) {
      res.status(400).json({ success: false, message: "Staff already exists" });
      return;
    }

    const staff = await Staff.create({
      userId: userAccount._id,
      businessId: business._id,
      name,
      email,
      phone,
    });

    res.status(201).json({ success: true, staff });
  },
);

export const getStaff = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const staff = await Staff.find({ businessId: business._id });
    res.status(200).json({ success: true, staff });
  },
);

export const updateStaff = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, email, phone } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const staff = await Staff.findOne({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== staff.userId.toString()
      ) {
        res
          .status(400)
          .json({ success: false, message: "Email already in use" });
        return;
      }
    }

    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone !== undefined) staff.phone = phone;
    await staff.save();

    await User.findByIdAndUpdate(staff.userId, {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
    });

    res.status(200).json({ success: true, staff });
  },
);

export const removeStaff = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const staff = await Staff.findOneAndDelete({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Staff removed" });
  },
);

// staff.controller.ts
export const getStaffBySlug = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const staff = await Staff.find({
      businessId: business._id,
      isActive: true,
    }).select("name _id");

    res.status(200).json({ success: true, staff });
  },
);
