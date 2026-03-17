/**
 * Content Script
 * Runs on product pages to extract prices and inject UI
 */

import { extractAmazonProduct, isAmazonProductPage } from '../extractors/amazon';
import { injectPriceHistory } from './inject';

console.log('Honest Price Tracker content script loaded');

// Detect current retailer
const detectRetailer = (): string | null => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('amazon.com') || hostname.includes('amazon.')) return 'amazon';
  if (hostname.includes('ebay.com')) return 'ebay';
  if (hostname.includes('walmart.com')) return 'walmart';
  
  return null;
};

// Extract product data based on retailer
const extractProductData = (retailer: string) => {
  console.log(`Extracting product data for ${retailer}`);
  
  switch (retailer) {
    case 'amazon':
      // Verify this is a product page
      if (!isAmazonProductPage()) {
        console.log('Not an Amazon product page');
        return null;
      }
      
      const amazonResult = extractAmazonProduct();
      if (amazonResult.success && amazonResult.product) {
        console.log('Amazon product extracted:', amazonResult.product);
        return amazonResult.product;
      } else {
        console.error('Amazon extraction failed:', amazonResult.error);
        return null;
      }
    
    case 'ebay':
      // TODO: Implement eBay extractor
      console.log('eBay extraction not yet implemented');
      return null;
    
    case 'walmart':
      // TODO: Implement Walmart extractor
      console.log('Walmart extraction not yet implemented');
      return null;
    
    default:
      console.warn(`Unknown retailer: ${retailer}`);
      return null;
  }
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
  
  if (!productData) {
    console.log('Could not extract product data');
    return;
  }
  
  // Send to background for storage
  chrome.runtime.sendMessage({
    type: 'TRACK_PRODUCT',
    data: productData
  }, (response) => {
    if (response && response.success) {
      console.log('Product tracked successfully');
      // Inject UI after successful tracking
      injectPriceHistoryUI();
      
      // Also inject price history widget on product page
      if (retailer && productData.productId) {
        setTimeout(() => {
          injectPriceHistory(productData.productId, retailer);
        }, 1000); // Wait for page to settle
      }
    } else {
      console.error('Failed to track product:', response?.error);
    }
  });
};

// Listen for messages from background (for manual price extraction)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_PRICE') {
    console.log('Manual price extraction requested');
    
    const retailer = detectRetailer();
    if (!retailer) {
      sendResponse({ 
        type: 'PRICE_EXTRACTED',
        success: false, 
        error: 'Not on a supported retailer page' 
      });
      return;
    }
    
    const productData = extractProductData(retailer);
    
    if (productData) {
      // Send extracted price back to background
      chrome.runtime.sendMessage({
        type: 'PRICE_EXTRACTED',
        success: true,
        data: productData
      });
      
      sendResponse({ 
        type: 'PRICE_EXTRACTED',
        success: true, 
        data: productData 
      });
    } else {
      sendResponse({ 
        type: 'PRICE_EXTRACTED',
        success: false, 
        error: 'Could not extract product data' 
      });
    }
    
    return true;
  }
});

// Run when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also re-run on history changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, re-initializing...');
    setTimeout(init, 1000); // Wait for page to settle
  }
}).observe(document, { subtree: true, childList: true });
