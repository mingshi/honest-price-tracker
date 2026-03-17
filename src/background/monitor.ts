/**
 * Price Monitoring Service
 * Periodically checks tracked products for price changes
 */

import {
  getAllProducts,
  saveProduct,
  addPricePoint,
  getAlerts,
  updateAlert,
  TrackedProduct,
  PricePoint
} from '../storage/db';

// Configuration
const CHECK_INTERVAL_MINUTES = 360; // 6 hours by default
const ALARM_NAME = 'price-check';

/**
 * Initialize price monitoring
 * Sets up periodic alarm to check prices
 */
export function initPriceMonitoring(): void {
  // Create periodic alarm
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: CHECK_INTERVAL_MINUTES
  });

  console.log(`Price monitoring initialized: every ${CHECK_INTERVAL_MINUTES} minutes`);
}

/**
 * Handle alarm trigger
 * Check all tracked products for price changes
 */
export async function handlePriceCheckAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name !== ALARM_NAME) {
    return;
  }

  console.log('Price check alarm triggered, checking all products...');

  try {
    await checkAllProducts();
  } catch (error) {
    console.error('Price check failed:', error);
  }
}

/**
 * Check all tracked products for price updates
 */
export async function checkAllProducts(): Promise<void> {
  const products = await getAllProducts();

  console.log(`Checking ${products.length} tracked products...`);

  for (const product of products) {
    try {
      await checkProduct(product);
    } catch (error) {
      console.error(`Failed to check product ${product.id}:`, error);
      // Continue with other products even if one fails
    }
  }

  console.log('Price check completed');
}

/**
 * Check a single product for price updates
 */
async function checkProduct(product: TrackedProduct): Promise<void> {
  console.log(`Checking product: ${product.title}`);

  // Fetch current price from the product page
  const currentPrice = await fetchCurrentPrice(product);

  if (!currentPrice) {
    console.warn(`Could not fetch current price for ${product.id}`);
    return;
  }

  // Check if price changed
  const priceChanged = currentPrice.price !== product.currentPrice;

  if (priceChanged) {
    console.log(`Price changed for ${product.title}: ${product.currentPrice} → ${currentPrice.price}`);

    // Update product record
    const updatedProduct: TrackedProduct = {
      ...product,
      currentPrice: currentPrice.price,
      currency: currentPrice.currency,
      lowestPrice: Math.min(product.lowestPrice, currentPrice.price),
      highestPrice: Math.max(product.highestPrice, currentPrice.price),
      lastChecked: Date.now(),
      checkCount: product.checkCount + 1,
      availability: currentPrice.availability
    };

    // Recalculate average price
    // TODO: This is a simplified average, should be weighted by time
    updatedProduct.averagePrice = (product.averagePrice * product.checkCount + currentPrice.price) / (product.checkCount + 1);

    await saveProduct(updatedProduct);

    // Add price point to history
    const pricePoint: PricePoint = {
      productKey: product.id,
      price: currentPrice.price,
      currency: currentPrice.currency,
      availability: currentPrice.availability,
      timestamp: Date.now()
    };

    await addPricePoint(pricePoint);

    // Check alerts for price drops
    if (currentPrice.price < product.currentPrice) {
      await checkAlertsForProduct(product, currentPrice.price);
    }
  } else {
    console.log(`Price unchanged for ${product.title}: ${product.currentPrice}`);

    // Update last checked timestamp
    await saveProduct({
      ...product,
      lastChecked: Date.now(),
      checkCount: product.checkCount + 1
    });
  }
}

/**
 * Fetch current price for a product
 * Opens the product page in a hidden tab and extracts the price
 */
