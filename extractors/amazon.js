// Amazon Product Extractor
// Fallback DOM parsing - no Chrome AI dependency

/**
 * Extract product information from Amazon product page
 * @param {Document} doc - Document object
 * @returns {Object|null} Product info or null if extraction failed
 */
export function extractAmazonProduct(doc = document) {
  try {
    const productInfo = {
      retailer: 'amazon',
      url: window.location.href.split('?')[0],
      timestamp: Date.now()
    };

    // Extract price
    productInfo.price = extractPrice(doc);
    if (!productInfo.price) {
      console.warn('Amazon: Could not extract price');
      return null;
    }

    // Extract title
    productInfo.title = extractTitle(doc);
    if (!productInfo.title) {
      console.warn('Amazon: Could not extract title');
      return null;
    }

    // Extract optional fields
    productInfo.image = extractImage(doc);
    productInfo.rating = extractRating(doc);
    productInfo.reviewCount = extractReviewCount(doc);
    productInfo.asin = extractASIN(doc);
    productInfo.currency = 'USD';

    return productInfo;
  } catch (error) {
    console.error('Amazon extraction failed:', error);
    return null;
  }
}

/**
 * Extract price from Amazon page
 * Multiple fallback methods
 */
function extractPrice(doc) {
  // Method 1: Standard price structure
  const wholeSelector = '.a-price-whole';
  const fractionSelector = '.a-price-fraction';
  
  const whole = doc.querySelector(wholeSelector)?.textContent?.trim();
  const fraction = doc.querySelector(fractionSelector)?.textContent?.trim();
  
  if (whole && fraction) {
    const priceStr = `${whole}.${fraction}`.replace(/[^\d.]/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price)) {
      return price;
    }
  }

  // Method 2: Alternative price selectors
  const altSelectors = [
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
    '#price_inside_buybox'
  ];

  for (const selector of altSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const match = text.match(/\$\s*([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(',', ''));
        if (!isNaN(price)) {
          return price;
        }
      }
    }
  }

  // Method 3: Regex scan of entire page (last resort)
  const bodyText = doc.body.innerHTML;
  const matches = bodyText.match(/\$\s*([\d,]+\.\d{2})/g);
  if (matches && matches.length > 0) {
    // Take the first reasonable price (between $1 and $100,000)
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
    '#productTitle',
    '#title',
    'h1.a-size-large',
    'span#productTitle'
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
    '#landingImage',
    '#imgBlkFront',
    '#ebooksImgBlkFront',
    '#main-image',
    'img[data-a-image-name="landingImage"]'
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
    '#acrPopover',
    '.a-icon-alt',
    '[data-hook="rating-out-of-text"]'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent || element.getAttribute('title') || '';
      const match = text.match(/([\d.]+)\s*out of/i);
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
 * Extract review count
 */
function extractReviewCount(doc) {
  const selectors = [
    '#acrCustomerReviewText',
    '[data-hook="total-review-count"]',
    '.a-size-base.a-link-normal'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const match = text.match(/([\d,]+)\s*ratings?/i);
      if (match) {
        const count = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(count)) {
          return count;
        }
      }
    }
  }

  return null;
}

/**
 * Extract ASIN (Amazon Standard Identification Number)
 */
function extractASIN(doc) {
  // Method 1: From URL
  const url = window.location.href;
  const urlMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Method 2: From page meta
  const metaSelectors = [
    'input[name="ASIN"]',
    '[data-asin]'
  ];

  for (const selector of metaSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const asin = element.value || element.getAttribute('data-asin');
      if (asin && asin.length === 10) {
        return asin;
      }
    }
  }

  return null;
}

/**
 * Check if current page is an Amazon product page
 */
export function isAmazonProductPage() {
  const url = window.location.href;
  return url.includes('amazon.com') && 
         (url.includes('/dp/') || url.includes('/gp/product/'));
}
