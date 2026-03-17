/**
 * Amazon Product Extractor
 * Extracts product information from Amazon product pages
 */

export interface Product {
  retailer: 'amazon' | 'ebay' | 'walmart';
  title: string;
  price: number;
  currency: string;
  productId: string;
  url: string;
  imageUrl?: string;
  availability?: string;
  timestamp: number;
}

export interface ExtractionResult {
  success: boolean;
  product?: Product;
  error?: string;
}

/**
 * Extract product data from Amazon product page
 * Uses multiple selectors as fallback (Amazon changes their HTML frequently)
 */
export function extractAmazonProduct(): ExtractionResult {
  try {
    // Extract ASIN from URL or page
    const asin = extractASIN();
    if (!asin) {
      return { success: false, error: 'Could not extract ASIN from page' };
    }

    // Extract title
    const title = extractTitle();
    if (!title) {
      return { success: false, error: 'Could not extract product title' };
    }

    // Extract price (most critical)
    const priceResult = extractPrice();
    if (!priceResult.success) {
      return { success: false, error: priceResult.error };
    }

    // Extract image URL
    const imageUrl = extractImageUrl();

    // Extract availability
    const availability = extractAvailability();

    return {
      success: true,
      product: {
        retailer: 'amazon',
        title,
        price: priceResult.price!,
        currency: priceResult.currency!,
        productId: asin,
        url: window.location.href,
        imageUrl,
        availability,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Extraction failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Extract ASIN (Amazon Standard Identification Number)
 * Tries multiple methods
 */
function extractASIN(): string | null {
  // Method 1: From URL pattern /dp/ASIN or /gp/product/ASIN
  const urlMatch = window.location.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
  if (urlMatch) {
    return urlMatch[2];
  }

  // Method 2: From data-asin attribute
  const asinElement = document.querySelector('[data-asin]');
  if (asinElement) {
    const asin = asinElement.getAttribute('data-asin');
    if (asin && asin.length === 10) {
      return asin;
    }
  }

  // Method 3: From hidden input field
  const hiddenInput = document.querySelector('input[name="ASIN"]') as HTMLInputElement;
  if (hiddenInput && hiddenInput.value) {
    return hiddenInput.value;
  }

  return null;
}

/**
 * Extract product title
 * Tries multiple selectors (Amazon changes these frequently)
 */
function extractTitle(): string | null {
  const selectors = [
    '[id*="title"]',           // Wildcard: any element with "title" in id (WORKS!)
    '#productTitle',
    'h1[class*="title"]',      // Wildcard: any h1 with "title" in class
    '#title',
    'h1.product-title',
    '[data-feature-name="title"] h1',
    'span#productTitle',
    'h1'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      const title = element.textContent.trim();
      if (title.length > 10) { // Reasonable title length
        return title;
      }
    }
  }

  return null;
}

/**
 * Extract price with multiple fallback strategies
 * Amazon has complex price display logic
 */
function extractPrice(): { success: boolean; price?: number; currency?: string; error?: string } {
  // Strategy 1: Offscreen elements (most reliable, includes decimals)
  const offscreenSelectors = [
    '.a-price[data-a-color="price"] .a-offscreen',
    '.a-price .a-offscreen',
    '[class*="price"] .a-offscreen'
  ];
  
  for (const selector of offscreenSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const priceText = element.textContent || element.getAttribute('content');
      if (priceText) {
        const parsed = parsePrice(priceText);
        if (parsed.success) {
          return parsed;
        }
      }
    }
  }
  
  // Strategy 2: Combine whole + fraction parts
  const priceContainer = document.querySelector('.a-price[data-a-color="price"]') || 
                        document.querySelector('.a-price');
  if (priceContainer) {
    const wholeElem = priceContainer.querySelector('.a-price-whole');
    const fractionElem = priceContainer.querySelector('.a-price-fraction');
    
    if (wholeElem) {
      const wholeText = wholeElem.textContent?.trim() || '';
      const fractionText = fractionElem?.textContent?.trim() || '00';
      
      // Find currency symbol
      const symbolElem = priceContainer.querySelector('.a-price-symbol');
      const currency = symbolElem?.textContent?.trim() || '$';
      
      const combinedPrice = `${currency}${wholeText}.${fractionText}`;
      const parsed = parsePrice(combinedPrice);
      if (parsed.success) {
        return parsed;
      }
    }
  }
  
  // Strategy 3: Legacy price blocks
  const legacySelectors = [
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#priceblock_saleprice',
    '#corePrice_feature_div .a-price-whole'
  ];

  for (const selector of legacySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const priceText = element.textContent || element.getAttribute('content');
      if (priceText) {
        const parsed = parsePrice(priceText);
        if (parsed.success) {
          return parsed;
        }
      }
    }
  }

  // Strategy 2: Look for structured data (JSON-LD)
  const jsonLd = extractPriceFromJsonLd();
  if (jsonLd.success) {
    return jsonLd;
  }

  // Strategy 3: Regex scan of entire page for price patterns
  const regexResult = extractPriceWithRegex();
  if (regexResult.success) {
    return regexResult;
  }

  return { success: false, error: 'Could not find price on page' };
}

/**
 * Parse price text into number and currency
 * Handles formats like: "$12.99", "12,99 €", "¥1,234", etc.
 */
function parsePrice(priceText: string): { success: boolean; price?: number; currency?: string; error?: string } {
  // Remove whitespace
  priceText = priceText.trim();

  // Extract currency symbol
  const currencyMatch = priceText.match(/[$€£¥₹]/);
  const currency = currencyMatch ? currencyMatch[0] : 'USD';

  // Extract numeric value
  // Remove currency symbols, letters, and convert comma/dot separators
  let numericText = priceText.replace(/[^0-9.,]/g, '');

  // Handle different decimal separators
  // European format: 1.234,56 (dot for thousands, comma for decimal)
  // US format: 1,234.56 (comma for thousands, dot for decimal)
  if (numericText.includes(',') && numericText.includes('.')) {
    // Both present: determine which is decimal
    const lastComma = numericText.lastIndexOf(',');
    const lastDot = numericText.lastIndexOf('.');
    
    if (lastDot > lastComma) {
      // US format: 1,234.56
      numericText = numericText.replace(/,/g, '');
    } else {
      // EU format: 1.234,56
      numericText = numericText.replace(/\./g, '').replace(',', '.');
    }
  } else if (numericText.includes(',')) {
    // Only comma: assume decimal (EU format) or thousands (US format)
    // Heuristic: if comma is in last 3 positions, it's decimal
    const commaPos = numericText.lastIndexOf(',');
    if (numericText.length - commaPos <= 3) {
      numericText = numericText.replace(',', '.');
    } else {
      numericText = numericText.replace(/,/g, '');
    }
  }

  const price = parseFloat(numericText);

  if (isNaN(price) || price <= 0) {
    return { success: false, error: `Invalid price format: ${priceText}` };
  }

  return { success: true, price, currency };
}

/**
 * Try to extract price from JSON-LD structured data
 */
function extractPriceFromJsonLd(): { success: boolean; price?: number; currency?: string; error?: string } {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  
  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || '{}');
      
      // Look for offers
      if (data.offers && data.offers.price) {
        const price = parseFloat(data.offers.price);
        const currency = data.offers.priceCurrency || 'USD';
        
        if (!isNaN(price) && price > 0) {
          return { success: true, price, currency };
        }
      }

      // Check nested offers array
      if (Array.isArray(data.offers)) {
        for (const offer of data.offers) {
          if (offer.price) {
            const price = parseFloat(offer.price);
            const currency = offer.priceCurrency || 'USD';
            
            if (!isNaN(price) && price > 0) {
              return { success: true, price, currency };
            }
          }
        }
      }
    } catch (e) {
      // Invalid JSON, continue
      continue;
    }
  }

  return { success: false, error: 'No price in JSON-LD' };
}

