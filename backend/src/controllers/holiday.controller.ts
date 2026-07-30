import { Response } from "express";
import Holiday from "../models/Holiday";
import Business from "../models/Business";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";
import { toUTCDateOnly } from "../utils/leaveDays";

export const addHoliday = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, date } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const existing = await Holiday.findOne({
      businessId: business._id,
      date: toUTCDateOnly(date),
    });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "A holiday is already set for this date",
      });
      return;
    }

    const holiday = await Holiday.create({
      businessId: business._id,
      name,
      date: toUTCDateOnly(date),
    });

    res.status(201).json({ success: true, holiday });
  },
);

export const getHolidays = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { businessId } = req.params;

    const holidays = await Holiday.find({ businessId }).sort({ date: 1 });
    res.status(200).json({ success: true, holidays });
  },
);

export const deleteHoliday = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const holiday = await Holiday.findOneAndDelete({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!holiday) {
      res.status(404).json({ success: false, message: "Holiday not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Holiday removed" });
  },
);
