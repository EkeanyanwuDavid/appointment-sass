import mongoose, { Document, Schema } from "mongoose";

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  annualLeaveDays: number;
}

const StaffSchema = new Schema<IStaff>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    annualLeaveDays: { type: Number, default: 21, min: 0 },
  },
  { timestamps: true },
);

const Staff = mongoose.model<IStaff>("Staff", StaffSchema);
export default Staff;
