/**
 * Popup UI Script
 * Displays tracked products and manages user interactions
 */

import { TrackedProduct, PriceAlert } from '../storage/db';
import { createPriceChart } from '../components/PriceChart';

// DOM Elements
let productListEl: HTMLElement;
let emptyStateEl: HTMLElement;
let loadingStateEl: HTMLElement;
let totalProductsEl: HTMLElement;
let activeAlertsEl: HTMLElement;
let totalSavingsEl: HTMLElement;
let refreshBtn: HTMLElement;
let settingsLink: HTMLElement;
let alertModal: HTMLElement;
let alertPriceInput: HTMLInputElement;
let currentPriceText: HTMLElement;
let saveAlertBtn: HTMLElement;
let cancelAlertBtn: HTMLElement;

// State
let products: TrackedProduct[] = [];
let currentProduct: TrackedProduct | null = null;

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  productListEl = document.getElementById('productList')!;
  emptyStateEl = document.getElementById('emptyState')!;
  loadingStateEl = document.getElementById('loadingState')!;
  totalProductsEl = document.getElementById('totalProducts')!;
  activeAlertsEl = document.getElementById('activeAlerts')!;
  totalSavingsEl = document.getElementById('totalSavings')!;
  refreshBtn = document.getElementById('refreshBtn')!;
  settingsLink = document.getElementById('settingsLink')!;
  alertModal = document.getElementById('alertModal')!;
  alertPriceInput = document.getElementById('alertPriceInput') as HTMLInputElement;
  currentPriceText = document.getElementById('currentPriceText')!;
  saveAlertBtn = document.getElementById('saveAlertBtn')!;
  cancelAlertBtn = document.getElementById('cancelAlertBtn')!;

  // Event listeners
  refreshBtn.addEventListener('click', handleRefresh);
  settingsLink.addEventListener('click', handleOpenSettings);
  saveAlertBtn.addEventListener('click', handleSaveAlert);
  cancelAlertBtn.addEventListener('click', handleCancelAlert);
  alertModal.addEventListener('click', (e) => {
    if (e.target === alertModal) {
      handleCancelAlert();
    }
  });

  // Load products
  await loadProducts();
});

/**
 * Load tracked products from storage
 */
async function loadProducts(): Promise<void> {
  try {
    showLoading(true);

    // Get products from background
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TRACKED_PRODUCTS'
    });

    if (response.success) {
      products = response.products || [];
      renderProducts();
      await updateStats();
    } else {
      console.error('Failed to load products:', response.error);
      showError('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showError('Error loading products');
  } finally {
    showLoading(false);
  }
}

/**
 * Render product list
 */
function renderProducts(): void {
  if (products.length === 0) {
    productListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
    return;
  }

  emptyStateEl.style.display = 'none';
  
  // Sort products by last checked (most recent first)
  const sortedProducts = [...products].sort((a, b) => b.lastChecked - a.lastChecked);

  productListEl.innerHTML = sortedProducts.map(product => createProductCard(product)).join('');

  // Add event listeners
  sortedProducts.forEach(product => {
    const card = document.querySelector(`[data-product-id="${product.id}"]`);
    if (!card) return;

    const viewBtn = card.querySelector('.btn-view');
    const alertBtn = card.querySelector('.btn-alert');
    const deleteBtn = card.querySelector('.btn-delete');
    const checkNowBtn = card.querySelector('.btn-check-now');
    const chartBtn = card.querySelector('.btn-chart');

    viewBtn?.addEventListener('click', () => handleViewProduct(product));
    alertBtn?.addEventListener('click', () => handleSetAlert(product));
    deleteBtn?.addEventListener('click', () => handleDeleteProduct(product));
    checkNowBtn?.addEventListener('click', () => handleCheckNow(product));
    chartBtn?.addEventListener('click', () => handleShowChart(product));
  });
}

/**
 * Create product card HTML
 */
