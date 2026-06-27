import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  durationMins: number;
  price: number;
  currency: string;
  isActive: boolean;
}

const ServiceSchema = new Schema<IService>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    durationMins: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Service = mongoose.model<IService>("Service", ServiceSchema);

export default Service;
