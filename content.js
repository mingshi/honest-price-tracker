// Honest Price Tracker - Content Script
// Runs on Amazon, eBay, Walmart product pages

console.log('Honest Price Tracker: Content script loaded');

// Detect current retailer
const currentUrl = window.location.href;
let retailer = null;

if (currentUrl.includes('amazon.com')) {
  retailer = 'amazon';
} else if (currentUrl.includes('ebay.com')) {
  retailer = 'ebay';
} else if (currentUrl.includes('walmart.com')) {
  retailer = 'walmart';
}

if (!retailer) {
  console.log('Not a supported retailer page');
} else {
  console.log(`Detected retailer: ${retailer}`);
  initializePriceTracker();
}

// Initialize price tracking UI on product page
function initializePriceTracker() {
  // Extract product information
  const productInfo = extractProductInfo(retailer);
  
  if (productInfo) {
    console.log('Extracted product info:', productInfo);
    
    // Inject price history UI (TODO: Phase 2)
    injectPriceHistoryUI(productInfo);
    
    // Store current price in local history
    storePriceInHistory(productInfo);
  } else {
    console.log('Could not extract product info');
  }
}

// Extract product information based on retailer
function extractProductInfo(retailer) {
  try {
    if (retailer === 'amazon') {
      return extractAmazonProduct();
    } else if (retailer === 'ebay') {
      return extractEbayProduct();
    } else if (retailer === 'walmart') {
      return extractWalmartProduct();
    }
  } catch (error) {
    console.error('Error extracting product info:', error);
    return null;
  }
}

// Extract Amazon product information (Fallback DOM parsing)
function extractAmazonProduct() {
  // Method 1: Standard price structure
  const whole = document.querySelector('.a-price-whole')?.textContent?.trim();
  const fraction = document.querySelector('.a-price-fraction')?.textContent?.trim();
  
  let price = null;
  if (whole && fraction) {
    price = parseFloat(`${whole}.${fraction}`);
  } else {
    // Method 2: Regex fallback
    const priceText = document.body.innerHTML;
    const match = priceText.match(/\$\s*([\d,]+\.[\d]{2})/);
    if (match) {
      price = parseFloat(match[1].replace(',', ''));
    }
  }
  
  const title = document.querySelector('#productTitle')?.textContent?.trim();
  const image = document.querySelector('#landingImage')?.src || 
                document.querySelector('#imgBlkFront')?.src;
  const url = window.location.href.split('?')[0]; // Remove query params
  
  if (!price || !title) {
    return null;
  }
  
  return {
    retailer: 'amazon',
    title,
    price,
    currency: 'USD',
    image,
    url,
    timestamp: Date.now()
  };
}

// Extract eBay product information
function extractEbayProduct() {
  const priceElement = document.querySelector('.ux-textspans--BOLD');
  const priceText = priceElement?.textContent;
  const priceMatch = priceText?.match(/\$\s*([\d,.]+)/);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;
  
  const title = document.querySelector('.x-item-title__mainTitle')?.textContent?.trim();
  const image = document.querySelector('.ux-image-carousel-item img')?.src;
  const url = window.location.href.split('?')[0];
  
  if (!price || !title) {
    return null;
  }
  
  return {
    retailer: 'ebay',
    title,
    price,
    currency: 'USD',
    image,
    url,
    timestamp: Date.now()
  };
}

// Extract Walmart product information
function extractWalmartProduct() {
  const whole = document.querySelector('.price-characteristic')?.textContent?.trim();
  const fraction = document.querySelector('.price-mantissa')?.textContent?.trim();
  
  const price = (whole && fraction) ? parseFloat(`${whole}.${fraction}`) : null;
  const title = document.querySelector('[itemprop="name"]')?.textContent?.trim();
  const image = document.querySelector('[itemprop="image"]')?.src;
  const url = window.location.href.split('?')[0];
  
  if (!price || !title) {
    return null;
  }
  
  return {
    retailer: 'walmart',
    title,
    price,
    currency: 'USD',
    image,
    url,
    timestamp: Date.now()
  };
}

// Inject price history UI into product page
function injectPriceHistoryUI(productInfo) {
  // TODO: Phase 2 - Create and inject price chart
  console.log('Price history UI will be injected here (Phase 2)');
  
  // For now, just add a simple indicator
  const indicator = document.createElement('div');
  indicator.id = 'honest-price-tracker-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  indicator.innerHTML = `
    ✅ Honest Price Tracker Active<br>
    <small>Price: $${productInfo.price.toFixed(2)}</small>
  `;
  
  document.body.appendChild(indicator);
  
  // Remove after 3 seconds
  setTimeout(() => {
    indicator.remove();
  }, 3000);
}

// Store price in local history (IndexedDB in Phase 2)
async function storePriceInHistory(productInfo) {
  try {
    // For now, use chrome.storage.local
    // TODO: Phase 2 - Migrate to IndexedDB for better performance
    
    const storageKey = `priceHistory_${btoa(productInfo.url)}`;
    const { [storageKey]: history = [] } = await chrome.storage.local.get(storageKey);
    
    // Add current price to history
    history.push({
      price: productInfo.price,
      timestamp: productInfo.timestamp
    });
    
    // Keep only last 100 price points to save space
    const trimmedHistory = history.slice(-100);
    
    await chrome.storage.local.set({ [storageKey]: trimmedHistory });
    
    console.log('Price stored in history:', productInfo.price);
  } catch (error) {
    console.error('Error storing price history:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractProductInfo') {
    const info = extractProductInfo(retailer);
    sendResponse({ success: true, productInfo: info });
  }
});

console.log('Content script initialization complete');
