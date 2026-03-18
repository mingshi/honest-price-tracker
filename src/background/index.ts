/**
 * Background Service Worker
 * Handles price monitoring, notifications, and data synchronization
 */

import {
  initPriceMonitoring,
  handlePriceCheckAlarm,
  handleNotificationClick,
  checkProductNow,
  getMonitoringStats
} from './monitor';

import {
  saveProduct,
  getProduct,
  getAllProducts,
  deleteProduct,
  getPriceHistory,
  addAlert,
  getAlerts,
  TrackedProduct,
  PriceAlert
} from '../storage/db';

import { searchProduct } from '../features/search-api';
import { searchProductMock } from '../features/search-api-test';
import { searchProductReal } from '../features/search-api-real';

console.log('Honest Price Tracker background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed - initializing...');
    
    // Initialize price monitoring
    initPriceMonitoring();
    
    console.log('Initialization complete');
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'TRACK_PRODUCT': {
          // Add product to tracking list
          const productData = message.data;
          
          // Create or update tracked product
          const existingProduct = await getProduct(productData.id || `${productData.retailer}_${productData.productId}`);
          
          const trackedProduct: TrackedProduct = existingProduct ? {
            ...existingProduct,
            currentPrice: productData.price,
            lowestPrice: Math.min(existingProduct.lowestPrice, productData.price),
            highestPrice: Math.max(existingProduct.highestPrice, productData.price),
            lastChecked: Date.now(),
            checkCount: existingProduct.checkCount + 1,
            availability: productData.availability
          } : {
            id: `${productData.retailer}_${productData.productId}`,
            retailer: productData.retailer,
            productId: productData.productId,
            title: productData.title,
            url: productData.url,
            imageUrl: productData.imageUrl,
            currentPrice: productData.price,
            currency: productData.currency,
            lowestPrice: productData.price,
            highestPrice: productData.price,
            averagePrice: productData.price,
            firstTracked: Date.now(),
            lastChecked: Date.now(),
            checkCount: 1,
            availability: productData.availability
          };
          
          await saveProduct(trackedProduct);
          
          sendResponse({ success: true, product: trackedProduct });
          break;
        }
        
        case 'GET_TRACKED_PRODUCTS': {
          // Get all tracked products
          const products = await getAllProducts();
          sendResponse({ success: true, products });
          break;
        }
        
        case 'UNTRACK_PRODUCT': {
          // Remove product from tracking
          await deleteProduct(message.productId);
          sendResponse({ success: true });
          break;
        }
        
        case 'GET_PRICE_HISTORY': {
          // Retrieve price history for a product
          const history = await getPriceHistory(message.productId, message.limit || 100);
          sendResponse({ success: true, history });
          break;
        }
        
        case 'ADD_ALERT': {
          // Add price alert
          const alert: Omit<PriceAlert, 'id'> = {
            productKey: message.productKey,
            targetPrice: message.targetPrice,
            enabled: true,
            notified: false,
            createdAt: Date.now()
          };
          
          const alertId = await addAlert(alert);
          sendResponse({ success: true, alertId });
          break;
        }
        
        case 'GET_ALERTS': {
          // Get alerts for a product
          const alerts = await getAlerts(message.productKey);
          sendResponse({ success: true, alerts });
          break;
        }
        
        case 'CHECK_PRODUCT_NOW': {
          // Manually trigger price check for a product
          await checkProductNow(message.productId);
          sendResponse({ success: true });
          break;
        }
        
        case 'GET_MONITORING_STATS': {
          // Get monitoring statistics
          const stats = await getMonitoringStats();
          sendResponse({ success: true, stats });
          break;
        }
        
        case 'EXTRACT_PRICE': {
          // This message comes from monitor.ts offscreen tab
          // Content script should handle extraction and respond with PRICE_EXTRACTED
          sendResponse({ success: true });
          break;
        }
        
        case 'SEARCH_PRODUCT': {
          // Search for product on other retailers (called from popup)
          const { title, retailer } = message;
          console.log(`[Background] Searching: "${title}" on ${retailer}`);
          
          // Use mock data for now (real search is unstable)
          // Real search issues: incorrect URLs, $0.00 prices
          const result = await searchProductMock(title, retailer);
          console.log(`[Background] Using mock data:`, result);
          
          sendResponse({ success: true, result });
          break;
        }
        
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Handle alarms (price checking)
chrome.alarms.onAlarm.addListener((alarm) => {
  handlePriceCheckAlarm(alarm);
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  handleNotificationClick(notificationId);
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  handleNotificationClick(notificationId, buttonIndex);
});

// Initialize on service worker startup
initPriceMonitoring();
