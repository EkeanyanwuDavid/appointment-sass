import { Request, Response } from "express";
import Booking from "../models/Booking";
import Review from "../models/Review";
import Staff from "../models/Staff";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bookingId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
      return;
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user?._id,
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.status !== "completed") {
      res.status(400).json({
        success: false,
        message: "You can only review a completed booking",
      });
      return;
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "This booking has already been reviewed",
      });
      return;
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: req.user?._id,
      businessId: booking.businessId,
      staffId: booking.staffId,
      serviceId: booking.serviceId,
      rating,
      comment: comment || "",
    });

    res.status(201).json({ success: true, review });
  },
);

export const getBusinessReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { businessId } = req.params;

    const reviews = await Review.find({ businessId })
      .populate("customerId", "name")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  },
);

export const getStaffReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId).populate(
      "businessId",
      "ownerId",
    );
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    if (req.user?.role === "staff") {
      // Staff can only view their own reviews
      if (staff.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: "Not authorized" });
        return;
      }
    } else if (req.user?.role === "business_owner") {
      const business = staff.businessId as unknown as {
        ownerId: { toString(): string };
      };
      if (business.ownerId.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: "Not authorized" });
        return;
      }
    }

    const reviews = await Review.find({ staffId })
      .populate("customerId", "name")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  },
);
