import { Response } from "express";
import axios from "axios";
import Booking from "../models/Booking";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";
import { env } from "../config/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const initializePayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user?._id,
    }).populate("serviceId", "price currency");

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.paymentStatus === "paid") {
      res
        .status(400)
        .json({ success: false, message: "Booking already paid for" });
      return;
    }

    const service = booking.serviceId as unknown as { price: number };
    const amountInKobo = service.price * 100; // Paystack expects amount in kobo

    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: req.user?.email,
          amount: amountInKobo,
          metadata: {
            bookingId: booking._id.toString(),
          },
          callback_url: `${env.clientUrl}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${env.paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      res.status(200).json({
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      res.status(500).json({
        success: false,
        message:
          error.response?.data?.message || "Failed to initialize payment",
      });
    }
  },
);

export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { reference } = req.params;

    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${env.paystackSecretKey}`,
          },
        },
      );

      const data = response.data.data;

      if (data.status !== "success") {
        res
          .status(400)
          .json({ success: false, message: "Payment not successful" });
        return;
      }

      const bookingId = data.metadata?.bookingId;
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      booking.paymentStatus = "paid";
      booking.paymentRef = reference as string;
      await booking.save();

      res.status(200).json({ success: true, booking });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      res.status(500).json({
        success: false,
        message: error.response?.data?.message || "Failed to verify payment",
      });
    }
  },
);
