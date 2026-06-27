import { Response } from "express";
import Availability from "../models/Availability";
import Staff from "../models/Staff";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const setAvailability = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { staffId, availability } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    await Availability.deleteMany({ staffId });

    const created = await Availability.insertMany(
      availability.map((a: any) => ({ ...a, staffId })),
    );

    res.status(201).json({ success: true, availability: created });
  },
);

export const getAvailability = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const availability = await Availability.find({
      staffId: req.params.staffId,
    });
    res.status(200).json({ success: true, availability });
  },
);
