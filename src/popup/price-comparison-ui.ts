/**
 * Price Comparison UI Components
 * Displays cross-platform price comparison results
 */

import { PriceComparison, ComparisonResult } from '../features/price-comparison';

/**
 * Create price comparison card HTML
 */
export function createComparisonCard(result: ComparisonResult): string {
  const savings = result.savings || 0;
  const hasSavings = savings > 0;
  
  return `
    <div class="comparison-card">
      <div class="comparison-header">
        <h3>🔍 Price Comparison</h3>
        <button class="close-comparison" aria-label="Close">×</button>
      </div>
      
      ${hasSavings ? `
        <div class="savings-alert">
          💰 Save $${savings.toFixed(2)} on ${result.lowestPrice.retailer.toUpperCase()}!
        </div>
      ` : `
        <div class="no-savings-alert">
          ✓ This is the best price we found!
        </div>
      `}
      
      <div class="comparison-current">
        <div class="comparison-label">Current Product</div>
        <div class="comparison-item">
          <div class="comparison-retailer">${result.currentRetailer.toUpperCase()}</div>
          <div class="comparison-price">${result.currentProduct.currency}${result.currentProduct.price.toFixed(2)}</div>
          <a href="${result.currentProduct.url}" target="_blank" class="comparison-link">View</a>
        </div>
      </div>
      
      ${result.otherPrices.length > 0 ? `
        <div class="comparison-others">
          <div class="comparison-label">Other Retailers</div>
          ${result.otherPrices.map(price => `
            <div class="comparison-item ${price.productId === result.lowestPrice.productId ? 'comparison-lowest' : ''}">
              <div class="comparison-retailer">
                ${price.retailer.toUpperCase()}
                ${price.productId === result.lowestPrice.productId ? ' <span class="best-price-badge">Best Price</span>' : ''}
              </div>
              <div class="comparison-price">${price.currency}${price.price.toFixed(2)}</div>
              <a href="${price.url}" target="_blank" class="comparison-link">View</a>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="comparison-empty">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div>Searching other retailers...</div>
          <div style="font-size: 12px; color: #8899a6; margin-top: 4px;">
            This feature requires API integration
          </div>
        </div>
      `}
      
      <div class="comparison-note">
        <small>💡 Prices are fetched in real-time and may change</small>
      </div>
    </div>
  `;
}

/**
 * Create loading state for comparison
 */
export function createComparisonLoading(): string {
  return `
    <div class="comparison-card">
      <div class="comparison-header">
        <h3>🔍 Comparing Prices...</h3>
        <button class="close-comparison" aria-label="Close">×</button>
      </div>
      <div class="comparison-loading">
        <div class="spinner"></div>
        <div style="margin-top: 12px;">Searching Amazon, eBay, Walmart...</div>
      </div>
    </div>
  `;
}

/**
 * Create error state for comparison
 */
export function createComparisonError(error: string): string {
  return `
    <div class="comparison-card">
      <div class="comparison-header">
        <h3>🔍 Price Comparison</h3>
        <button class="close-comparison" aria-label="Close">×</button>
      </div>
      <div class="comparison-error">
        <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
        <div style="font-weight: 500; margin-bottom: 4px;">Unable to compare prices</div>
        <div style="font-size: 12px; color: #8899a6;">${error}</div>
      </div>
    </div>
  `;
}

/**
 * Inject comparison card into product card
 */
export function injectComparisonIntoCard(productId: string, html: string): void {
  const productCard = document.querySelector(`[data-product-id="${productId}"]`);
  if (!productCard) return;
  
  // Remove existing comparison if any
  const existing = productCard.querySelector('.comparison-card');
  if (existing) {
    existing.remove();
  }
  
  // Insert new comparison card
  const container = document.createElement('div');
  container.innerHTML = html;
  productCard.appendChild(container.firstElementChild as Element);
  
  // Add close button listener
  const closeBtn = productCard.querySelector('.close-comparison');
  closeBtn?.addEventListener('click', () => {
    const card = productCard.querySelector('.comparison-card');
    card?.remove();
  });
}
