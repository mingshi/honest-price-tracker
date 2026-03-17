/**
 * Popup UI Script
 * Displays tracked products and price history
 */

console.log('Honest Price Tracker popup loaded');

// Load tracked products
const loadTrackedProducts = async () => {
  // TODO: Fetch from background service worker
  // TODO: Render product list with price history
  console.log('Loading tracked products...');
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadTrackedProducts();
});
