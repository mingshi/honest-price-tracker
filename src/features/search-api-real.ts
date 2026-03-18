/**
 * Real search API with improved parsing strategies
 */

import { PriceComparison } from './price-comparison';

/**
 * Search Amazon (improved)
 * Uses multiple strategies to find first result
 */
async function searchAmazon(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keywords)}`;
  
  try {
    console.log('[Amazon] Searching:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      console.log('[Amazon] Search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    console.log('[Amazon] HTML received:', html.length, 'bytes');
    
    // Strategy 1: Try JSON-LD structured data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        if (data['@type'] === 'Product' || (data.itemListElement && data.itemListElement[0])) {
          const product = data.itemListElement ? data.itemListElement[0] : data;
          if (product.offers && product.offers.price) {
            console.log('[Amazon] Found via JSON-LD');
            return {
              retailer: 'amazon',
              productId: product.sku || 'unknown',
              title: product.name || title,
              price: parseFloat(product.offers.price),
              currency: 'USD',
              url: product.url || searchUrl,
              imageUrl: product.image
            };
          }
        }
      } catch (e) {
        console.log('[Amazon] JSON-LD parse failed:', e);
      }
    }
    
    // Strategy 2: Simple price extraction (any dollar amount)
    const simplePrice = html.match(/\$(\d+)\.(\d{2})/);
    if (simplePrice) {
      const price = parseFloat(`${simplePrice[1]}.${simplePrice[2]}`);
      console.log('[Amazon] Found simple price:', price);
      
      // Try to find product title
      const titleMatch = html.match(/<h2[^>]*>([^<]+)</);
      const productTitle = titleMatch ? titleMatch[1].trim() : title;
      
      return {
        retailer: 'amazon',
        productId: 'search_result',
        title: productTitle,
        price,
        currency: 'USD',
        url: searchUrl
      };
    }
    
    console.log('[Amazon] No price found');
    return null;
    
  } catch (error) {
    console.error('[Amazon] Error:', error);
    return null;
  }
}

/**
 * Search eBay (improved)
 */
async function searchEbay(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords)}&_sop=15`; // Sort by price
  
  try {
    console.log('[eBay] Searching:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.log('[eBay] Search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    console.log('[eBay] HTML received:', html.length, 'bytes');
    
    // Simple price extraction
    const priceMatch = html.match(/\$(\d+[\d,]*\.\d{2})/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(',', ''));
      console.log('[eBay] Found price:', price);
      
      return {
        retailer: 'ebay',
        productId: 'search_result',
        title: `${title} (eBay)`,
        price,
        currency: 'USD',
        url: searchUrl
      };
    }
    
    console.log('[eBay] No price found');
    return null;
    
  } catch (error) {
    console.error('[eBay] Error:', error);
    return null;
  }
}

/**
 * Search Walmart (improved)
 */
async function searchWalmart(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(keywords)}`;
  
  try {
    console.log('[Walmart] Searching:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.log('[Walmart] Search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    console.log('[Walmart] HTML received:', html.length, 'bytes');
    
    // Simple price extraction
    const priceMatch = html.match(/\$(\d+\.\d{2})/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      console.log('[Walmart] Found price:', price);
      
      return {
        retailer: 'walmart',
        productId: 'search_result',
        title: `${title} (Walmart)`,
        price,
        currency: 'USD',
        url: searchUrl
      };
    }
    
    console.log('[Walmart] No price found');
    return null;
    
  } catch (error) {
    console.error('[Walmart] Error:', error);
    return null;
  }
}

/**
 * Extract search keywords from title
 */
function extractSearchKeywords(title: string): string {
  // Remove common filler words
  const fillers = ['the', 'a', 'an', 'with', 'for', 'and', 'or', 'in', 'on'];
  const words = title.toLowerCase().split(/\s+/);
  const keywords = words.filter(w => !fillers.includes(w) && w.length > 2);
  
  // Take first 5-7 meaningful words
  return keywords.slice(0, 7).join(' ');
}

/**
 * Search product with real API
 */
export async function searchProductReal(
  title: string,
  retailer: 'amazon' | 'ebay' | 'walmart'
): Promise<PriceComparison | null> {
  console.log(`[Real Search] Searching for "${title}" on ${retailer}...`);
  
  switch (retailer) {
    case 'amazon':
      return searchAmazon(title);
    case 'ebay':
      return searchEbay(title);
    case 'walmart':
      return searchWalmart(title);
    default:
      return null;
  }
}
