import mongoose, { Document, Schema } from "mongoose";

export interface IAvailability extends Document {
  staffId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isOff: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Availability = mongoose.model<IAvailability>(
  "Availability",
  AvailabilitySchema,
);

export default Availability;
