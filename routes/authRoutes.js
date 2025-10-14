import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken'; // ✅ You missed this import
import { logout } from '../controllers/authController.js';

const router = express.Router();

// Start Google login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async function(req, res) {
    const token = jwt.sign({ email: req.user.email }, process.env.JWT_KEY);
    res.cookie('token', token, { httpOnly: true });
    req.flash('success', 'Logged in with Google');
    res.redirect('/shop');
  }
);

// ✅ Final logout route
router.get('/logout', logout);

export default router;
