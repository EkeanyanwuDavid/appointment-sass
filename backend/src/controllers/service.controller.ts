import { Response } from "express";
import Service from "../models/Service";
import Business from "../models/Business";
import { AuthRequest } from "../types/index";
import asyncHandler from "../utils/asyncHandler";

export const addService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, durationMins, price, currency } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const service = await Service.create({
      businessId: business._id,
      name,
      durationMins,
      price,
      currency,
    });

    res.status(201).json({ success: true, service });
  },
);

export const getServices = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const services = await Service.find({ businessId: business._id });
    res.status(200).json({ success: true, services });
  },
);

export const updateService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: business._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    res.status(200).json({ success: true, service });
  },
);

export const deleteService = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Service deleted" });
  },
);

export const getServicesBySlug = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    const services = await Service.find({
      businessId: business._id,
      isActive: true,
    });
    res.status(200).json({ success: true, services });
  },
);
