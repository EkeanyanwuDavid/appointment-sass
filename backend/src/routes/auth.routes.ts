import { Router, RequestHandler } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import protect from "../middleware/auth.middleware";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { IUser } from "../models/User";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect as RequestHandler, getMe as RequestHandler);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false, failWithError: true },
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
