import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import { AuthRequest } from "../types";
import asyncHandler from "../utils/asyncHandler";
import { env } from "../config/env";
import sendEmail from "../utils/sendEmail";
import { passwordResetTemplate } from "../utils/emailTemplates";

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ success: false, message: "Email already exists" });
    return;
  }

  const user = await User.create({ name, email, password, phone, role });

  const token = generateToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user._id.toString(), user.role);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated" });
  },
);

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id).select("-password");
  res.status(200).json({ success: true, user });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, a reset link has been sent",
    };

    if (!user) {
      res.status(200).json(genericResponse);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;

    sendEmail({
      to: user.email,
      subject: "Reset your Bkly password",
      html: passwordResetTemplate({ name: user.name, resetUrl }),
    });

    res.status(200).json(genericResponse);
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const tokenParam = req.params.token;
    const { newPassword } = req.body;

    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    if (!token) {
      res
        .status(400)
        .json({ success: false, message: "Reset token is required" });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset link" });
      return;
    }

    user.password = newPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  },
);
