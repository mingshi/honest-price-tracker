/**
 * IndexedDB Storage Layer
 * Handles all local data storage for tracked products and price history
 */

// Database configuration
const DB_NAME = 'HonestPriceTracker';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  PRODUCTS: 'products',
  PRICE_HISTORY: 'price_history',
  ALERTS: 'alerts',
  SETTINGS: 'settings'
} as const;

// Type definitions
export interface TrackedProduct {
  id: string; // Unique ID: `${retailer}_${productId}`
  retailer: 'amazon' | 'ebay' | 'walmart';
  productId: string; // ASIN, eBay item ID, Walmart product ID
  title: string;
  url: string;
  imageUrl?: string;
  currentPrice: number;
  currency: string;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  firstTracked: number; // Timestamp
  lastChecked: number; // Timestamp
  checkCount: number;
  availability?: string;
}

export interface PricePoint {
  id?: number; // Auto-increment
  productKey: string; // Foreign key: `${retailer}_${productId}`
  price: number;
  currency: string;
  availability?: string;
  timestamp: number;
}

export interface PriceAlert {
  id?: number; // Auto-increment
  productKey: string; // Foreign key
  targetPrice: number;
  enabled: boolean;
  notified: boolean;
  createdAt: number;
  notifiedAt?: number;
}

export interface UserSettings {
  key: string; // Setting name
  value: any; // Setting value (JSON serializable)
  updatedAt: number;
}

/**
 * Initialize IndexedDB database
 * Creates object stores and indexes
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create Products store
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productsStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
        productsStore.createIndex('retailer', 'retailer', { unique: false });
        productsStore.createIndex('productId', 'productId', { unique: false });
        productsStore.createIndex('lastChecked', 'lastChecked', { unique: false });
      }

      // Create Price History store
      if (!db.objectStoreNames.contains(STORES.PRICE_HISTORY)) {
        const historyStore = db.createObjectStore(STORES.PRICE_HISTORY, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        historyStore.createIndex('productKey', 'productKey', { unique: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        historyStore.createIndex('productKey_timestamp', ['productKey', 'timestamp'], { unique: false });
      }

      // Create Alerts store
      if (!db.objectStoreNames.contains(STORES.ALERTS)) {
        const alertsStore = db.createObjectStore(STORES.ALERTS, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        alertsStore.createIndex('productKey', 'productKey', { unique: false });
        alertsStore.createIndex('enabled', 'enabled', { unique: false });
      }

      // Create Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get database connection
 */
let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  dbInstance = await initDB();
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ==================== PRODUCTS CRUD ====================

/**
 * Add or update a tracked product
 */
export async function saveProduct(product: TrackedProduct): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    const request = store.put(product);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save product: ${request.error}`));
  });
}

/**
 * Get a tracked product by ID
 */
export async function getProduct(id: string): Promise<TrackedProduct | null> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error(`Failed to get product: ${request.error}`));
  });
}

/**
 * Get all tracked products
 */
export async function getAllProducts(): Promise<TrackedProduct[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get all products: ${request.error}`));
  });
}

/**
 * Get products by retailer
 */
export async function getProductsByRetailer(retailer: string): Promise<TrackedProduct[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
    const store = transaction.objectStore(STORES.PRODUCTS);
    const index = store.index('retailer');
    
    const request = index.getAll(retailer);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get products by retailer: ${request.error}`));
  });
}

/**
 * Delete a tracked product
 */
export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete product: ${request.error}`));
  });
}

/**
 * Delete all products (for data clearing)
 */
export async function deleteAllProducts(): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to clear products: ${request.error}`));
  });
}

// ==================== PRICE HISTORY CRUD ====================

/**
 * Add a price point to history
 */
export async function addPricePoint(pricePoint: PricePoint): Promise<number> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRICE_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORES.PRICE_HISTORY);
    
    const request = store.add(pricePoint);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(new Error(`Failed to add price point: ${request.error}`));
  });
}

/**
 * Get price history for a product
 * @param limit - Maximum number of price points to return (default: 100)
 */
export async function getPriceHistory(productKey: string, limit: number = 100): Promise<PricePoint[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRICE_HISTORY], 'readonly');
    const store = transaction.objectStore(STORES.PRICE_HISTORY);
    const index = store.index('productKey_timestamp');
    
    const range = IDBKeyRange.bound([productKey, 0], [productKey, Date.now()]);
    const request = index.openCursor(range, 'prev'); // Newest first
    
    const results: PricePoint[] = [];
    let count = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      
      if (cursor && count < limit) {
        results.push(cursor.value);
        count++;
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    
    request.onerror = () => reject(new Error(`Failed to get price history: ${request.error}`));
  });
}

/**
 * Delete price history for a product
 */
export async function deletePriceHistory(productKey: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRICE_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORES.PRICE_HISTORY);
    const index = store.index('productKey');
    
    const request = index.openCursor(IDBKeyRange.only(productKey));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = () => reject(new Error(`Failed to delete price history: ${request.error}`));
  });
}

/**
 * Cleanup old price history (keep only last N points per product)
 * This prevents database from growing too large
 */
export async function cleanupPriceHistory(maxPointsPerProduct: number = 100): Promise<number> {
  const products = await getAllProducts();
  let deletedCount = 0;
  
  for (const product of products) {
    const history = await getPriceHistory(product.id, maxPointsPerProduct + 100);
    
    if (history.length > maxPointsPerProduct) {
      // Delete oldest points beyond limit
      const db = await getDB();
      const transaction = db.transaction([STORES.PRICE_HISTORY], 'readwrite');
      const store = transaction.objectStore(STORES.PRICE_HISTORY);
      
      for (let i = maxPointsPerProduct; i < history.length; i++) {
        if (history[i].id) {
          store.delete(history[i].id!);
          deletedCount++;
        }
      }
    }
  }
  
  return deletedCount;
}

// ==================== ALERTS CRUD ====================

/**
 * Add a price alert
 */
export async function addAlert(alert: Omit<PriceAlert, 'id'>): Promise<number> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readwrite');
    const store = transaction.objectStore(STORES.ALERTS);
    
    const request = store.add(alert);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(new Error(`Failed to add alert: ${request.error}`));
  });
}

/**
 * Get alerts for a product
 */
export async function getAlerts(productKey: string): Promise<PriceAlert[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readonly');
    const store = transaction.objectStore(STORES.ALERTS);
    const index = store.index('productKey');
    
    const request = index.getAll(productKey);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get alerts: ${request.error}`));
  });
}

