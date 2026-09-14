const express = require('express');
const router = express.Router();
const blinkitScraper = require('../scrapers/blinkit');

// Search Blinkit
router.get('/search', async (req, res) => {
  try {
    const { product, limit = 5 } = req.query;

    if (!product) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const products = await blinkitScraper.search(product, limit);
    res.json({
      platform: 'blinkit',
      query: product,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Blinkit search error:', error);
    res.status(500).json({ error: 'Failed to search Blinkit', message: error.message });
  }
});

module.exports = router;
