
import crypto from "node:crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(new Error("Google account email is unavailable"));
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email },
          ],
        });

        if (user) {
          if (user.status !== "active") {
            return done(null, false, {
              message: "Your account is not active.",
            });
          }

          // Link Google account to an existing email account.
      if (!user.googleId) {
  return done(
    null,
    false,
    { message: "An account with this email already exists. Please log in using your existing method." }
  );
}

          return done(null, user);
        }

        const defaultRole = await Role.findOne({
          name: { $regex: /^user$/i },
        });

        if (!defaultRole) {
          return done(
            new Error("Default User role not found in database")
          );
        }

        user = await User.create({
          name: profile.displayName || email.split("@")[0],
          email,
          googleId: profile.id,
          password: `GOOGLE_${crypto.randomUUID()}`,
          profilePhoto: profile.photos?.[0]?.value || "",
          isEmailVerified: true,
          role: defaultRole._id,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
