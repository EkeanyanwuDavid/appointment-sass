import { Response } from "express";
import Booking from "../models/Booking";
import Service from "../models/Service";
import Staff from "../models/Staff";
import Leave from "../models/Leave";
import Availability from "../models/Availability";
import { getAvailableSlots } from "../utils/slots";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { businessId, staffId, serviceId, date, startTime, locationNotes } =
      req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    const availability = await Availability.findOne({
      staffId,
      dayOfWeek,
      isOff: false,
    });

    if (!availability) {
      res
        .status(400)
        .json({ success: false, message: "Staff not available on this day" });
      return;
    }

    const onLeave = await Leave.findOne({
      staffId,
      date: bookingDate,
      status: "approved",
    });

    if (onLeave) {
      res
        .status(400)
        .json({ success: false, message: "Staff not available on this date" });
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endMinutes = startHour * 60 + startMinute + service.durationMins;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    const conflictingBooking = await Booking.findOne({
      staffId,
      date: bookingDate,
      status: { $nin: ["cancelled"] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflictingBooking) {
      res
        .status(400)
        .json({ success: false, message: "Time slot not available" });
      return;
    }

    const booking = await Booking.create({
      customerId: req.user?._id,
      businessId,
      staffId,
      serviceId,
      date: bookingDate,
      startTime,
      endTime,
      status: "pending",
      paymentStatus: "unpaid",
      locationNotes: locationNotes || "",
    });

    res.status(201).json({ success: true, booking });
  },
);

export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookings = await Booking.find({ customerId: req.user?._id })
      .populate("businessId", "name slug")
      .populate("staffId", "name")
      .populate("serviceId", "name price durationMins currency")
      .sort({ date: -1 });

    res.status(200).json({ success: true, bookings });
  },
);

export const getBusinessBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookings = await Booking.find({ businessId: req.params.businessId })
      .populate("customerId", "name email phone")
      .populate("staffId", "name")
      .populate("serviceId", "name price durationMins currency")
      .sort({ date: -1 });

    res.status(200).json({ success: true, bookings });
  },
);

export const getStaffBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }
    const bookings = await Booking.find({ staffId: staff._id })
      .populate("customerId", "name email phone")
      .populate("serviceId", "name price durationMins currency")
      .sort({ date: -1 });

    res.status(200).json({ success: true, bookings });
  },
);

export const updateBookingStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.status(200).json({ success: true, booking });
  },
);

export const cancelBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user?._id,
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.status === "completed") {
      res
        .status(400)
        .json({ success: false, message: "Cannot cancel a completed booking" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ success: true, booking });
  },
);

export const getSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { staffId, serviceId, date } = req.query;

    if (!staffId || !serviceId || !date) {
      res.status(400).json({
        success: false,
        message: "staffId, serviceId, and date are required",
      });
      return;
    }

    try {
      const slots = await getAvailableSlots({
        staffId: staffId as string,
        serviceId: serviceId as string,
        date: date as string,
      });

      res.status(200).json({ success: true, slots });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to get slots";
      res.status(404).json({ success: false, message });
    }
  },
);

export const markBookingComplete = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const staff = await Staff.findOne({ userId: req.user?._id });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      staffId: staff._id,
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.status !== "confirmed") {
      res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be marked complete",
      });
      return;
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({ success: true, booking });
  },
);
