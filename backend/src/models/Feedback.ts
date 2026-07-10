import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  businessId?: mongoose.Types.ObjectId;

  type: "feature" | "bug" | "website";
  category:
    | "Bug Report"
    | "Feature Request"
    | "Improvement"
    | "Question"
    | "General Feedback";

  name: string;
  email: string;
  message: string;
  status: "pending" | "resolved";

  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Bug Report",
        "Feature Request",
        "Improvement",
        "Question",
        "General Feedback",
      ],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
