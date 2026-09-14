const express = require('express');
const router = express.Router();
const blinkitScraper = require('../scrapers/blinkit');
const zeptoScraper = require('../scrapers/zepto');
const instamartScraper = require('../scrapers/instamart');

// Combined search from all platforms
router.get('/search', async (req, res) => {
  try {
    const { product, limit = 5 } = req.query;

    if (!product) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    console.log(`🔍 Searching for: ${product}`);

    // Fetch from all platforms in parallel
    const [blinkitProducts, zeptoProducts, instamartProducts] = await Promise.allSettled([
      blinkitScraper.search(product, limit),
      zeptoScraper.search(product, limit),
      instamartScraper.search(product, limit),
    ]);

    const results = {
      blinkit: blinkitProducts.status === 'fulfilled' ? blinkitProducts.value : [],
      zepto: zeptoProducts.status === 'fulfilled' ? zeptoProducts.value : [],
      instamart: instamartProducts.status === 'fulfilled' ? instamartProducts.value : [],
    };

    res.json({
      query: product,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search products', message: error.message });
  }
});

module.exports = router;
