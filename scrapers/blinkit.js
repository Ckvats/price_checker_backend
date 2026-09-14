const puppeteer = require('puppeteer');

const BLINKIT_URL = 'https://www.blinkit.com';

// Mock data for fallback
const mockData = [
  {
    name: 'Fresh Red Apples - 1kg',
    description: 'Premium quality apples',
    price: '120',
    image: 'https://via.placeholder.com/150?text=Apples',
    url: 'https://www.blinkit.com',
  },
  {
    name: 'Organic Bananas - 6 pcs',
    description: 'Fresh and ripe bananas',
    price: '45',
    image: 'https://via.placeholder.com/150?text=Bananas',
    url: 'https://www.blinkit.com',
  },
  {
    name: 'Green Grapes - 500g',
    description: 'Fresh green grapes',
    price: '85',
    image: 'https://via.placeholder.com/150?text=Grapes',
    url: 'https://www.blinkit.com',
  },
  {
    name: 'Sweet Oranges - 1kg',
    description: 'Juicy oranges',
    price: '75',
    image: 'https://via.placeholder.com/150?text=Oranges',
    url: 'https://www.blinkit.com',
  },
  {
    name: 'Fresh Pomegranate - 500g',
    description: 'Sweet pomegranate',
    price: '95',
    image: 'https://via.placeholder.com/150?text=Pomegranate',
    url: 'https://www.blinkit.com',
  },
];

const search = async (productName, limit = 5) => {
  let browser;
  try {
    console.log(`🛒 Searching Blinkit for: ${productName}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS_BROWSER !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to Blinkit
    const searchUrl = `${BLINKIT_URL}/search?q=${encodeURIComponent(productName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract product data
    const products = await page.evaluate(() => {
      const items = [];
      const productElements = document.querySelectorAll('[class*="ProductCard"], [class*="product-item"]');

      productElements.forEach((element) => {
        const nameEl = element.querySelector('[class*="name"], h2, .product-name');
        const priceEl = element.querySelector('[class*="price"], .product-price');
        const imageEl = element.querySelector('img');
        const linkEl = element.querySelector('a');

        if (nameEl && priceEl) {
          items.push({
            name: nameEl.textContent?.trim() || 'Unknown',
            price: priceEl.textContent?.trim() || '0',
            image: imageEl?.src || 'https://via.placeholder.com/150',
            url: linkEl?.href || BLINKIT_URL,
          });
        }
      });

      return items;
    });

    await browser.close();

    // Return mock data if no products found (for POC)
    if (products.length === 0) {
      console.warn('⚠️ No products found on Blinkit, returning mock data');
      return mockData.slice(0, limit);
    }

    return products.slice(0, limit);
  } catch (error) {
    console.error('❌ Blinkit scraper error:', error.message);
    if (browser) await browser.close();
    // Return mock data on error
    return mockData.slice(0, limit);
  }
};

module.exports = { search };
