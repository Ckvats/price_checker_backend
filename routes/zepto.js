const express = require('express');
const router = express.Router();
const zeptoScraper = require('../scrapers/zepto');

// Search Zepto
router.get('/search', async (req, res) => {
  try {
    const { product, limit = 5 } = req.query;

    if (!product) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const products = await zeptoScraper.search(product, limit);
    res.json({
      platform: 'zepto',
      query: product,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Zepto search error:', error);
    res.status(500).json({ error: 'Failed to search Zepto', message: error.message });
  }
});

module.exports = router;
