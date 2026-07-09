import mongoose, { Document, Schema } from "mongoose";

export interface IBusiness extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  imageUrl: string;
  isActive: boolean;
  paystackSubaccountCode: string;
  settlementBankCode: string;
  settlementBankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    paystackSubaccountCode: { type: String, default: "" },
    settlementBankCode: { type: String, default: "" },
    settlementBankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountName: { type: String, default: "" },
  },
  { timestamps: true },
);

const Business = mongoose.model<IBusiness>("Business", BusinessSchema);

export default Business;
