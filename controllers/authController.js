import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {generateToken} from '../utils/generateToken.js'
import upload from '../config/multer-config.js';

export async function registerUser(req, res) {
    try {
        let { fullname, email, password,contact} = req.body;
       let user=await userModel.findOne({email:email})
        if(user){req.flash('error', 'You already have account,Please Login');
     return res.status(401).redirect('/users/login');
        }  
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) { return res.send(err.message); }
                else {
                    let user = await userModel.create({
                        fullname: fullname,
                        email: email,
                        contact:contact,
                        password: hash,
                    })
                  let token=generateToken(user);
                    res.cookie('token',token);
                    res.redirect('/shop');
                }
            });
        });

    }
    catch (err) {
        res.send(err.message);
    }
}

export async function profilePicture(req, res) {
  try {
    const user = await userModel.findOne({ email: req.user.email }); // Get current logged-in user

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/account");
    }

    if (req.file && req.file.buffer) {
      user.picture = req.file.buffer; // Save uploaded image buffer
    }

    await user.save();
    req.flash("success", "Profile picture updated");
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}


export async function loginUser(req, res) {
    try {
         let {email, password } = req.body;
          let user=await userModel.findOne({email:email})
        if(!user){ req.flash('error', 'Enter correct email or password');
                return res.redirect('/users/login');
        } 
        bcrypt.compare(password,user.password, function(err, result) { 
        if(!result){ req.flash('error', 'Enter correct email or password');
         return res.redirect('/users/login');
        }    
        else{
            let token =generateToken(user);
            res.cookie('token',token);
          req.flash('success', 'Logged in Successfully'); 
            res.redirect('/shop');}
        })
    }
    catch (err) {
        res.send(err.message);
    }
}

export function logout(req, res) {
  if (typeof req.logout === 'function') {
    req.logout(() => {
      req.flash('success', 'Logged out successfully');
      // req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        res.clearCookie('token');
        return res.redirect('/'); 
      });
    // });
  } else {
    res.clearCookie('token');
    req.flash('success', 'Logged out successfully');
    return res.redirect('/');
  }
}
