/**
 * Search API Integration
 * Searches for products across different retailers
 */

import { PriceComparison } from './price-comparison';

/**
 * Extract key product information from title for better search
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
 * Search Amazon for product
 */
async function searchAmazon(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keywords)}`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('Amazon search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Parse first search result
    const priceMatch = html.match(/data-component-type="s-search-result"[\s\S]*?<span class="a-price-whole">(\d+)<\/span><span class="a-price-fraction">(\d+)<\/span>/);
    const titleMatch = html.match(/data-component-type="s-search-result"[\s\S]*?<span class="a-size-[^"]*a-color-base a-text-normal">([^<]+)<\/span>/);
    const linkMatch = html.match(/data-component-type="s-search-result"[\s\S]*?<a class="a-link-normal[^"]*" href="([^"]+)"/);
    const imageMatch = html.match(/data-component-type="s-search-result"[\s\S]*?<img[^>]*src="([^"]+)"/);
    
    if (!priceMatch || !titleMatch || !linkMatch) {
      console.log('Amazon: Could not parse search results');
      return null;
    }
    
    const price = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
    const productTitle = titleMatch[1].trim();
    const productUrl = linkMatch[1].startsWith('http') 
      ? linkMatch[1] 
      : `https://www.amazon.com${linkMatch[1]}`;
    const imageUrl = imageMatch ? imageMatch[1] : undefined;
    
    // Extract ASIN from URL
    const asinMatch = productUrl.match(/\/dp\/([A-Z0-9]{10})/);
    const productId = asinMatch ? asinMatch[1] : 'unknown';
    
    return {
      retailer: 'amazon',
      productId,
      title: productTitle,
      price,
      currency: 'USD',
      url: productUrl,
      imageUrl
    };
  } catch (error) {
    console.error('Error searching Amazon:', error);
    return null;
  }
}

/**
 * Search eBay for product
 */
async function searchEbay(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords)}&_sop=15`; // Sort by lowest price
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('eBay search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Parse first search result (Buy It Now)
    const priceMatch = html.match(/<span class="s-item__price">(?:\$|USD )?([\d,]+\.\d{2})<\/span>/);
    const titleMatch = html.match(/<div class="s-item__title[^"]*"><span role="heading"[^>]*>([^<]+)<\/span><\/div>/);
    const linkMatch = html.match(/<a class="s-item__link" href="([^"]+)"/);
    const imageMatch = html.match(/<div class="s-item__image-wrapper[^"]*">[\s\S]*?<img[^>]*src="([^"]+)"/);
    
    if (!priceMatch || !titleMatch || !linkMatch) {
      console.log('eBay: Could not parse search results');
      return null;
    }
    
    const price = parseFloat(priceMatch[1].replace(',', ''));
    const productTitle = titleMatch[1].trim();
    const productUrl = linkMatch[1];
    const imageUrl = imageMatch ? imageMatch[1] : undefined;
    
    // Extract item ID from URL
    const itemIdMatch = productUrl.match(/\/itm\/(\d+)/);
    const productId = itemIdMatch ? itemIdMatch[1] : 'unknown';
    
    return {
      retailer: 'ebay',
      productId,
      title: productTitle,
      price,
      currency: 'USD',
      url: productUrl,
      imageUrl
    };
  } catch (error) {
    console.error('Error searching eBay:', error);
    return null;
  }
}

/**
 * Search Walmart for product
 */
async function searchWalmart(title: string): Promise<PriceComparison | null> {
  const keywords = extractSearchKeywords(title);
  const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(keywords)}&sort=price_low`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('Walmart search failed:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Walmart uses React/client-side rendering, need to parse JSON data
    const dataMatch = html.match(/<script[^>]*>window\.__WML_REDUX_INITIAL_STATE__\s*=\s*({[\s\S]+?});<\/script>/);
    
    if (!dataMatch) {
      console.log('Walmart: Could not find product data');
      return null;
    }
    
    try {
      const data = JSON.parse(dataMatch[1]);
      const items = data?.searchContent?.searchContent?.preso?.items;
      
      if (!items || items.length === 0) {
        console.log('Walmart: No items in search results');
        return null;
      }
      
      // Get first item with price
      const firstItem = items.find((item: any) => item.price);
      
      if (!firstItem) {
        console.log('Walmart: No items with price');
        return null;
      }
      
      return {
        retailer: 'walmart',
        productId: firstItem.usItemId || 'unknown',
        title: firstItem.name || title,
        price: parseFloat(firstItem.price),
        currency: 'USD',
        url: `https://www.walmart.com${firstItem.canonicalUrl}`,
        imageUrl: firstItem.imageInfo?.thumbnailUrl
      };
    } catch (parseError) {
      console.error('Error parsing Walmart data:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error searching Walmart:', error);
    return null;
  }
}

/**
 * Search product on specified retailer
 */
export async function searchProduct(
  title: string,
  retailer: 'amazon' | 'ebay' | 'walmart'
): Promise<PriceComparison | null> {
  console.log(`Searching for "${title}" on ${retailer}...`);
  
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

/**
 * Search product across all retailers (parallel)
 */
export async function searchAllRetailers(
  title: string,
  excludeRetailer?: string
): Promise<PriceComparison[]> {
  const retailers: Array<'amazon' | 'ebay' | 'walmart'> = ['amazon', 'ebay', 'walmart'];
  const targetRetailers = excludeRetailer 
    ? retailers.filter(r => r !== excludeRetailer)
    : retailers;
  
  const searchPromises = targetRetailers.map(retailer => searchProduct(title, retailer));
  const results = await Promise.all(searchPromises);
  
  return results.filter(Boolean) as PriceComparison[];
}
