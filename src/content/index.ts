/**
 * Content Script
 * Runs on product pages to extract prices and inject UI
 */

console.log('Honest Price Tracker content script loaded');

// Detect current retailer
const detectRetailer = (): string | null => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('amazon.com')) return 'amazon';
  if (hostname.includes('ebay.com')) return 'ebay';
  if (hostname.includes('walmart.com')) return 'walmart';
  
  return null;
};

// Extract product data based on retailer
const extractProductData = (retailer: string) => {
  // TODO: Implement retailer-specific extraction
  // This will call extractors/amazon.ts, extractors/ebay.ts, etc.
  console.log(`Extracting product data for ${retailer}`);
  
  return {
    retailer,
    title: 'TODO',
    price: 0,
    currency: 'USD',
    productId: 'TODO',
    url: window.location.href,
    timestamp: Date.now()
  };
};

// Inject price history UI
const injectPriceHistoryUI = () => {
  // TODO: Create and inject price chart overlay
  console.log('Injecting price history UI...');
};

// Main initialization
const init = () => {
  const retailer = detectRetailer();
  
  if (!retailer) {
    console.log('Not on a supported retailer page');
    return;
  }
  
  console.log(`Detected retailer: ${retailer}`);
  
  // Extract product data
  const productData = extractProductData(retailer);
  
  // Send to background for storage
  chrome.runtime.sendMessage({
    type: 'TRACK_PRODUCT',
    data: productData
  });
  
  // Inject UI
  injectPriceHistoryUI();
};

// Run when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
