import express from 'express'
const router = express.Router();
import upload from '../config/multer-config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {generateToken} from '../utils/generateToken.js'; 
import ownerModel from '../models/ownerModel.js'
import productModel from '../models/productModel.js'; 

// console.log(process.env.NODE_ENV);    // $env:NODE_ENV = "development"  --> this shows we are in which environment
//if(process.env.NODE_ENV==='development'){
router.post('/create',async function(req,res){
    let owners=await ownerModel.find();
   if(owners.length>0){
    return res
    .status(503)
    .send("You don't have permission to create a new owner");}
     let {fullname,email,password,contact,gstin}=req.body;
    // let createdOwner=await ownerModel.create({
    //     fullname:fullname,
    //     email:email,
    //     password:password,
    //     contact:contact,
    //     gstin:gstin,
    // }); 
    bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) { return res.send(err.message); }
                else {
                    let owners = await ownerModel.create({
                        fullname: fullname,
                        email: email,
                        password: hash,
                        contact:contact,
                        gstin:gstin,
                    })
                  let token=generateToken(owners);
                    res.cookie('token',token); 
                    res.redirect('/owners/own');  
                }
            });
        });
    console.log(owners);
})
//}

router.post('/login', async function (req, res) {
  const { email, password } = req.body;
  try {
    const owner = await ownerModel.findOne({ email });
    if (!owner) {
      return res.status(401).send("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).send("Invalid email or password");
    }
    const token = generateToken(owner);
    // Set the token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    // Redirect to admin panel or dashboard
    res.redirect('/owners/own');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/owners/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.owner = decoded;
    next();
  } catch (err) {
    return res.redirect('/owners/login');
  }
}

router.get('/admin',isAuthenticated,function(req,res){
    let success=  req.flash("success");
    res.render('createproduct',{success});
})

router.get('/own',isAuthenticated,async function(req,res){
    try {
    const products = await productModel.find();
    let success = req.flash("success");
    res.render('admin', { products, success });
  } catch (err) {
    console.error("Error loading admin panel:", err);
    res.status(500).send("Server Error");
  }
})

router.get('/own/delete/:id', async (req, res) => {
  await productModel.findByIdAndDelete(req.params.id);
  req.flash('success', 'Product deleted');
  res.redirect('/owners/own');
});

router.get('/own/inStock/:id', async (req, res) => {
 let product = await productModel.findById(req.params.id);
 if (!product) {
  req.flash('error', 'Product not found');
  return res.redirect('back');
}
product.inStock += 1;
await product.save();

  req.flash('success', 'Stock updated');
  res.redirect('/owners/own');
});

// Delete all products
router.get('/own/deleteall', async (req, res) => {
  await productModel.deleteMany({});
  req.flash('success', 'All products deleted');
  res.redirect('/owners/own');
});

router.get('/login',function(req,res){
   res.render('owner-login');
})

export default router;

