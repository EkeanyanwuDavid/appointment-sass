import { Response } from "express";
import { validationResult } from "express-validator";
import Feedback from "../models/FeedBack";
import Business from "../models/Business";
import { AuthRequest } from "../types";
import sendEmail from "../utils/sendEmail";
import { env } from "../config/env";
import asyncHandler from "../utils/asyncHandler";

export const createFeedback = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { type, name, email, category, message } = req.body;

    let businessId;

    if (req.user) {
      const business = await Business.findOne({
        ownerId: req.user._id,
      });

      if (business) {
        businessId = business._id;
      }
    }
    const feedback = await Feedback.create({
      userId: req.user?._id,
      businessId,
      name,
      email,
      category,
      message,
    });
    await sendEmail({
      to: env.emailUser,
      subject: `BKLY Feedback • ${category}`,
      html: `
    <div style="font-family:Plus Jakarta Sans,sans-serif;line-height:1.7;max-width:600px">
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Category:</strong> ${category}</p>

      <hr>

      <p>${message}</p>
    </div>
  `,
    });

    await sendEmail({
      to: email,
      subject: "We've received your feedback 💙",
      html: `
    <div style="font-family:Arial,sans-serif;line-height:1.7;max-width:600px">
      <h2>Thanks for your feedback!</h2>

      <p>Hi <strong>${name}</strong>,</p>

      <p>
        Thanks for taking the time to share your feedback with BKLY.
      </p>

      <p>
        We've received your message and our team will review it.
      </p>

      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:20px 0">
        <strong>Category:</strong> ${category}<br><br>
        ${message}
      </div>

      <p>
        We appreciate your support as we continue improving BKLY.
      </p>

      <p>— The BKLY Team</p>
    </div>
  `,
    });
    res.status(201).json({
      success: true,
      feedback,
    });
  },
);

export const getFeedback = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const feedback = await Feedback.find()
      .populate("userId", "name email")
      .populate("businessId", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedback,
    });
  },
);

export const updateFeedbackStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      },
    );

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  },
);
