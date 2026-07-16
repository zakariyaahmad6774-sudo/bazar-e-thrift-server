const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const { category, size, condition, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (category) filter.category = { $in: category.split(',') };
    if (size) filter.size = { $in: size.split(',') };
    if (condition) filter.condition = { $in: condition.split(',') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lt = Number(maxPrice);
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/stats/summary', adminAuth, async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const sold = await Product.countDocuments({ isSold: true });
    res.json({ total, sold, available: total - sold });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(6);
    res.json({ product, related });
  } catch (err) {
    res.status(400).json({ error: 'Invalid product id' });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/sold', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.isSold = !product.isSold;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
