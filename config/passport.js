import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Try finding by googleId first
    let user = await userModel.findOne({ googleId: profile.id });

    if (!user) {
      // Check if user already exists with this email
      const existingUser = await userModel.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // If found, just add googleId to existing account
        existingUser.googleId = profile.id;
        await existingUser.save();
        return done(null, existingUser);
      }

      // If not found, create new user
      user = await userModel.create({
        fullname: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});
