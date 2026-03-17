/**
 * Price Chart Component
 * Visualizes price history using Chart.js
 */

import { PricePoint } from '../storage/db';

export interface ChartOptions {
  container: HTMLElement;
  data: PricePoint[];
  currency: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

/**
 * Create price history chart
 */
export function createPriceChart(options: ChartOptions): any {
  const { container, data, currency, currentPrice, lowestPrice, highestPrice, averagePrice } = options;

  // Sort data by timestamp (oldest first)
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

  // Prepare chart data
  const labels = sortedData.map(point => formatDate(point.timestamp));
  const prices = sortedData.map(point => point.price);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return null;
  }

  // Simple line chart implementation (without Chart.js for now)
  // TODO: Replace with Chart.js when dependency is available
  drawSimpleChart(ctx, canvas.width, canvas.height, prices, labels, {
    currency,
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice
  });

  return canvas;
}

/**
 * Simple chart drawing (fallback without Chart.js)
 */
function drawSimpleChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  prices: number[],
  labels: string[],
  stats: {
    currency: string;
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
  }
): void {
  if (prices.length === 0) {
    // Draw empty state
    ctx.fillStyle = '#8899a6';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No price history yet', width / 2, height / 2);
    return;
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate scale
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const xStep = chartWidth / (prices.length - 1 || 1);
  const yScale = chartHeight / priceRange;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = '#f5f7fa';
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = '#e1e8ed';
  ctx.lineWidth = 1;

  // Horizontal grid lines (5 lines)
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    // Price labels
    const price = maxPrice - (priceRange / 4) * i;
    ctx.fillStyle = '#8899a6';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${stats.currency}${price.toFixed(2)}`, padding - 5, y + 4);
  }

  // Draw price line
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2;
  ctx.beginPath();

  prices.forEach((price, index) => {
    const x = padding + xStep * index;
    const y = padding + chartHeight - (price - minPrice) * yScale;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw data points
  ctx.fillStyle = '#4CAF50';
  prices.forEach((price, index) => {
    const x = padding + xStep * index;
    const y = padding + chartHeight - (price - minPrice) * yScale;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Draw current price indicator
  const currentY = padding + chartHeight - (stats.currentPrice - minPrice) * yScale;
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(width - padding, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Current price label
  ctx.fillStyle = '#2196F3';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Current: ${stats.currency}${stats.currentPrice.toFixed(2)}`, width - padding + 5, currentY + 4);

  // Draw time labels (first and last)
  ctx.fillStyle = '#8899a6';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  if (labels.length > 0) {
    ctx.fillText(labels[0], padding, height - 10);
    ctx.fillText(labels[labels.length - 1], width - padding, height - 10);
  }

  // Draw legend
  const legendY = 15;
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';

  // Lowest
  ctx.fillStyle = '#4CAF50';
  ctx.fillText(`▼ Low: ${stats.currency}${stats.lowestPrice.toFixed(2)}`, padding, legendY);

  // Highest
  ctx.fillStyle = '#f44336';
  ctx.fillText(`▲ High: ${stats.currency}${stats.highestPrice.toFixed(2)}`, padding + 120, legendY);

  // Average
  ctx.fillStyle = '#8899a6';
  ctx.fillText(`◆ Avg: ${stats.currency}${stats.averagePrice.toFixed(2)}`, padding + 240, legendY);
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Create chart with Chart.js (when available)
 */
export function createChartJS(options: ChartOptions): any {
  // TODO: Implement Chart.js version
  // For now, use simple canvas fallback
  return createPriceChart(options);
}