/**
 * Update an alert
 */
export async function updateAlert(alert: PriceAlert): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readwrite');
    const store = transaction.objectStore(STORES.ALERTS);
    
    const request = store.put(alert);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to update alert: ${request.error}`));
  });
}

/**
 * Delete an alert
 */
export async function deleteAlert(id: number): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readwrite');
    const store = transaction.objectStore(STORES.ALERTS);
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete alert: ${request.error}`));
  });
}

/**
 * Get all enabled alerts
 */
export async function getEnabledAlerts(): Promise<PriceAlert[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readonly');
    const store = transaction.objectStore(STORES.ALERTS);
    const index = store.index('enabled');
    
    const request = index.getAll(IDBKeyRange.only(true));
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get enabled alerts: ${request.error}`));
  });
}

// ==================== SETTINGS CRUD ====================

/**
 * Save a setting
 */
export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    const setting: UserSettings = {
      key,
      value,
      updatedAt: Date.now()
    };
    
    const request = store.put(setting);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save setting: ${request.error}`));
  });
}

/**
 * Get a setting
 */
export async function getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    const request = store.get(key);
    
    request.onsuccess = () => {
      const result = request.result as UserSettings;
      resolve(result ? result.value : defaultValue);
    };
    request.onerror = () => reject(new Error(`Failed to get setting: ${request.error}`));
  });
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete setting: ${request.error}`));
  });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Export all data (for backup/portability)
 */
export async function exportAllData(): Promise<{
  products: TrackedProduct[];
  priceHistory: PricePoint[];
  alerts: PriceAlert[];
  settings: UserSettings[];
}> {
  const db = await getDB();
  
  const products = await getAllProducts();
  
  // Get all price history
  const priceHistory: PricePoint[] = await new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRICE_HISTORY], 'readonly');
    const store = transaction.objectStore(STORES.PRICE_HISTORY);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to export price history: ${request.error}`));
  });
  
  // Get all alerts
  const alerts: PriceAlert[] = await new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ALERTS], 'readonly');
    const store = transaction.objectStore(STORES.ALERTS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to export alerts: ${request.error}`));
  });
  
  // Get all settings
  const settings: UserSettings[] = await new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SETTINGS], 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to export settings: ${request.error}`));
  });
  
  return { products, priceHistory, alerts, settings };
}

/**
 * Import data (from backup)
 */
export async function importData(data: {
  products?: TrackedProduct[];
  priceHistory?: PricePoint[];
  alerts?: PriceAlert[];
  settings?: UserSettings[];
}): Promise<void> {
  const db = await getDB();
  
  // Import products
  if (data.products) {
    const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTS);
    
    for (const product of data.products) {
      store.put(product);
    }
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(new Error('Failed to import products'));
    });
  }
  
  // Import price history
  if (data.priceHistory) {
    const transaction = db.transaction([STORES.PRICE_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORES.PRICE_HISTORY);
    
    for (const point of data.priceHistory) {
      store.add(point);
    }
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(new Error('Failed to import price history'));
    });
  }
  
  // Import alerts
  if (data.alerts) {
    const transaction = db.transaction([STORES.ALERTS], 'readwrite');
    const store = transaction.objectStore(STORES.ALERTS);
    
    for (const alert of data.alerts) {
      store.add(alert);
    }
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(new Error('Failed to import alerts'));
    });
  }
  
  // Import settings
  if (data.settings) {
    const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    for (const setting of data.settings) {
      store.put(setting);
    }
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(new Error('Failed to import settings'));
    });
  }
}

/**
 * Clear all data (nuclear option)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  
  const stores = [STORES.PRODUCTS, STORES.PRICE_HISTORY, STORES.ALERTS, STORES.SETTINGS];
  
  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
    });
  }
}
