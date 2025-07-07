import express from "express";
import cookieParser from 'cookie-parser';
import path from 'path';
import db from './config/mongoose-connections.js';
import userRouter from './routes/userRouter.js';
import ownerRouter from './routes/ownerRouter.js';
import productRouter from './routes/productRouter.js';

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static("public"));
app.set('view engine','ejs');
app.set("views", path.join(process.cwd(), "views"));

app.use('/users',userRouter);
app.use('/owners',ownerRouter);
app.use('/products',productRouter);

app.listen(3000);