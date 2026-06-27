import mongoose, { Document, Schema } from "mongoose";

export interface ILeave extends Document {
  staffId: mongoose.Types.ObjectId;
  date: Date;
  reason: "sick" | "annual_leave" | "personal";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    date: { type: Date, required: true },
    reason: {
      type: String,
      enum: ["sick", "annual_leave", "personal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Leave = mongoose.model<ILeave>("Leave", LeaveSchema);
export default Leave;
