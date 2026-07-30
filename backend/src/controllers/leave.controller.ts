import { Response } from "express";
import Leave from "../models/Leave";
import Staff from "../models/Staff";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";
import { countChargeableLeaveDays, toUTCDateOnly } from "../utils/leaveDays";

// Jan 1 - Dec 31 of the year the leave starts in. Leave balances reset
// every calendar year.
const getYearBounds = (date: Date) => {
  const year = date.getUTCFullYear();
  return {
    yearStart: new Date(Date.UTC(year, 0, 1)),
    yearEnd: new Date(Date.UTC(year, 11, 31)),
  };
};

const getUsedLeaveDays = async (
  staffId: string,
  referenceDate: Date,
  excludeLeaveId?: string,
) => {
  const { yearStart, yearEnd } = getYearBounds(referenceDate);

  const query: Record<string, unknown> = {
    staffId,
    status: { $in: ["pending", "approved"] },
    startDate: { $gte: yearStart, $lte: yearEnd },
  };
  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  const leaves = await Leave.find(query);
  return leaves.reduce((sum, leave) => sum + leave.days, 0);
};

export const requestLeave = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startDate, endDate, reason } = req.body;

    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const start = toUTCDateOnly(startDate);
    const end = toUTCDateOnly(endDate);

    if (end < start) {
      res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
      return;
    }

    const overlapping = await Leave.findOne({
      staffId: staff._id,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      res.status(400).json({
        success: false,
        message: "You already have a leave request that overlaps these dates",
      });
      return;
    }

    const { days, holidaysExcluded } = await countChargeableLeaveDays(
      staff.businessId,
      start,
      end,
    );

    if (days === 0) {
      res.status(400).json({
        success: false,
        message: "Every day in that range is a business holiday",
      });
      return;
    }

    const usedDays = await getUsedLeaveDays(staff._id.toString(), start);
    const remainingDays = staff.annualLeaveDays - usedDays;

    if (days > remainingDays) {
      res.status(400).json({
        success: false,
        message: `Not enough leave balance. You have ${remainingDays} of ${staff.annualLeaveDays} day(s) left this year, but this request needs ${days}.`,
      });
      return;
    }

    const leave = await Leave.create({
      staffId: staff._id,
      startDate: start,
      endDate: end,
      days,
      reason,
    });

    res.status(201).json({
      success: true,
      leave,
      holidaysExcluded,
      remainingDays: remainingDays - days,
    });
  },
);

export const getMyLeaves = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const leaves = await Leave.find({ staffId: staff._id }).sort({
      startDate: -1,
    });

    const usedDays = await getUsedLeaveDays(staff._id.toString(), new Date());
    const remainingDays = Math.max(staff.annualLeaveDays - usedDays, 0);

    res.status(200).json({
      success: true,
      leaves,
      balance: {
        annualLeaveDays: staff.annualLeaveDays,
        usedDays,
        remainingDays,
      },
    });
  },
);

export const getLeaveBalance = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const usedDays = await getUsedLeaveDays(staff._id.toString(), new Date());
    const remainingDays = Math.max(staff.annualLeaveDays - usedDays, 0);

    res.status(200).json({
      success: true,
      balance: {
        annualLeaveDays: staff.annualLeaveDays,
        usedDays,
        remainingDays,
      },
    });
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
      .populate("staffId", "name email annualLeaveDays")
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, leaves });
  },
);

export const getStaffLeaveBalances = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { businessId } = req.params;

    const staffList = await Staff.find({ businessId });

    const balances = await Promise.all(
      staffList.map(async (staff) => {
        const usedDays = await getUsedLeaveDays(
          staff._id.toString(),
          new Date(),
        );
        return {
          staffId: staff._id,
          name: staff.name,
          email: staff.email,
          annualLeaveDays: staff.annualLeaveDays,
          usedDays,
          remainingDays: Math.max(staff.annualLeaveDays - usedDays, 0),
        };
      }),
    );

    res.status(200).json({ success: true, balances });
  },
);

export const updateLeaveStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      res.status(404).json({ success: false, message: "Leave not found" });
      return;
    }

    if (status === "approved") {
      const staff = await Staff.findById(leave.staffId);
      if (!staff) {
        res.status(404).json({ success: false, message: "Staff not found" });
        return;
      }

      const usedDays = await getUsedLeaveDays(
        staff._id.toString(),
        leave.startDate,
        leave._id.toString(),
      );
      const remainingDays = staff.annualLeaveDays - usedDays;

      if (leave.days > remainingDays) {
        res.status(400).json({
          success: false,
          message: `Approving this would exceed the staff member's leave balance. Only ${remainingDays} of ${staff.annualLeaveDays} day(s) remain.`,
        });
        return;
      }
    }

    leave.status = status as typeof leave.status;
    await leave.save();
    await leave.populate("staffId", "name email annualLeaveDays");

    res.status(200).json({ success: true, leave });
  },
);
