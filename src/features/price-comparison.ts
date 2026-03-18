/**
 * Cross-platform price comparison
 * Searches for the same product on other retailers and compares prices
 */

// Import search functionality
import { searchProduct } from './search-api';

export interface PriceComparison {
  retailer: 'amazon' | 'ebay' | 'walmart';
  productId: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  imageUrl?: string;
  availability?: string;
  shippingCost?: number;
  totalPrice?: number; // price + shipping
}

export interface ComparisonResult {
  currentRetailer: string;
  currentProduct: PriceComparison;
  otherPrices: PriceComparison[];
  lowestPrice: PriceComparison;
  savings?: number; // How much you save compared to current
}

/**
 * Compare current product with prices on other retailers
 */
export async function comparePrice(
  currentRetailer: string,
  productTitle: string,
  productPrice: number,
  productId: string,
  productUrl: string
): Promise<ComparisonResult> {
  const currentProduct: PriceComparison = {
    retailer: currentRetailer as any,
    productId,
    title: productTitle,
    price: productPrice,
    currency: 'USD',
    url: productUrl
  };
  
  // Get list of other retailers to check
  const allRetailers = ['amazon', 'ebay', 'walmart'];
  const otherRetailers = allRetailers.filter(r => r !== currentRetailer) as Array<'amazon' | 'ebay' | 'walmart'>;
  
  // Search for product on other retailers
  const searchPromises = otherRetailers.map(retailer => 
    searchProduct(productTitle, retailer)
  );
  
  const searchResults = await Promise.all(searchPromises);
  const otherPrices = searchResults.filter(Boolean) as PriceComparison[];
  
  // Find lowest price
  const allPrices = [currentProduct, ...otherPrices];
  const lowestPrice = allPrices.reduce((lowest, current) => {
    const currentTotal = current.totalPrice || current.price;
    const lowestTotal = lowest.totalPrice || lowest.price;
    return currentTotal < lowestTotal ? current : lowest;
  });
  
  // Calculate savings
  const currentTotal = currentProduct.totalPrice || currentProduct.price;
  const lowestTotal = lowestPrice.totalPrice || lowestPrice.price;
  const savings = currentTotal > lowestTotal ? currentTotal - lowestTotal : undefined;
  
  return {
    currentRetailer,
    currentProduct,
    otherPrices,
    lowestPrice,
    savings
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const currencySymbol = currency === 'USD' ? '$' : currency;
  return `${currencySymbol}${price.toFixed(2)}`;
}

/**
 * Generate comparison summary text
 */
export function getComparisonSummary(result: ComparisonResult): string {
  if (!result.savings || result.savings <= 0) {
    return 'This is the best price we found!';
  }
  
  const savings = formatPrice(result.savings);
  const retailer = result.lowestPrice.retailer.toUpperCase();
  
  return `Save ${savings} on ${retailer}!`;
}
