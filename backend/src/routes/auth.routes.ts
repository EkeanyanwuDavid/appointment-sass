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

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.clientUrl}/login`,
  }),
  (req, res) => {
    const user = req.user as IUser;
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as any },
    );
    res.redirect(`${env.clientUrl}/auth/callback?token=${token}`);
  },
);

export default router;
