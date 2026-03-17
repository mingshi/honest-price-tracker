/**
 * Content Injection
 * Injects price history UI into product pages (like Keepa)
 */

import { createPriceChart } from '../components/PriceChart';

/**
 * Inject price history UI into product page
 */
export async function injectPriceHistory(
  productId: string,
  retailer: string
): Promise<void> {
  // Get price history from background
  const response = await chrome.runtime.sendMessage({
    type: 'GET_PRICE_HISTORY',
    productId: `${retailer}_${productId}`,
    limit: 50
  });

  if (!response.success || !response.history || response.history.length === 0) {
    console.log('No price history to display');
    return;
  }

  // Get current product data
  const productResponse = await chrome.runtime.sendMessage({
    type: 'GET_TRACKED_PRODUCTS'
  });

  const product = productResponse.success 
    ? productResponse.products.find((p: any) => p.id === `${retailer}_${productId}`)
    : null;

  if (!product) {
    console.log('Product not found in tracking list');
    return;
  }

  // Find injection point based on retailer
  const container = findInjectionPoint(retailer);
  if (!container) {
    console.log('Could not find injection point');
    return;
  }

  // Create widget
  const widget = createPriceWidget(product, response.history);
  
  // Inject before the container
  container.parentNode?.insertBefore(widget, container);

  console.log('Price history widget injected');
}

/**
 * Find injection point on page (retailer-specific)
 */
function findInjectionPoint(retailer: string): HTMLElement | null {
  switch (retailer) {
    case 'amazon':
      // Inject above "Product details" or "About this item"
      return (
        document.querySelector('#productDetails_feature_div') ||
        document.querySelector('#feature-bullets') ||
        document.querySelector('#detailBullets_feature_div') ||
        document.querySelector('#productDescription')
      ) as HTMLElement;

    case 'ebay':
      return document.querySelector('.vim.x-item-description') as HTMLElement;

    case 'walmart':
      return document.querySelector('[data-testid="product-description"]') as HTMLElement;

    default:
      return null;
  }
}

/**
 * Create price history widget
 */
function createPriceWidget(product: any, priceHistory: any[]): HTMLElement {
  const widget = document.createElement('div');
  widget.id = 'honest-price-tracker-widget';
  widget.style.cssText = `
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #4CAF50;
  `;
  header.innerHTML = `
    <div>
      <h3 style="margin: 0; font-size: 18px; color: #2c3e50; display: flex; align-items: center; gap: 8px;">
        💰 Price History
        <span style="font-size: 12px; background: #4CAF50; color: white; padding: 2px 8px; border-radius: 10px; font-weight: 500;">Honest Tracker</span>
      </h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #8899a6;">
        100% privacy-first • No cookies modified • ${priceHistory.length} price checks
      </p>
    </div>
    <button id="hpt-minimize" style="
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #8899a6;
      padding: 4px 8px;
    ">−</button>
  `;

  // Content
  const content = document.createElement('div');
  content.id = 'hpt-content';

  // Stats
  const stats = document.createElement('div');
  stats.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  `;

  const priceChange = product.currentPrice - product.lowestPrice;
  const priceChangePercent = product.lowestPrice > 0 
    ? Math.abs((priceChange / product.lowestPrice) * 100).toFixed(1)
    : '0.0';

  stats.innerHTML = `
    <div>
      <div style="font-size: 11px; color: #8899a6; text-transform: uppercase; letter-spacing: 0.5px;">Current</div>
      <div style="font-size: 20px; font-weight: 600; color: #2196F3; margin-top: 4px;">${product.currency}${product.currentPrice.toFixed(2)}</div>
    </div>
    <div>
      <div style="font-size: 11px; color: #8899a6; text-transform: uppercase; letter-spacing: 0.5px;">Lowest</div>
      <div style="font-size: 20px; font-weight: 600; color: #4CAF50; margin-top: 4px;">${product.currency}${product.lowestPrice.toFixed(2)}</div>
    </div>
    <div>
      <div style="font-size: 11px; color: #8899a6; text-transform: uppercase; letter-spacing: 0.5px;">Highest</div>
      <div style="font-size: 20px; font-weight: 600; color: #f44336; margin-top: 4px;">${product.currency}${product.highestPrice.toFixed(2)}</div>
    </div>
    <div>
      <div style="font-size: 11px; color: #8899a6; text-transform: uppercase; letter-spacing: 0.5px;">vs Lowest</div>
      <div style="font-size: 20px; font-weight: 600; color: ${priceChange > 0 ? '#f44336' : '#4CAF50'}; margin-top: 4px;">
        ${priceChange >= 0 ? '+' : ''}${priceChangePercent}%
      </div>
    </div>
  `;

  content.appendChild(stats);

  // Chart container
  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = `
    background: #f5f7fa;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
  `;

  content.appendChild(chartContainer);

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

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e1e8ed;
  `;
  footer.innerHTML = `
    <div style="font-size: 12px; color: #8899a6;">
      Tracking since ${new Date(product.firstTracked).toLocaleDateString()}
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="hpt-set-alert" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      ">🔔 Set Price Alert</button>
      <button id="hpt-refresh" style="
        background: #f0f0f0;
        color: #2c3e50;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      ">🔄 Refresh</button>
    </div>
  `;

  content.appendChild(footer);

  widget.appendChild(header);
  widget.appendChild(content);

  // Event listeners
  setupWidgetHandlers(widget, product);

  return widget;
}

/**
 * Setup event handlers for widget
 */
function setupWidgetHandlers(widget: HTMLElement, product: any): void {
  // Minimize/maximize
  const minimizeBtn = widget.querySelector('#hpt-minimize') as HTMLElement;
  const content = widget.querySelector('#hpt-content') as HTMLElement;
  let minimized = false;

  minimizeBtn?.addEventListener('click', () => {
    minimized = !minimized;
    content.style.display = minimized ? 'none' : 'block';
    minimizeBtn.textContent = minimized ? '+' : '−';
  });

  // Set alert
  widget.querySelector('#hpt-set-alert')?.addEventListener('click', async () => {
    const targetPrice = prompt(
      `Set price alert for ${product.title}\n\nNotify me when price drops to:`,
      product.lowestPrice.toFixed(2)
    );

    if (!targetPrice) return;

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'ADD_ALERT',
      productKey: product.id,
      targetPrice: price
    });

    if (response.success) {
      alert(`✅ Alert set! We'll notify you when the price drops to ${product.currency}${price.toFixed(2)}`);
    } else {
      alert(`Failed to set alert: ${response.error}`);
    }
  });

  // Refresh
  widget.querySelector('#hpt-refresh')?.addEventListener('click', async () => {
    const btn = widget.querySelector('#hpt-refresh') as HTMLButtonElement;
    btn.textContent = '⏳ Checking...';
    btn.disabled = true;

    await chrome.runtime.sendMessage({
      type: 'CHECK_PRODUCT_NOW',
      productId: product.id
    });

    setTimeout(() => {
      btn.textContent = '🔄 Refresh';
      btn.disabled = false;
      location.reload(); // Reload to show updated data
    }, 3000);
  });
}
