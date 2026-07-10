import { Router, RequestHandler } from "express";
import {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import protect from "../middleware/auth.middleware";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { IUser } from "../models/User";
import {
  authLimiter,
  strictLimiter,
} from "../middleware/ratelimiter.middleware";

import sendEmail from "../utils/sendEmail";
const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect as RequestHandler, getMe as RequestHandler);
router.put(
  "/change-password",
  protect as RequestHandler,
  changePassword as RequestHandler,
);
router.post("/forgot-password", strictLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/google", (req, res, next) => {
  const role = (req.query.role as string | undefined) || "customer";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
  })(req, res, next);
});

router.get("/test-email", async (req, res) => {
  await sendEmail({
    to: "test@example.com",
    subject: "Test email from Bkly",
    html: "<h1>It works!</h1><p>This is a test email.</p>",
  });
  res.json({ success: true, message: "Email attempt sent, check Mailtrap" });
});

router.get("/google/callback", (req, res, next) => {
  const state =
    (req.query.state as string | undefined) ||
    (req.query.role as string | undefined) ||
    "customer";

  passport.authenticate(
    "google",
    { session: false, failWithError: true, state },
    (err: unknown, user: IUser | false | null, info: unknown) => {
      if (err) {
        console.error("Google OAuth error:", err);
        const errorMessage = encodeURIComponent(
          err instanceof Error ? err.message : "google_auth_failed",
        );
        return res.redirect(
          `${env.clientUrl}/auth/callback?error=${errorMessage}`,
        );
      }

      if (!user) {
        console.error("Google OAuth no user:", info);
        return res.redirect(
          `${env.clientUrl}/auth/callback?error=google_auth_failed`,
        );
      }

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any },
      );

      const userPayload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      };

      const redirectUrl = new URL(`${env.clientUrl}/auth/callback`);
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("user", JSON.stringify(userPayload));

      return res.redirect(redirectUrl.toString());
    },
  )(req, res, next);
});

export default router;
