import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request } from "express";
import User from "../models/User";
import { env } from "./env";

const getGoogleRole = (role?: string) => {
  if (role === "business_owner") return "business_owner";
  if (role === "staff") return "staff";
  return "customer";
};

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: `${env.backendUrl}/api/auth/google/callback`,
        passReqToCallback: true,
      },
      async (
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          const selectedRole = getGoogleRole(
            (req.query.state as string | undefined) ||
              (req.query.role as string | undefined),
          );

          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.role = selectedRole;
            await user.save();
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0].value || "";
            user.role = selectedRole;
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            googleId: profile.id,
            avatar: profile.photos?.[0].value || "",
            password: Math.random().toString(36).slice(-16),
            phone: "",
            role: selectedRole,
          });

          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      },
    ),
  );
} else {
  console.warn(
    "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.",
  );
}

export default passport;
