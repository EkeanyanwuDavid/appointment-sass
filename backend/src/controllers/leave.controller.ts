import { Response } from "express";
import Leave from "../models/Leave";
import Staff from "../models/Staff";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const requestLeave = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { date, reason } = req.body;

    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const existingLeave = await Leave.findOne({
      staffId: staff._id,
      date: new Date(date),
    });
    if (existingLeave) {
      res.status(400).json({
        success: false,
        message: "Leave already requested for this date",
      });
      return;
    }

    const leave = await Leave.create({
      staffId: staff._id,
      date: new Date(date),
      reason,
    });

    res.status(201).json({ success: true, leave });
  },
);

export const getMyLeaves = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const leaves = await Leave.find({ staffId: staff._id }).sort({ date: -1 });
    res.status(200).json({ success: true, leaves });
  },
);

export const getBusinessLeaves = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { businessId } = req.params;

    const staffList = await Staff.find({ businessId });
    const staffIds = staffList.map((s) => s._id);

    const leaves = await Leave.find({
      staffId: { $in: staffIds },
      status: "pending",
    })
      .populate("staffId", "name email")
      .sort({ date: 1 });

    res.status(200).json({ success: true, leaves });
  },
);

export const updateLeaveStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!leave) {
      res.status(404).json({ success: false, message: "Leave not found" });
      return;
    }

    res.status(200).json({ success: true, leave });
  },
);
