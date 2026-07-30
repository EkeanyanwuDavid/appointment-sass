import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import Booking, { IBooking } from "../models/Booking";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";
import { env } from "../config/env";
import sendEmail from "../utils/sendEmail";
import {
  bookingConfirmationTemplate,
  newBookingNotificationTemplate,
} from "../utils/emailTemplates";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const markBookingPaidAndNotify = async (
  booking: IBooking,
  reference: string,
  amountPaid: number,
) => {
  if (booking.paymentStatus === "paid") {
    return booking;
  }

  booking.paymentStatus = "paid";
  booking.paymentRef = reference;
  booking.amountPaid = amountPaid;
  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate({
      path: "businessId",
      select: "name ownerId",
      populate: { path: "ownerId", select: "name email" },
    })
    .populate("serviceId", "name price currency")
    .populate("customerId", "name email");

  if (!populated) return booking;

  const business = populated.businessId as unknown as {
    name: string;
    ownerId: { name: string; email: string };
  };
  const service = populated.serviceId as unknown as {
    name: string;
    price: number;
    currency: string;
  };
  const customer = populated.customerId as unknown as {
    name: string;
    email: string;
  };

  sendEmail({
    to: customer.email,
    subject: "Your Bkly booking is confirmed",
    html: bookingConfirmationTemplate({
      customerName: customer.name,
      businessName: business.name,
      serviceName: service.name,
      date: populated.date.toDateString(),
      startTime: populated.startTime,
      price: service.price,
      currency: service.currency,
    }),
  });

  sendEmail({
    to: business.ownerId.email,
    subject: "New paid booking on Bkly",
    html: newBookingNotificationTemplate({
      ownerName: business.ownerId.name,
      customerName: customer.name,
      serviceName: service.name,
      date: populated.date.toDateString(),
      startTime: populated.startTime,
      price: service.price,
      currency: service.currency,
    }),
  });

  return populated;
};

export const initializePayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user?._id,
    })
      .populate("serviceId", "price currency")
      .populate("businessId", "paystackSubaccountCode");

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
    const business = booking.businessId as unknown as {
      paystackSubaccountCode: string;
    };
    const amountInKobo = service.price * 100;

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

          ...(business.paystackSubaccountCode && {
            subaccount: business.paystackSubaccountCode,
          }),
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

      const booking = await Booking.findOne({
        _id: bookingId,
        customerId: req.user?._id,
      });

      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      const updated = await markBookingPaidAndNotify(
        booking,
        reference as string,
        data.amount,
      );

      res.status(200).json({ success: true, booking: updated });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      res.status(500).json({
        success: false,
        message: error.response?.data?.message || "Failed to verify payment",
      });
    }
  },
);

export const paystackWebhook = async (req: Request, res: Response) => {
  const hash = crypto
    .createHmac("sha512", env.paystackSecretKey)
    .update(req.body) // raw Buffer
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    res.status(401).end();
    return;
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const bookingId = event.data.metadata?.bookingId;
    const booking = await Booking.findById(bookingId);

    if (booking) {
      try {
        await markBookingPaidAndNotify(
          booking,
          event.data.reference,
          event.data.amount,
        );
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    }
  }

  res.status(200).end();
};

export const refundPayment = async (
  paymentRef: string,
  amountInKobo: number,
) => {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/refund`,
    {
      transaction: paymentRef,
      amount: amountInKobo,
    },
    {
      headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (
    response.data?.status !== true ||
    response.data?.data?.status === "failed" ||
    response.data?.data?.status === "reversed"
  ) {
    throw new Error(
      response.data?.message || "Paystack rejected the refund request",
    );
  }

  return response.data;
};