async function fetchCurrentPrice(product: TrackedProduct): Promise<{
  price: number;
  currency: string;
  availability?: string;
} | null> {
  return new Promise((resolve) => {
    // Create offscreen tab to fetch price
    chrome.tabs.create({ url: product.url, active: false }, (tab) => {
      if (!tab.id) {
        resolve(null);
        return;
      }

      const tabId = tab.id;
      let resolved = false;

      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          chrome.tabs.remove(tabId);
          resolve(null);
        }
      }, 30000); // 30 second timeout

      // Listen for message from content script
      const messageListener = (
        message: any,
        sender: chrome.runtime.MessageSender
      ) => {
        if (sender.tab?.id === tabId && message.type === 'PRICE_EXTRACTED') {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            chrome.tabs.remove(tabId);

            if (message.success && message.data) {
              resolve({
                price: message.data.price,
                currency: message.data.currency,
                availability: message.data.availability
              });
            } else {
              resolve(null);
            }
          }
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      // Inject extraction script after page loads
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);

          // Send message to content script to extract price
          chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_PRICE' });
        }
      });
    });
  });
}

/**
 * Check if any alerts should be triggered for a product
 */
async function checkAlertsForProduct(product: TrackedProduct, newPrice: number): Promise<void> {
  const alerts = await getAlerts(product.id);

  for (const alert of alerts) {
    if (!alert.enabled || alert.notified) {
      continue;
    }

    // Check if price dropped below target
    if (newPrice <= alert.targetPrice) {
      console.log(`Alert triggered for ${product.title}: ${newPrice} <= ${alert.targetPrice}`);

      // Mark alert as notified
      await updateAlert({
        ...alert,
        notified: true,
        notifiedAt: Date.now()
      });

      // Send notification
      await sendPriceDropNotification(product, newPrice, alert.targetPrice);
    }
  }
}

/**
 * Send browser notification for price drop
 */
async function sendPriceDropNotification(
  product: TrackedProduct,
  newPrice: number,
  targetPrice: number
): Promise<void> {
  const priceDropPercent = Math.round(((product.currentPrice - newPrice) / product.currentPrice) * 100);

  const notification: chrome.notifications.NotificationOptions = {
    type: 'basic',
    iconUrl: product.imageUrl || chrome.runtime.getURL('assets/icons/icon128.png'),
    title: '🎉 Price Drop Alert!',
    message: `${product.title}\n\nPrice dropped ${priceDropPercent}%: $${product.currentPrice} → $${newPrice}\n\nYour target: $${targetPrice}`,
    priority: 2,
    requireInteraction: true,
    buttons: [
      { title: 'View Product' },
      { title: 'Dismiss' }
    ]
  };

  chrome.notifications.create(`price-drop-${product.id}`, notification, (notificationId) => {
    console.log(`Notification created: ${notificationId}`);
  });
}

/**
 * Handle notification button clicks
 */
export function handleNotificationClick(notificationId: string, buttonIndex?: number): void {
  if (!notificationId.startsWith('price-drop-')) {
    return;
  }

  const productId = notificationId.replace('price-drop-', '');

  if (buttonIndex === 0) {
    // "View Product" button clicked
    // Open product page
    chrome.storage.local.get(productId, (result) => {
      const product = result[productId] as TrackedProduct | undefined;
      if (product) {
        chrome.tabs.create({ url: product.url });
      }
    });
  }

  // Dismiss notification
  chrome.notifications.clear(notificationId);
}

/**
 * Get monitoring statistics
 */
export async function getMonitoringStats(): Promise<{
  totalProducts: number;
  lastCheck: number | null;
  nextCheck: number | null;
  activeAlerts: number;
}> {
  const products = await getAllProducts();
  
  // Get alarm info
  const alarm = await chrome.alarms.get(ALARM_NAME);
  
  // Count active alerts
  let activeAlerts = 0;
  for (const product of products) {
    const alerts = await getAlerts(product.id);
    activeAlerts += alerts.filter(a => a.enabled && !a.notified).length;
  }

  return {
    totalProducts: products.length,
    lastCheck: products.length > 0 ? Math.max(...products.map(p => p.lastChecked)) : null,
    nextCheck: alarm?.scheduledTime || null,
    activeAlerts
  };
}

/**
 * Manually trigger price check for a specific product
 */
export async function checkProductNow(productId: string): Promise<void> {
  const products = await getAllProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  await checkProduct(product);
}

/**
 * Update check interval
 */
export function updateCheckInterval(minutes: number): void {
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: minutes
    });
    console.log(`Check interval updated to ${minutes} minutes`);
  });
}
