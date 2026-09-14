const puppeteer = require('puppeteer');

const INSTAMART_URL = 'https://www.instamart.in';

// Mock data for fallback
const mockData = [
  {
    name: 'Kashmiri Red Apples - 1kg',
    description: 'Premium apples',
    price: '135',
    image: 'https://via.placeholder.com/150?text=InstamartApples',
    url: 'https://www.instamart.in',
  },
  {
    name: 'Golden Bananas - 750g',
    description: 'Fresh bananas',
    price: '50',
    image: 'https://via.placeholder.com/150?text=InstamartBananas',
    url: 'https://www.instamart.in',
  },
  {
    name: 'Purple Grapes - 500g',
    description: 'Fresh grapes',
    price: '100',
    image: 'https://via.placeholder.com/150?text=InstamartGrapes',
    url: 'https://www.instamart.in',
  },
  {
    name: 'Sweet Oranges - 1kg',
    description: 'Juicy oranges',
    price: '70',
    image: 'https://via.placeholder.com/150?text=InstamartOranges',
    url: 'https://www.instamart.in',
  },
  {
    name: 'Sweet Pomegranate - 500g',
    description: 'Premium pomegranate',
    price: '105',
    image: 'https://via.placeholder.com/150?text=InstamartPomegranate',
    url: 'https://www.instamart.in',
  },
];

const search = async (productName, limit = 5) => {
  let browser;
  try {
    console.log(`📦 Searching Instamart for: ${productName}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS_BROWSER !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to Instamart
    const searchUrl = `${INSTAMART_URL}/search?q=${encodeURIComponent(productName)}`;
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
            url: linkEl?.href || INSTAMART_URL,
          });
        }
      });

      return items;
    });

    await browser.close();

    // Return mock data if no products found (for POC)
    if (products.length === 0) {
      console.warn('⚠️ No products found on Instamart, returning mock data');
      return mockData.slice(0, limit);
    }

    return products.slice(0, limit);
  } catch (error) {
    console.error('❌ Instamart scraper error:', error.message);
    if (browser) await browser.close();
    // Return mock data on error
    return mockData.slice(0, limit);
  }
};

module.exports = { search };