/**
 * Last resort: scan page with regex for price patterns
 * WARNING: This can be unreliable, use only as last fallback
 */
function extractPriceWithRegex(): { success: boolean; price?: number; currency?: string; error?: string } {
  const bodyText = document.body.textContent || '';
  
  // Look for price patterns like: $12.99, €12,99, £12.99, ¥1234
  const patterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // $1,234.56
    /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // €1,234.56
    /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // £1,234.56
    /¥\s*(\d{1,3}(?:,\d{3})*)/,              // ¥1,234
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/, // 1,234.56 USD
  ];

  for (const pattern of patterns) {
    const match = bodyText.match(pattern);
    if (match) {
      const parsed = parsePrice(match[0]);
      if (parsed.success) {
        return parsed;
      }
    }
  }

  return { success: false, error: 'No price pattern found' };
}

/**
 * Extract product image URL
 */
function extractImageUrl(): string | undefined {
  const selectors = [
    '#landingImage',
    '#imgBlkFront',
    '#imageBlock img',
    '.a-dynamic-image',
    '[data-a-image-name="landingImage"]'
  ];

  for (const selector of selectors) {
    const img = document.querySelector(selector) as HTMLImageElement;
    if (img && img.src) {
      // Prefer larger image version
      return img.src.replace(/\._.*_\./, '._AC_SL1500_.');
    }
  }

  return undefined;
}

/**
 * Extract availability status
 */
function extractAvailability(): string | undefined {
  const selectors = [
    '#availability span',
    '#availability-brief',
    '.a-color-success',
    '.a-color-error'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }

  return undefined;
}

/**
 * Validate if current page is an Amazon product page
 */
export function isAmazonProductPage(): boolean {
  // Check URL pattern - primary indicator
  const isProductUrl = /amazon\.[a-z.]+\/(dp|gp\/product)\/[A-Z0-9]{10}/.test(window.location.href);
  
  // If URL matches, it's very likely a product page
  if (isProductUrl) {
    return true;
  }
  
  // Fallback: Check for product-specific elements (for edge cases)
  const hasProductTitle = document.querySelector('#productTitle') !== null;
  const hasPrice = document.querySelector('.a-price') !== null;
  const hasASIN = document.querySelector('[data-asin]') !== null;
  
  return hasProductTitle || hasPrice || hasASIN;
}
