/**
 * Background Service Worker
 * Handles price monitoring, notifications, and data synchronization
 */

console.log('Honest Price Tracker background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed - initializing...');
    // TODO: Initialize storage schema
    // TODO: Setup periodic price check alarm
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  switch (message.type) {
    case 'TRACK_PRODUCT':
      // TODO: Add product to tracking list
      sendResponse({ success: true });
      break;
    
    case 'GET_PRICE_HISTORY':
      // TODO: Retrieve price history from IndexedDB
      sendResponse({ history: [] });
      break;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// Setup periodic price check (every 6 hours)
chrome.alarms.create('price-check', { periodInMinutes: 360 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'price-check') {
    console.log('Running periodic price check...');
    // TODO: Check all tracked products for price changes
    // TODO: Send notifications if prices dropped
  }
});
