// Walmart Product Extractor
// Fallback DOM parsing - no Chrome AI dependency

/**
 * Extract product information from Walmart product page
 * @param {Document} doc - Document object
 * @returns {Object|null} Product info or null if extraction failed
 */
export function extractWalmartProduct(doc = document) {
  try {
    const productInfo = {
      retailer: 'walmart',
      url: window.location.href.split('?')[0],
      timestamp: Date.now()
    };

    // Extract price
    productInfo.price = extractPrice(doc);
    if (!productInfo.price) {
      console.warn('Walmart: Could not extract price');
      return null;
    }

    // Extract title
    productInfo.title = extractTitle(doc);
    if (!productInfo.title) {
      console.warn('Walmart: Could not extract title');
      return null;
    }

    // Extract optional fields
    productInfo.image = extractImage(doc);
    productInfo.rating = extractRating(doc);
    productInfo.currency = 'USD';

    return productInfo;
  } catch (error) {
    console.error('Walmart extraction failed:', error);
    return null;
  }
}

/**
 * Extract price from Walmart page
 */
function extractPrice(doc) {
  // Method 1: Standard price structure
  const wholeSelector = '.price-characteristic';
  const fractionSelector = '.price-mantissa';
  
  const whole = doc.querySelector(wholeSelector)?.textContent?.trim();
  const fraction = doc.querySelector(fractionSelector)?.textContent?.trim();
  
  if (whole && fraction) {
    const priceStr = `${whole}.${fraction}`.replace(/[^\d.]/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      return price;
    }
  }

  // Method 2: Alternative selectors
  const altSelectors = [
    '[itemprop="price"]',
    '.price-group .price',
    '[data-automation-id="product-price"]',
    '.prod-PriceSection span[itemprop="price"]'
  ];

  for (const selector of altSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const match = text.match(/\$?\s*([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(',', ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
  }

  // Method 3: Meta tag
  const metaPrice = doc.querySelector('meta[itemprop="price"]');
  if (metaPrice) {
    const price = parseFloat(metaPrice.getAttribute('content'));
    if (!isNaN(price) && price > 0) {
      return price;
    }
  }

  // Method 4: Regex scan (last resort)
  const bodyText = doc.body.innerHTML;
  const matches = bodyText.match(/\$\s*([\d,]+\.\d{2})/g);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      const price = parseFloat(match.replace(/[$,]/g, ''));
      if (price >= 1 && price <= 100000) {
        return price;
      }
    }
  }

  return null;
}

/**
 * Extract product title
 */
function extractTitle(doc) {
  const selectors = [
    'h1[itemprop="name"]',
    '[data-automation-id="product-title"]',
    '.prod-ProductTitle',
    'h1.heading-a'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const title = element.textContent.trim();
      if (title.length > 0) {
        return title;
      }
    }
  }

  return null;
}

/**
 * Extract product image
 */
function extractImage(doc) {
  const selectors = [
    '[data-testid="hero-image-container"] img',
    'img[itemprop="image"]',
    '.prod-hero-image img',
    '.carousel-image img'
  ];

  for (const selector of selectors) {
    const img = doc.querySelector(selector);
    if (img && img.src) {
      return img.src;
    }
  }

  return null;
}

/**
 * Extract rating (out of 5 stars)
 */
function extractRating(doc) {
  const selectors = [
    '[itemprop="ratingValue"]',
    '[data-automation-id="product-rating-value"]',
    '.rating-number'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent || element.getAttribute('content') || '';
      const match = text.match(/([\d.]+)/);
      if (match) {
        const rating = parseFloat(match[1]);
        if (!isNaN(rating) && rating >= 0 && rating <= 5) {
          return rating;
        }
      }
    }
  }

  return null;
}

/**
 * Check if current page is a Walmart product page
 */
export function isWalmartProductPage() {
  const url = window.location.href;
  return url.includes('walmart.com') && 
         (url.includes('/ip/') || url.includes('/product/'));
}
