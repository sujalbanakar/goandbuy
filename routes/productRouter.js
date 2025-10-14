import express from 'express'
const router = express.Router();
import upload from '../config/multer-config.js';
import productModel from '../models/productModel.js';

// router.get('/create', function(req, res) {
//     res.render('createProduct'); 
// });

router.post('/create',upload.single('image'),async function(req,res){
    try{
    
      let{name,price,discount,bgcolor,panelcolor,textcolor,brand,warranty,offers,features,specifications}=req.body;
     let inStock = parseInt(req.body.inStock) || 0;
    price = Number(price);
    discount = Number(discount);

      if (features) {
        features = features
        .replace(/\n/g, ',') // Convert newlines to commas
        .split(';')
        .map(f => f.trim()) // Remove extra spaces
        .filter(f => f.length > 0); // Remove empty entries
      }
      
      if (specifications) {
        specifications = specifications
        .replace(/\n/g, ',') // Convert newlines to commas
        .split(';')
        .map(f => f.trim()) // Remove extra spaces
        .filter(f => f.length > 0); // Remove empty entries
      }
      
      if (offers) {
        offers = offers
        .replace(/\n/g, ',') // Convert newlines to commas
        .split(';')
        .map(f => f.trim()) // Remove extra spaces
        .filter(f => f.length > 0); // Remove empty entries
      }
      let product=await productModel.create({
        inStock:req.body.inStock === 'on',
        image: req.file.buffer || null,
        name,
        price,
    discount,
    bgcolor,
    panelcolor,
    textcolor,
    inStock,
    brand,
  warranty,
  offers,
  features,
  specifications,
  });
  req.flash("success","Product Created Successfully");
  res.redirect("/owners/admin");
}
catch(err){
    res.send(err.message);
}
});

export default router;

