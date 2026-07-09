import { Response } from "express";
import User from "../models/User";
import Business from "../models/Business";
import Booking from "../models/Booking";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const getPlatformStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [
      totalBusinesses,
      totalCustomers,
      totalStaff,
      totalOwners,
      totalBookings,
      paidBookings,
    ] = await Promise.all([
      Business.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "staff" }),
      User.countDocuments({ role: "business_owner" }),
      Booking.countDocuments(),
      Booking.find({ paymentStatus: "paid" }).populate("serviceId", "price"),
    ]);

    const totalRevenue = paidBookings.reduce((sum: number, b: any) => {
      return sum + (b.serviceId?.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalBusinesses,
        totalCustomers,
        totalStaff,
        totalOwners,
        totalBookings,
        totalRevenue,
      },
    });
  },
);

export const getAllBusinessesAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const businesses = await Business.find()
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, businesses });
  },
);

export const toggleBusinessStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findById(req.params.id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    business.isActive = !business.isActive;
    await business.save();

    res.status(200).json({ success: true, business });
  },
);

export const getAllUsersAdmin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role } = req.query;

    const filter: Record<string, unknown> = {};
    if (role && role !== "all") {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  },
);
