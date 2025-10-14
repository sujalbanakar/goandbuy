import express from 'express'
const router = express.Router();
import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {generateToken} from '../utils/generateToken.js';
import upload from '../config/multer-config.js';
import {isLoggedin} from '../middlewares/isLoggedin.js';
import {registerUser,loginUser,logout,profilePicture,} from '../controllers/authController.js'

router.get('/', function (req, res) {
   res.send('hey it is working');
})

router.get('/login', (req, res) => {
  let error = req.flash('error');
  let success = req.flash('success');
  res.render('index', { error, success }); // or a dedicated 'login' page if you have one
});

router.post('/register',registerUser);

router.post('/profilePicture', isLoggedin, upload.single('image'), profilePicture);

router.post('/login',loginUser);

router.get('/logout',logout);

export default router;

