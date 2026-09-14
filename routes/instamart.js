const express = require('express');
const router = express.Router();
const instamartScraper = require('../scrapers/instamart');

// Search Instamart
router.get('/search', async (req, res) => {
  try ={
    const { product, limit = 5 } = req.query;

    if (!product) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const products = await instamartScraper.search(product, limit);
    res.json({
      platform: 'instamart',
      query: product,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Instamart search error:', error);
    res.status(500).json({ error: 'Failed to search Instamart', message: error.message });
  }
});

module.exports = router;
