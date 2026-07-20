const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create product
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, category, price, description, images, threeSixtyImages } = req.body;
    
    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    const product = new Product({
      name,
      category,
      price,
      description,
      images,
      threeSixtyImages
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update product
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, category, price, description, images, threeSixtyImages } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = images;
    if (threeSixtyImages !== undefined) product.threeSixtyImages = threeSixtyImages;

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE product
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