function createProductCard(product: TrackedProduct): string {
  const priceChange = product.currentPrice - product.lowestPrice;
  const priceChangePercent = product.lowestPrice > 0 
    ? ((priceChange / product.lowestPrice) * 100).toFixed(1)
    : '0.0';

  const priceChangeClass = priceChange < 0 ? 'price-drop' : priceChange > 0 ? 'price-rise' : 'price-unchanged';
  const priceChangeIcon = priceChange < 0 ? '📉' : priceChange > 0 ? '📈' : '➡️';
  const priceChangeText = priceChange < 0 
    ? `${priceChangeIcon} ${Math.abs(Number(priceChangePercent))}% below lowest`
    : priceChange > 0
    ? `${priceChangeIcon} ${priceChangePercent}% above lowest`
    : `${priceChangeIcon} At lowest price`;

  const timeSinceCheck = getTimeSince(product.lastChecked);
  const savings = product.currentPrice - product.lowestPrice;

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-header">
        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.title}" class="product-image">` : '<div class="product-image"></div>'}
        <div class="product-info">
          <div class="product-title">${escapeHtml(product.title)}</div>
          <div class="product-retailer">${product.retailer}</div>
        </div>
      </div>
      
      <div class="product-price-section">
        <div class="product-price">
          <span class="current-price">${product.currency}${product.currentPrice.toFixed(2)}</span>
          <span class="price-change ${priceChangeClass}">${priceChangeText}</span>
        </div>
        <div class="price-stats">
          <div>Low: ${product.currency}${product.lowestPrice.toFixed(2)}</div>
          <div>High: ${product.currency}${product.highestPrice.toFixed(2)}</div>
          <div>Avg: ${product.currency}${product.averagePrice.toFixed(2)}</div>
        </div>
      </div>

      <div style="margin-top: 8px; font-size: 11px; color: #8899a6;">
        Checked ${timeSinceCheck} • ${product.checkCount} checks
        ${product.availability ? ` • ${product.availability}` : ''}
      </div>

      <div class="product-actions">
        <button class="btn btn-primary btn-view">View</button>
        <button class="btn btn-secondary btn-chart">📈 Chart</button>
        <button class="btn btn-secondary btn-alert">🔔 Alert</button>
        <button class="btn btn-secondary btn-check-now">🔄</button>
        <button class="btn btn-danger btn-delete">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Update statistics
 */
async function updateStats(): Promise<void> {
  totalProductsEl.textContent = products.length.toString();

  // Calculate total savings (difference between current and lowest)
  const totalSavings = products.reduce((sum, p) => {
    const saving = p.highestPrice - p.currentPrice;
    return sum + (saving > 0 ? saving : 0);
  }, 0);
  
  totalSavingsEl.textContent = `$${totalSavings.toFixed(2)}`;

  // Get active alerts count
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_MONITORING_STATS'
    });

    if (response.success && response.stats) {
      activeAlertsEl.textContent = response.stats.activeAlerts.toString();
    }
  } catch (error) {
    console.error('Error getting stats:', error);
  }
}

/**
 * Handle refresh button click
 */
async function handleRefresh(): Promise<void> {
  await loadProducts();
}

/**
 * Handle view product
 */
function handleViewProduct(product: TrackedProduct): void {
  chrome.tabs.create({ url: product.url });
}

/**
 * Handle set alert
 */
function handleSetAlert(product: TrackedProduct): void {
  currentProduct = product;
  currentPriceText.textContent = `${product.currency}${product.currentPrice.toFixed(2)}`;
  alertPriceInput.value = product.lowestPrice.toFixed(2);
  alertModal.style.display = 'flex';
  alertPriceInput.focus();
}

/**
 * Handle save alert
 */
async function handleSaveAlert(): Promise<void> {
  if (!currentProduct) return;

  const targetPrice = parseFloat(alertPriceInput.value);

  if (isNaN(targetPrice) || targetPrice <= 0) {
    alert('Please enter a valid price');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ADD_ALERT',
      productKey: currentProduct.id,
      targetPrice
    });

    if (response.success) {
      alert(`✅ Alert set! We'll notify you when the price drops to ${currentProduct.currency}${targetPrice.toFixed(2)}`);
      handleCancelAlert();
      await updateStats();
    } else {
      alert(`Failed to set alert: ${response.error}`);
    }
  } catch (error) {
    console.error('Error setting alert:', error);
    alert('Error setting alert');
  }
}

/**
 * Handle cancel alert
 */
function handleCancelAlert(): void {
  alertModal.style.display = 'none';
  currentProduct = null;
  alertPriceInput.value = '';
}

/**
 * Handle delete product
 */
