/**
 * Walmart price extractor
 * Extracts product data from Walmart product pages
 */

export interface WalmartProduct {
  productId: string;
  title: string;
  price: {
    current: number;
    currency: string;
    original?: number;
    wasPrice?: number; // "Was" price for comparison
  };
  imageUrl?: string;
  availability?: string;
  rating?: {
    value: number;
    count: number;
  };
  seller?: {
    name: string;
    type: 'walmart' | 'marketplace';
  };
  url: string;
}

/**
 * Check if current page is a Walmart product page
 */
export function isWalmartProductPage(): boolean {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  const isWalmartDomain = hostname.includes('walmart.com');
  const isProductPath = pathname.includes('/ip/');
  
  return isWalmartDomain && isProductPath;
}

/**
 * Extract Walmart product ID from URL
 */
function extractProductId(): string | null {
  // Walmart product IDs are at the end of URL: /ip/Product-Name/123456
  const pathname = window.location.pathname;
  const match = pathname.match(/\/ip\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract product title
 */
function extractTitle(): string | null {
  const selectors = [
    'h1[itemprop="name"]',
    'h1.prod-ProductTitle',
    'h1[data-automation-id="product-title"]',
    '.prod-title'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      return element.textContent.trim();
    }
  }
  
  return null;
}

/**
 * Parse price string to number
 */
function parsePrice(priceText: string): number | null {
  // Remove currency symbols and whitespace
  const cleaned = priceText
    .replace(/[$€£¥₹,\s]/g, '')
    .replace(/[A-Za-z]+/g, ''); // Remove "USD", "current", "now", etc.
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Extract price information
 */
function extractPrice(): { 
  current: number; 
  currency: string; 
  original?: number;
  wasPrice?: number;
} | null {
  // Strategy 1: Try structured data (JSON-LD)
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd?.textContent) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data.offers?.price) {
        return {
          current: parseFloat(data.offers.price),
          currency: data.offers.priceCurrency || 'USD',
          wasPrice: data.offers.highPrice ? parseFloat(data.offers.highPrice) : undefined
        };
      }
    } catch (e) {
      // Continue to fallback
    }
  }
  
  // Strategy 2: DOM selectors for current price
  const priceSelectors = [
    '[itemprop="price"]',
    '[data-automation-id="product-price"]',
    '.price-characteristic',
    'span[class*="price-main"]'
  ];
  
  let currentPrice: number | null = null;
  let currency = 'USD';
  
  for (const selector of priceSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const price = parsePrice(element.textContent);
      if (price !== null) {
        currentPrice = price;
        
        // Extract currency
        const currencyMatch = element.textContent.match(/\$|USD/);
        currency = currencyMatch ? 'USD' : currency;
        break;
      }
    }
  }
  
  if (currentPrice === null) {
    return null;
  }
  
  // Try to extract "was" price (strikethrough/original price)
  const wasPriceSelectors = [
    '[data-automation-id="product-was-price"]',
    '.price-old',
    'span[class*="strikethrough"]',
    '.was-price'
  ];
  
  let wasPrice: number | undefined;
  
  for (const selector of wasPriceSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const price = parsePrice(element.textContent);
      if (price !== null && price > currentPrice) {
        wasPrice = price;
        break;
      }
    }
  }
  
  return {
    current: currentPrice,
    currency,
    wasPrice
  };
}

/**
 * Extract product image URL
 */
function extractImageUrl(): string | null {
  const selectors = [
    'img[data-automation-id="product-image"]',
    'img[itemprop="image"]',
    '.prod-hero-image img',
    '[class*="product-image"] img'
  ];
  
  for (const selector of selectors) {
    const img = document.querySelector(selector) as HTMLImageElement;
    if (img?.src && !img.src.includes('placeholder')) {
      return img.src;
    }
  }
  
  return null;
}

/**
 * Extract availability status
 */
function extractAvailability(): string | null {
  const selectors = [
    '[data-automation-id="fulfillment-badge"]',
    '.prod-fulfillment-badge',
    '[class*="stock-status"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      return element.textContent.trim();
    }
  }
  
  // Check for "Add to Cart" button as proxy for availability
  const addToCart = document.querySelector('[data-automation-id="add-to-cart"]');
  if (addToCart) {
    return 'In Stock';
  }
  
  return null;
}

/**
 * Extract product rating
 */
function extractRating(): { value: number; count: number } | null {
  // Rating value
  const ratingElement = document.querySelector('[itemprop="ratingValue"], [data-automation-id="product-rating"]');
  const ratingText = ratingElement?.textContent;
  const value = ratingText ? parseFloat(ratingText) : null;
  
  if (value === null || isNaN(value)) {
    return null;
  }
  
  // Review count
  const countElement = document.querySelector('[itemprop="reviewCount"], [data-automation-id="reviews-count"]');
  const countText = countElement?.textContent;
  const countMatch = countText?.match(/(\d+)/);
  const count = countMatch ? parseInt(countMatch[1]) : 0;
  
  return {
    value,
    count
  };
}

/**
 * Extract seller information
 */
function extractSeller(): { name: string; type: 'walmart' | 'marketplace' } | null {
  const selectors = [
    '[data-automation-id="seller-name"]',
    '.prod-seller-name',
    '[class*="seller"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const name = element.textContent.trim();
      const isMarketplace = name.toLowerCase() !== 'walmart.com' && 
                           name.toLowerCase() !== 'walmart';
      
      return {
        name,
        type: isMarketplace ? 'marketplace' : 'walmart'
      };
    }
  }
  
  // Default to Walmart if not found
  return {
    name: 'Walmart',
    type: 'walmart'
  };
}

/**
 * Main extraction function
 */
export function extractWalmartProduct(): WalmartProduct | null {
  if (!isWalmartProductPage()) {
    return null;
  }
  
  const productId = extractProductId();
  if (!productId) {
    console.error('[Walmart Extractor] Failed to extract product ID');
    return null;
  }
  
  const title = extractTitle();
  if (!title) {
    console.error('[Walmart Extractor] Failed to extract title');
    return null;
  }
  
  const price = extractPrice();
  if (!price) {
    console.error('[Walmart Extractor] Failed to extract price');
    return null;
  }
  
  return {
    productId,
    title,
    price,
    imageUrl: extractImageUrl() || undefined,
    availability: extractAvailability() || undefined,
    rating: extractRating() || undefined,
    seller: extractSeller() || undefined,
    url: window.location.href
  };
}
