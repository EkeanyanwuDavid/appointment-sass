import { Request, Response } from "express";
import mongoose from "mongoose";

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

export const getMyReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reviews = await Review.find({ customerId: req.user?._id }).select(
      "bookingId rating comment",
    );
    res.status(200).json({ success: true, reviews });
  },
);

export const getBusinessReviewStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { businessId } = req.params;

    const reviews = await Review.find({ businessId });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    const topStaff = await Review.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId as string),
        },
      },
      {
        $group: {
          _id: "$staffId",
          averageRating: {
            $avg: "$rating",
          },
          totalReviews: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          averageRating: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "staffs",
          localField: "_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      {
        $unwind: "$staff",
      },
      {
        $project: {
          _id: 0,
          name: "$staff.name",
          averageRating: {
            $round: ["$averageRating", 1],
          },
          totalReviews: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      distribution,
      topStaff,
    });
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

export const getRecentBusinessReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { businessId } = req.params;

    const reviews = await Review.find({ businessId })
      .populate("customerId", "name")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 })
      .limit(2);

    res.status(200).json({
      success: true,
      reviews,
    });
  },
);

export const getMyStaffReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res
        .status(404)
        .json({ success: false, message: "Staff profile not found" });
      return;
    }

    const reviews = await Review.find({ staffId: staff._id })
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