async function handleDeleteProduct(product: TrackedProduct): Promise<void> {
  if (!confirm(`Stop tracking "${product.title}"?`)) {
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'UNTRACK_PRODUCT',
      productId: product.id
    });

    if (response.success) {
      await loadProducts();
    } else {
      alert(`Failed to delete: ${response.error}`);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product');
  }
}

/**
 * Handle check now
 */
async function handleCheckNow(product: TrackedProduct): Promise<void> {
  try {
    const btn = document.querySelector(`[data-product-id="${product.id}"] .btn-check-now`) as HTMLButtonElement;
    if (btn) {
      btn.textContent = '...';
      btn.disabled = true;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_PRODUCT_NOW',
      productId: product.id
    });

    if (response.success) {
      setTimeout(() => loadProducts(), 2000); // Reload after 2 seconds
    } else {
      alert(`Failed to check: ${response.error}`);
    }
  } catch (error) {
    console.error('Error checking product:', error);
    alert('Error checking product');
  }
}

/**
 * Handle show chart
 */
async function handleShowChart(product: TrackedProduct): Promise<void> {
  try {
    // Get price history
    const response = await chrome.runtime.sendMessage({
      type: 'GET_PRICE_HISTORY',
      productId: product.id,
      limit: 30 // Last 30 price points
    });

    if (!response.success) {
      alert(`Failed to load price history: ${response.error}`);
      return;
    }

    const priceHistory = response.history || [];

    if (priceHistory.length === 0) {
      alert('No price history available yet. The extension will record prices over time.');
      return;
    }

    // Show chart modal
    showChartModal(product, priceHistory);
  } catch (error) {
    console.error('Error loading price history:', error);
    alert('Error loading price history');
  }
}

/**
 * Show chart in modal
 */
function showChartModal(product: TrackedProduct, priceHistory: any[]): void {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal chart-modal">
      <div class="modal-header">
        <span>${escapeHtml(product.title)}</span>
        <button class="modal-close" style="float: right; background: none; border: none; font-size: 24px; cursor: pointer; color: #8899a6;">&times;</button>
      </div>
      <div class="modal-body">
        <div id="chartContainer" style="width: 100%; height: 250px; margin: 16px 0;"></div>
        <div style="margin-top: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px; font-size: 12px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div>
              <div style="color: #8899a6;">Current Price</div>
              <div style="font-weight: 600; color: #2196F3;">${product.currency}${product.currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div style="color: #8899a6;">Lowest Price</div>
              <div style="font-weight: 600; color: #4CAF50;">${product.currency}${product.lowestPrice.toFixed(2)}</div>
            </div>
            <div>
              <div style="color: #8899a6;">Highest Price</div>
              <div style="font-weight: 600; color: #f44336;">${product.currency}${product.highestPrice.toFixed(2)}</div>
            </div>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e1e8ed;">
            <div style="color: #8899a6;">Price Checks: ${product.checkCount} times</div>
            <div style="color: #8899a6; margin-top: 4px;">Data Points: ${priceHistory.length}</div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary modal-close-btn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Get chart container
  const chartContainer = modal.querySelector('#chartContainer') as HTMLElement;

  // Create chart
  createPriceChart({
    container: chartContainer,
    data: priceHistory,
    currency: product.currency,
    currentPrice: product.currentPrice,
    lowestPrice: product.lowestPrice,
    highestPrice: product.highestPrice,
    averagePrice: product.averagePrice
  });

  // Close handlers
  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

/**
 * Handle open settings
 */
function handleOpenSettings(e: Event): void {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
}

/**
 * Show/hide loading state
 */
function showLoading(show: boolean): void {
  if (show) {
    loadingStateEl.style.display = 'block';
    productListEl.style.display = 'none';
    emptyStateEl.style.display = 'none';
  } else {
    loadingStateEl.style.display = 'none';
    productListEl.style.display = 'block';
  }
}

/**
 * Show error message
 */
function showError(message: string): void {
  emptyStateEl.style.display = 'block';
  emptyStateEl.innerHTML = `
    <div class="empty-icon">⚠️</div>
    <div class="empty-title">Error</div>
    <div class="empty-message">${escapeHtml(message)}</div>
  `;
}

/**
 * Get human-readable time since timestamp
 */
function getTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
