/**
 * Test search API with mock data
 * For debugging - returns mock results instead of real search
 */

import { PriceComparison } from './price-comparison';

/**
 * Generate mock search results for testing
 */
export function generateMockResult(
  title: string,
  retailer: 'amazon' | 'ebay' | 'walmart'
): PriceComparison {
  const basePrices = {
    amazon: 89.99,
    ebay: 94.50,
    walmart: 92.99
  };
  
  return {
    retailer,
    productId: `mock_${retailer}_123`,
    title: `${title} (${retailer.toUpperCase()} Search Result)`,
    price: basePrices[retailer],
    currency: 'USD',
    url: `https://www.${retailer}.com/test`,
    imageUrl: undefined
  };
}

/**
 * Search product with mock data (for testing)
 */
export async function searchProductMock(
  title: string,
  retailer: 'amazon' | 'ebay' | 'walmart'
): Promise<PriceComparison | null> {
  console.log(`[MOCK] Searching for "${title}" on ${retailer}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return generateMockResult(title, retailer);
}
