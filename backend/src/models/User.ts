import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "business_owner" | "staff";
  googleId: string;
  avatar: string;
  mustChangePassword: boolean;
  resetPasswordToken: string;
  resetPasswordExpires: Date | null;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "business_owner", "staff"],
      default: "customer",
    },
    googleId: { type: String, default: "" },
    avatar: { type: String, default: "" },
    mustChangePassword: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: "", select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
