import mongoose, { Document, Schema } from "mongoose";

export interface IHoliday extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  date: Date;
  createdAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

// a business can't declare the same calendar day a holiday twice.
HolidaySchema.index({ businessId: 1, date: 1 }, { unique: true });

const Holiday = mongoose.model<IHoliday>("Holiday", HolidaySchema);
export default Holiday;
