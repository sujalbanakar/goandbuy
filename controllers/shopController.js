// controllers/shopController.js
import productModel from '../models/productModel.js';

export async function showShop(req, res) {
  try {
    const { sortby } = req.query;

    let sortOption = {};
    if (sortby === 'newest') {
      sortOption = { createdAt: -1 }; // newest first
    }

    const products = await productModel.find().sort(sortOption);
    res.render('shop', { products });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).send("Failed to load products");
  }
}
