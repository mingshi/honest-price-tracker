// eBay Product Extractor
// Fallback DOM parsing - no Chrome AI dependency

/**
 * Extract product information from eBay product page
 * @param {Document} doc - Document object
 * @returns {Object|null} Product info or null if extraction failed
 */
export function extractEbayProduct(doc = document) {
  try {
    const productInfo = {
      retailer: 'ebay',
      url: window.location.href.split('?')[0],
      timestamp: Date.now()
    };

    // Extract price
    productInfo.price = extractPrice(doc);
    if (!productInfo.price) {
      console.warn('eBay: Could not extract price');
      return null;
    }

    // Extract title
    productInfo.title = extractTitle(doc);
    if (!productInfo.title) {
      console.warn('eBay: Could not extract title');
      return null;
    }

    // Extract optional fields
    productInfo.image = extractImage(doc);
    productInfo.condition = extractCondition(doc);
    productInfo.listingType = extractListingType(doc);
    productInfo.currency = 'USD';

    return productInfo;
  } catch (error) {
    console.error('eBay extraction failed:', error);
    return null;
  }
}

/**
 * Extract price from eBay page
 * Handles both auction and Buy It Now formats
 */
function extractPrice(doc) {
  // Method 1: Buy It Now price
  const buyNowSelectors = [
    '.x-price-primary .ux-textspans',
    '[itemprop="price"]',
    '.x-price-approx .ux-textspans'
  ];

  for (const selector of buyNowSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const match = text.match(/US\s*\$\s*([\d,]+\.?\d*)/i) || 
                    text.match(/\$\s*([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(',', ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
  }

  // Method 2: Auction current bid
  const auctionSelectors = [
    '[data-testid="x-price-primary"]',
    '.vi-VR-cvipPrice',
    '#prcIsum'
  ];

  for (const selector of auctionSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      const match = text.match(/\$\s*([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(',', ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }
  }

  // Method 3: Regex scan (last resort)
  const bodyText = doc.body.innerHTML;
  const matches = bodyText.match(/US\s*\$\s*([\d,]+\.\d{2})/gi);
  if (matches && matches.length > 0) {
    const price = parseFloat(matches[0].replace(/[^\d.]/g, ''));
    if (!isNaN(price) && price > 0 && price < 100000) {
      return price;
    }
  }

  return null;
}

/**
 * Extract product title
 */
function extractTitle(doc) {
  const selectors = [
    '.x-item-title__mainTitle .ux-textspans',
    'h1.x-item-title__mainTitle',
    '[itemprop="name"]',
    '.it-ttl'
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
    '.ux-image-carousel-item img',
    '[itemprop="image"]',
    '#icImg',
    '.img img'
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
 * Extract item condition (new, used, refurbished, etc.)
 */
function extractCondition(doc) {
  const selectors = [
    '.x-item-condition-text .ux-textspans',
    '[itemprop="itemCondition"]',
    '.condText'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const condition = element.textContent.trim();
      if (condition.length > 0) {
        return condition;
      }
    }
  }

  return null;
}

/**
 * Extract listing type (Auction or Buy It Now)
 */
function extractListingType(doc) {
  // Check for "Buy It Now" button
  const buyNowBtn = doc.querySelector('[data-testid="ux-call-to-action"]');
  if (buyNowBtn && buyNowBtn.textContent.includes('Buy It Now')) {
    return 'Buy It Now';
  }

  // Check for "Place bid" button
  const bidBtn = doc.querySelector('.vi-bb-bidBtn');
  if (bidBtn) {
    return 'Auction';
  }

  // Check for "Best Offer" text
  const bodyText = doc.body.textContent;
  if (bodyText.includes('or Best Offer')) {
    return 'Buy It Now or Best Offer';
  }

  return 'Unknown';
}

/**
 * Check if current page is an eBay product page
 */
export function isEbayProductPage() {
  const url = window.location.href;
  return url.includes('ebay.com') && url.includes('/itm/');
}
