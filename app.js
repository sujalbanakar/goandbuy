import express from "express";
import cookieParser from 'cookie-parser';
import path from 'path';
import db from './config/mongoose-connections.js';
import userRouter from './routes/userRouter.js';
import ownerRouter from './routes/ownerRouter.js';
import productRouter from './routes/productRouter.js';
import expressSession from "express-session";
import flash from "connect-flash";
import indexRouter from './routes/index.js'
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import './config/passport.js';

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(
    expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    })
);

app.use(flash());   

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.set('view engine','ejs');
app.set("views", path.join(process.cwd(), "views"));

app.use('/',indexRouter)
app.use('/users',userRouter);
app.use('/owners',ownerRouter);
app.use('/products',productRouter);
// ✅ Register Google OAuth routes
app.use('/auth', authRoutes);

app.listen(3000, '0.0.0.0');