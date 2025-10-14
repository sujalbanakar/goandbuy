import express from 'express'
const router = express.Router();
import {isLoggedin} from '../middlewares/isLoggedin.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
//import { showShop } from '../controllers/shopController.js'; // ✅ Add this 

router.get('/',async function(req,res){
    let error = req.flash('error');
   let success = req.flash('success');  
   res.render('index', { error, success, loggedin:false });
});   

router.get('/shop', isLoggedin, async function(req, res) {
    const { sortby, filter, search } = req.query;

 let success = req.flash("success");
  let error= req.flash('error');

  let query = {};


 // Apply filter
  if (filter === 'new') {
    query.isNew = true; 
  }
  if (filter === 'discount') {
    query.discount = { $gt: 0 }; 
  }
  if (filter === 'discount1') {
    query.discount = { $gt: 0 }; 
  }
if (filter === 'availability') {
  query.inStock = { $gt: 0 };
}

    // Apply search
  if (search) {
    const regex = new RegExp(search, 'i'); // case-insensitive
    query.$or = [
      { name: regex },
      { brand: regex },
      { description: regex },
      { features: regex },
      { specifications: regex }
    ];
  }

  //  Sorting logic
  let sort = {};
  if (sortby === 'newest') {
    sort.createdAt = -1;
  } else {
    sort.popularity = -1; // assume popularity is tracked
  }
  // Fetch filtered and sorted products
  const products = await productModel.find(query).sort(sort);

  res.render('shop', {
    products,
    success,
    error,
    filter,
    sortby,
    search
  });
}); 

router.get('/addtocart/:id', isLoggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  if (!user.cart) {
    user.cart = [];
  }

  const productId = req.params.id;

  const existingItem = user.cart.find(item => String(item.product) === String(productId));

  // First time adding — check if the product is in stock
  if (!existingItem) {
    const product = await productModel.findById(productId);

    if (!product || product.inStock === 0) {
      req.flash('error', 'This product is currently out of stock');
      return res.redirect(req.get('referer'));
    }

    // Push new item if in stock
    user.cart.push({ product: productId, quantity: 1 });
  } else {
    // If already exists, just increase quantity
    existingItem.quantity += 1;
  }

  await user.save();
  req.flash("success", "Added to Cart");
  res.redirect(req.get('referer'));
});

router.get('/buy/:id',isLoggedin,async function(req,res){
   let user=await userModel.findOne({email:req.user.email});
   if (!user.buy) {
      user.buy = [];
   }

   const productId = req.params.id;
  const existingItem = user.buy.find(item => String(item.product) === String(productId));
  //console.log(existingItem);

  if (existingItem) {
    // If already exists, increase quantity
    existingItem.quantity += 1;
  } else {
    // If not, push a new item
    user.buy.push({ product: productId, quantity: 1 });
  }

   await user.save();    
   req.flash("success","Proceeding to checkout for this item");
   res.redirect('/payment/user');
})

router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
     let success=req.flash("success");
     let error= req.flash('error');
    res.render('productDetails', { product,success,error});
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

router.get('/increase/:id',isLoggedin,async function(req,res){
   let user=await userModel.findOne({email:req.user.email});
    const productId = req.params.id;
   if (!user.cart) {
      user.cart = [];
   }

  const existingItem = user.cart.find(item => String(item.product) === String(productId));
  if (existingItem) {
    // If already exists, increase quantity
    existingItem.quantity += 1;
  } else {
    // If not, push a new item
    user.cart.push({ product: productId, quantity: 1 });
  }

   await user.save();    

   res.redirect("/cart");
})

router.get('/decrease/:id',isLoggedin,async function(req,res){
   let user=await userModel.findOne({email:req.user.email});
    const productId = req.params.id;
   if (!user.cart) {
      user.cart = [];
   }

  const existingItem = user.cart.find(item => String(item.product) === String(productId));

  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
    } else {
      // remove item completely if quantity is 1
      const index = user.cart.indexOf(existingItem);
      if (index !== -1) {
        user.cart.splice(index, 1);
      }
    }
   }
   await user.save();    

   res.redirect("/cart");
})

router.get('/cart',isLoggedin,async function(req,res){
  if (!req.user) {
  return res.status(401).send("Unauthorized");
}
   let user=await userModel.findOne({email:req.user.email}).populate("cart.product");
  
   let bill = 0;
  user.cart.forEach(item => {
    const price = item.product?.price || 0;
    const discount = item.product?.discount || 0;
    const quantity = item.quantity || 1;
    bill += (price - discount) * quantity;
  });

  // Add a flat delivery charge (optional)
  bill += 20;

//   if (user.cart[0]?.product?.image) {
//   console.log(user.cart[0].product.image.toString('base64'));
// } else {
//   console.log("Product or product image not found");
//}
   user.save();
   res.render('cart',{user,bill});
})

router.get('/payment/user', isLoggedin, async function(req, res) {
   const user = await userModel.findOne({ email: req.user.email });
   const addressConfirmed = req.session.addressConfirmed || false;
    let success = req.flash('success');
   res.render('payment',{user,addressConfirmed,success});
});

router.post('/placeorder', isLoggedin, async function (req, res) {
  const user = await userModel.findOne({ email: req.user.email });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/shop");
  }

  let itemsToOrder = [];

  if (user.buy.length > 0) {
    itemsToOrder = [...user.buy];
    user.buy = []; // Clear the buy array
  } else if (user.cart.length > 0) {
    itemsToOrder = [...user.cart];
    user.cart = []; // Clear the cart
  } else {
    req.flash("error", "No items to place order.");
    return res.redirect("/shop");
  }
 
  for (let item of itemsToOrder) {
     const product = await productModel.findById(item.product);

    if (!product) continue;

    if (product.inStock < item.quantity) {
      req.flash("error", `Not enough stock for "${product.name}". Only ${product.inStock} Available.`);
      return res.redirect("/shop");
    }

       // Add to orders
    user.orders.push({
      product: item.product,
      quantity: item.quantity,
      date: new Date(),
    });
  
   // Decrease stock
    if (product) {
      product.inStock = Math.max(0, product.inStock - item.quantity);
      await product.save();
    }
  }
  await user.save();

  req.flash("success", "Order placed successfully!");
  req.session.addressConfirmed = false;
  res.redirect("/shop");
});

router.get('/account', isLoggedin, async function(req, res) {
  const user = await userModel.findOne({ email: req.user.email }).populate("orders.product");
  let orders=user.orders;
  res.render('account', {user ,orders});
});

router.post('/address', isLoggedin, async function(req, res) {
    const {street, city, state,pinCode,country} = req.body;
 await userModel.findOneAndUpdate(  
   { email: req.user.email },
   { 
   address: {
     street, 
     city, 
     state,
     pinCode,
     country
   }
},
  {new:true}
);
  res.redirect('/account');
});

router.get('/confirm',isLoggedin,function(req,res){
    req.session.addressConfirmed = true; // Mark address as confirmed
    req.flash('success', 'Address confirmed');
   res.redirect('/payment/user');
})

export default router;