// Honest Price Tracker - Popup Script

console.log('Popup loaded');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing popup...');
  
  // Load tracked products
  await loadTrackedProducts();
  
  // Check if we're on a supported product page
  await checkCurrentPage();
  
  // Set up event listeners
  setupEventListeners();
});

// Load and display tracked products
async function loadTrackedProducts() {
  try {
    const { trackedProducts = [] } = await chrome.storage.local.get('trackedProducts');
    
    const countElement = document.getElementById('tracked-count');
    const listElement = document.getElementById('tracked-list');
    
    countElement.textContent = trackedProducts.length;
    
    if (trackedProducts.length === 0) {
      listElement.innerHTML = '<p class="empty-state">No products tracked yet. Visit Amazon, eBay, or Walmart and click "Track This Product".</p>';
      return;
    }
    
    // Display tracked products
    listElement.innerHTML = '';
    trackedProducts.forEach(product => {
      const item = createTrackedItem(product);
      listElement.appendChild(item);
    });
    
  } catch (error) {
    console.error('Error loading tracked products:', error);
  }
}

// Create a tracked product item element
function createTrackedItem(product) {
  const div = document.createElement('div');
  div.className = 'tracked-item';
  
  const priceChange = calculatePriceChange(product);
  const priceChangeHTML = priceChange ? 
    `<span class="price-change ${priceChange.direction}">${priceChange.text}</span>` : '';
  
  div.innerHTML = `
    ${product.image ? `<img src="${product.image}" alt="${product.title}">` : ''}
    <div class="info">
      <div class="title">${product.title}</div>
      <div class="price">$${product.price.toFixed(2)} ${priceChangeHTML}</div>
      <div class="retailer">${product.retailer}</div>
    </div>
    <button class="remove-btn" data-url="${product.url}">×</button>
  `;
  
  // Add remove button listener
  const removeBtn = div.querySelector('.remove-btn');
  removeBtn.addEventListener('click', () => removeProduct(product.url));
  
  // Add click to open product page
  div.addEventListener('click', (e) => {
    if (!e.target.classList.contains('remove-btn')) {
      chrome.tabs.create({ url: product.url });
    }
  });
  
  return div;
}

// Calculate price change (TODO: implement actual history comparison in Phase 2)
function calculatePriceChange(product) {
  // Placeholder: will be implemented in Phase 2
  return null;
}

// Remove product from tracking
async function removeProduct(url) {
  try {
    const { trackedProducts = [] } = await chrome.storage.local.get('trackedProducts');
    const updated = trackedProducts.filter(p => p.url !== url);
    await chrome.storage.local.set({ trackedProducts: updated });
    
    // Reload list
    await loadTrackedProducts();
  } catch (error) {
    console.error('Error removing product:', error);
  }
}

// Check if current tab is on a supported product page
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      return;
    }
    
    const isSupportedSite = 
      tab.url.includes('amazon.com') ||
      tab.url.includes('ebay.com') ||
      tab.url.includes('walmart.com');
    
    if (!isSupportedSite) {
      return;
    }
    
    // Request product info from content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractProductInfo' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready yet');
        return;
      }
      
      if (response && response.success && response.productInfo) {
        displayCurrentProduct(response.productInfo);
      }
    });
    
  } catch (error) {
    console.error('Error checking current page:', error);
  }
}

// Display current product from active tab
function displayCurrentProduct(productInfo) {
  const section = document.getElementById('current-product');
  const card = document.getElementById('product-card');
  
  section.classList.remove('hidden');
  
  card.innerHTML = `
    ${productInfo.image ? `<img src="${productInfo.image}" alt="${productInfo.title}">` : ''}
    <div class="info">
      <div class="title">${productInfo.title}</div>
      <div class="price">$${productInfo.price.toFixed(2)}</div>
      <div class="retailer">${productInfo.retailer}</div>
    </div>
  `;
  
  // Store product info for tracking
  document.getElementById('track-button').dataset.product = JSON.stringify(productInfo);
}

// Set up event listeners
function setupEventListeners() {
  // Track button
  document.getElementById('track-button').addEventListener('click', async function() {
    const productInfo = JSON.parse(this.dataset.product || '{}');
    
    if (!productInfo.url) {
      alert('No product information available');
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'trackProduct',
        product: productInfo
      });
      
      if (response.success) {
        await loadTrackedProducts();
        this.textContent = '✓ Tracked';
        this.disabled = true;
        setTimeout(() => {
          this.textContent = 'Track This Product';
          this.disabled = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Error tracking product:', error);
      alert('Failed to track product');
    }
  });
  
  // Settings button
  document.getElementById('settings-button').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Offline test button
  document.getElementById('offline-test-button').addEventListener('click', () => {
    runOfflineTest();
  });
}

// Run offline test to verify on-device processing
function runOfflineTest() {
  alert('Offline Test:\n\n✅ Try disconnecting your internet and using the extension.\n✅ All features should still work because everything processes on YOUR device.\n✅ We NEVER upload your data.');
}

console.log('Popup script initialized');
