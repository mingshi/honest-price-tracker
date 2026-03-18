/**
 * eBay price extractor
 * Extracts product data from eBay product pages
 */

export interface EbayProduct {
  itemId: string;
  title: string;
  price: {
    current: number;
    currency: string;
    original?: number;
  };
  imageUrl?: string;
  condition?: string;
  shippingCost?: number;
  seller?: {
    name: string;
    rating?: number;
  };
  url: string;
}

/**
 * Check if current page is an eBay product page
 */
export function isEbayProductPage(): boolean {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // eBay product pages: /itm/... or /p/...
  const isEbayDomain = hostname.includes('ebay.com') || 
                       hostname.includes('ebay.co.uk') ||
                       hostname.includes('ebay.de');
  
  const isProductPath = pathname.includes('/itm/') || 
                        pathname.includes('/p/');
  
  return isEbayDomain && isProductPath;
}

/**
 * Extract eBay item ID from URL
 */
function extractItemId(): string | null {
  // eBay item IDs are in the URL: /itm/123456789 or /itm/Title/123456789
  const pathname = window.location.pathname;
  const match = pathname.match(/\/itm\/(?:[^/]+\/)?(\d+)/);
  if (match) {
    return match[1];
  }
  
  // Also check URL params
  const params = new URLSearchParams(window.location.search);
  return params.get('item') || params.get('itm');
}

/**
 * Extract product title
 */
function extractTitle(): string | null {
  const selectors = [
    'h1.x-item-title__mainTitle',
    'h1[class*="item-title"]',
    '.it-ttl',
    '#itemTitle',
    'h1.product-title'
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
    .replace(/[A-Za-z]+/g, ''); // Remove "USD", "EUR", etc.
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Extract price information
 */
function extractPrice(): { current: number; currency: string; original?: number } | null {
  // Strategy 1: Try structured data
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd?.textContent) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data.offers?.price) {
        return {
          current: parseFloat(data.offers.price),
          currency: data.offers.priceCurrency || 'USD'
        };
      }
    } catch (e) {
      // Continue to fallback
    }
  }
  
  // Strategy 2: DOM selectors for current price
  const priceSelectors = [
    '.x-price-primary span.ux-textspans',
    '[itemprop="price"]',
    '.notranslate.vi-VR-cvipPrice',
    '#prcIsum',
    '.price-value'
  ];
  
  for (const selector of priceSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const price = parsePrice(element.textContent);
      if (price !== null) {
        // Extract currency from text
        const currencyMatch = element.textContent.match(/[€£¥₹]|USD|EUR|GBP|JPY|INR/);
        const currency = currencyMatch ? currencyMatch[0] : 'USD';
        
        return {
          current: price,
          currency: currency === '$' ? 'USD' : currency
        };
      }
    }
  }
  
  // Strategy 3: Regex fallback
  const bodyText = document.body.textContent || '';
  const priceMatch = bodyText.match(/(?:US\s*)?(\$|€|£|¥|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (priceMatch) {
    const currency = priceMatch[1] === '$' ? 'USD' : priceMatch[1];
    const price = parsePrice(priceMatch[2]);
    if (price !== null) {
      return { current: price, currency };
    }
  }
  
  return null;
}

/**
 * Extract product image URL
 */
function extractImageUrl(): string | null {
  const selectors = [
    'img.ux-image-carousel-item.image',
    'img[itemprop="image"]',
    '#icImg',
    '.img-wrapper img'
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
 * Extract item condition
 */
function extractCondition(): string | null {
  const selectors = [
    '[class*="condition"]',
    '.x-item-condition-text',
    '.condText'
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
 * Extract shipping cost
 */
function extractShippingCost(): number | null {
  const selectors = [
    '.ux-labels-values--shipping .ux-textspans',
    '[data-testid="shipping-cost"]',
    '.shippingCost'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const text = element.textContent.toLowerCase();
      
      // Free shipping
      if (text.includes('free')) {
        return 0;
      }
      
      // Extract price
      const price = parsePrice(text);
      if (price !== null) {
        return price;
      }
    }
  }
  
  return null;
}

/**
 * Extract seller information
 */
function extractSeller(): { name: string; rating?: number } | null {
  const selectors = [
    '.ux-seller-section__item--seller a',
    '[data-testid="seller-name"]',
    '.mbg-nw'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const name = element.textContent.trim();
      
      // Try to extract rating
      const ratingElement = document.querySelector('.ux-seller-section__item--seller [class*="rating"]');
      const ratingText = ratingElement?.textContent;
      const rating = ratingText ? parseFloat(ratingText) : undefined;
      
      return {
        name,
        rating: rating && !isNaN(rating) ? rating : undefined
      };
    }
  }
  
  return null;
}

/**
 * Main extraction function
 */
export function extractEbayProduct(): EbayProduct | null {
  if (!isEbayProductPage()) {
    return null;
  }
  
  const itemId = extractItemId();
  if (!itemId) {
    console.error('[eBay Extractor] Failed to extract item ID');
    return null;
  }
  
  const title = extractTitle();
  if (!title) {
    console.error('[eBay Extractor] Failed to extract title');
    return null;
  }
  
  const price = extractPrice();
  if (!price) {
    console.error('[eBay Extractor] Failed to extract price');
    return null;
  }
  
  return {
    itemId,
    title,
    price,
    imageUrl: extractImageUrl() || undefined,
    condition: extractCondition() || undefined,
    shippingCost: extractShippingCost() || undefined,
    seller: extractSeller() || undefined,
    url: window.location.href
  };
}
