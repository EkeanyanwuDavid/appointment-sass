import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import { env } from "./env";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0].value || "";
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
          role: "customer",
        });

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    },
  ),
);

export default passport;
