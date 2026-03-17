// Honest Price Tracker - Background Service Worker
// All processing happens on-device, ZERO data upload

console.log('Honest Price Tracker: Background service worker started');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Honest Price Tracker: First install');
    // Open welcome page
    chrome.tabs.create({ url: 'welcome.html' });
    
    // Set up periodic price check alarm (every hour)
    chrome.alarms.create('priceCheck', {
      periodInMinutes: 60
    });
  } else if (details.reason === 'update') {
    console.log('Honest Price Tracker: Updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for alarms (periodic price checks)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'priceCheck') {
    console.log('Honest Price Tracker: Running scheduled price check');
    checkTrackedPrices();
  }
});

// Check all tracked products for price changes
async function checkTrackedPrices() {
  try {
    // Get tracked products from local storage
    const { trackedProducts } = await chrome.storage.local.get('trackedProducts');
    
    if (!trackedProducts || trackedProducts.length === 0) {
      console.log('No tracked products');
      return;
    }
    
    console.log(`Checking ${trackedProducts.length} tracked products...`);
    
    // TODO: Implement actual price checking logic in Phase 2
    // For now, just log
    
  } catch (error) {
    console.error('Error checking tracked prices:', error);
  }
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'trackProduct') {
    handleTrackProduct(message.product)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (message.action === 'getTrackedProducts') {
    getTrackedProducts()
      .then(products => sendResponse({ success: true, products }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Add a product to tracking list
async function handleTrackProduct(product) {
  try {
    const { trackedProducts = [] } = await chrome.storage.local.get('trackedProducts');
    
    // Check if product already tracked
    const exists = trackedProducts.find(p => p.url === product.url);
    if (exists) {
      return { message: 'Product already tracked' };
    }
    
    // Add product to tracking list
    trackedProducts.push({
      ...product,
      addedAt: Date.now(),
      lastChecked: Date.now()
    });
    
    await chrome.storage.local.set({ trackedProducts });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'Product Added',
      message: `Now tracking: ${product.title}`
    });
    
    return { message: 'Product added successfully' };
  } catch (error) {
    console.error('Error tracking product:', error);
    throw error;
  }
}

// Get all tracked products
async function getTrackedProducts() {
  const { trackedProducts = [] } = await chrome.storage.local.get('trackedProducts');
  return trackedProducts;
}

// Privacy commitment: Log what data we store
console.log('Privacy Notice: All data is stored locally in chrome.storage.local');
console.log('We NEVER upload your data. All processing happens on YOUR device.');
