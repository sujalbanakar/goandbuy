import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export async function isLoggedin(req, res, next) {
  // If using Google OAuth session login
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.user = req.user; // already populated by passport
    return next();
  }

  // If using JWT login
  const token = req.cookies.token;
  if (!token) {
    req.flash("error", "You need to login or create account first");
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email }).select('-password');
    if (!user) {
      req.flash("error", "User no longer exists");
      return res.redirect('/');
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    req.flash("error", "Something went wrong");
    return res.redirect('/');
  }
}
