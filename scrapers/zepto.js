const puppeteer = require('puppeteer');

const ZEPTO_URL = 'https://www.zepto.com';

// Mock data for fallback
const mockData = [
  {
    name: 'Premium Red Apples - 1kg',
    description: 'Fresh apples',
    price: '130',
    image: 'https://via.placeholder.com/150?text=ZeptoApples',
    url: 'https://www.zepto.com',
  },
  {
    name: 'Yellow Bananas - 5 pcs',
    description: 'Fresh bananas',
    price: '40',
    image: 'https://via.placeholder.com/150?text=ZeptoBananas',
    url: 'https://www.zepto.com',
  },
  {
    name: 'Black Grapes - 400g',
    description: 'Fresh grapes',
    price: '95',
    image: 'https://via.placeholder.com/150?text=ZeptoGrapes',
    url: 'https://www.zepto.com',
  },
  {
    name: 'Juicy Oranges - 1kg',
    description: 'Sweet oranges',
    price: '80',
    image: 'https://via.placeholder.com/150?text=ZeptoOranges',
    url: 'https://www.zepto.com',
  },
  {
    name: 'Red Pomegranate - 600g',
    description: 'Premium pomegranate',
    price: '110',
    image: 'https://via.placeholder.com/150?text=ZeptoPomegranate',
    url: 'https://www.zepto.com',
  },
];

const search = async (productName, limit = 5) => {
  let browser;
  try {
    console.log(`⚡ Searching Zepto for: ${productName}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS_BROWSER !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to Zepto
    const searchUrl = `${ZEPTO_URL}/search?q=${encodeURIComponent(productName)}`;
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
            url: linkEl?.href || ZEPTO_URL,
          });
        }
      });

      return items;
    });

    await browser.close();

    // Return mock data if no products found (for POC)
    if (products.length === 0) {
      console.warn('⚠️ No products found on Zepto, returning mock data');
      return mockData.slice(0, limit);
    }

    return products.slice(0, limit);
  } catch (error) {
    console.error('❌ Zepto scraper error:', error.message);
    if (browser) await browser.close();
    // Return mock data on error
    return mockData.slice(0, limit);
  }
};

module.exports = { search };
