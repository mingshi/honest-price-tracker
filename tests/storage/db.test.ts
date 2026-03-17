/**
 * Integration tests for IndexedDB storage layer
 */

import {
  initDB,
  getDB,
  closeDB,
  saveProduct,
  getProduct,
  getAllProducts,
  deleteProduct,
  addPricePoint,
  getPriceHistory,
  addAlert,
  getAlerts,
  updateAlert,
  saveSetting,
  getSetting,
  exportAllData,
  clearAllData,
  TrackedProduct,
  PricePoint,
  PriceAlert
} from '../../src/storage/db';

// Mock IndexedDB for tests
const { indexedDB } = require('fake-indexeddb');
global.indexedDB = indexedDB;

describe('IndexedDB Storage Layer', () => {
  beforeEach(async () => {
    // Clear database before each test
    await clearAllData();
  });

  afterAll(() => {
    closeDB();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const db = await getDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('HonestPriceTracker');
      expect(db.version).toBe(1);
    });

    it('should create all required object stores', async () => {
      const db = await getDB();
      expect(db.objectStoreNames.contains('products')).toBe(true);
      expect(db.objectStoreNames.contains('price_history')).toBe(true);
      expect(db.objectStoreNames.contains('alerts')).toBe(true);
      expect(db.objectStoreNames.contains('settings')).toBe(true);
    });
  });

  describe('Products CRUD', () => {
    const testProduct: TrackedProduct = {
      id: 'amazon_B08N5WRWNW',
      retailer: 'amazon',
      productId: 'B08N5WRWNW',
      title: 'Echo Dot (4th Gen)',
      url: 'https://www.amazon.com/dp/B08N5WRWNW',
      imageUrl: 'https://m.media-amazon.com/images/I/test.jpg',
      currentPrice: 49.99,
      currency: '$',
      lowestPrice: 49.99,
      highestPrice: 49.99,
      averagePrice: 49.99,
      firstTracked: Date.now(),
      lastChecked: Date.now(),
      checkCount: 1,
      availability: 'In Stock'
    };

    it('should save a product', async () => {
      await saveProduct(testProduct);
      const retrieved = await getProduct(testProduct.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe(testProduct.title);
      expect(retrieved?.currentPrice).toBe(testProduct.currentPrice);
    });

    it('should update an existing product', async () => {
      await saveProduct(testProduct);
      
      // Update price
      const updated = { ...testProduct, currentPrice: 39.99, checkCount: 2 };
      await saveProduct(updated);
      
      const retrieved = await getProduct(testProduct.id);
      expect(retrieved?.currentPrice).toBe(39.99);
      expect(retrieved?.checkCount).toBe(2);
    });

    it('should get all products', async () => {
      const product1 = testProduct;
      const product2 = { ...testProduct, id: 'amazon_B08N5WRWN1', productId: 'B08N5WRWN1' };
      
      await saveProduct(product1);
      await saveProduct(product2);
      
      const allProducts = await getAllProducts();
      expect(allProducts.length).toBe(2);
    });

    it('should delete a product', async () => {
      await saveProduct(testProduct);
      await deleteProduct(testProduct.id);
      
      const retrieved = await getProduct(testProduct.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Price History', () => {
    const productKey = 'amazon_B08N5WRWNW';

    it('should add price points', async () => {
      const pricePoint: PricePoint = {
        productKey,
        price: 49.99,
        currency: '$',
        timestamp: Date.now()
      };

      const id = await addPricePoint(pricePoint);
      expect(id).toBeGreaterThan(0);
    });

    it('should retrieve price history', async () => {
      // Add multiple price points
      for (let i = 0; i < 5; i++) {
        await addPricePoint({
          productKey,
          price: 50 - i,
          currency: '$',
          timestamp: Date.now() - i * 86400000 // 1 day apart
        });
      }

      const history = await getPriceHistory(productKey);
      expect(history.length).toBe(5);
      
      // Should be ordered newest first
      expect(history[0].price).toBeLessThan(history[4].price);
    });

    it('should limit price history results', async () => {
      // Add 10 price points
      for (let i = 0; i < 10; i++) {
        await addPricePoint({
          productKey,
          price: 50 - i,
          currency: '$',
          timestamp: Date.now() - i * 86400000
        });
      }

      const history = await getPriceHistory(productKey, 5);
      expect(history.length).toBe(5);
    });
  });

  describe('Alerts', () => {
    const productKey = 'amazon_B08N5WRWNW';

    it('should add an alert', async () => {
      const alert: Omit<PriceAlert, 'id'> = {
        productKey,
        targetPrice: 39.99,
        enabled: true,
        notified: false,
        createdAt: Date.now()
      };

      const id = await addAlert(alert);
      expect(id).toBeGreaterThan(0);
    });

    it('should get alerts for a product', async () => {
      await addAlert({
        productKey,
        targetPrice: 39.99,
        enabled: true,
        notified: false,
        createdAt: Date.now()
      });

      await addAlert({
        productKey,
        targetPrice: 29.99,
        enabled: true,
        notified: false,
        createdAt: Date.now()
      });

      const alerts = await getAlerts(productKey);
      expect(alerts.length).toBe(2);
    });

    it('should update an alert', async () => {
      const id = await addAlert({
        productKey,
        targetPrice: 39.99,
        enabled: true,
        notified: false,
        createdAt: Date.now()
      });

      const alerts = await getAlerts(productKey);
      const alert = alerts[0];

      await updateAlert({
        ...alert,
        notified: true,
        notifiedAt: Date.now()
      });

      const updatedAlerts = await getAlerts(productKey);
      expect(updatedAlerts[0].notified).toBe(true);
      expect(updatedAlerts[0].notifiedAt).toBeDefined();
    });
  });

  describe('Settings', () => {
    it('should save and retrieve a setting', async () => {
      await saveSetting('checkInterval', 360);
      const value = await getSetting<number>('checkInterval');
      
      expect(value).toBe(360);
    });

    it('should return default value for non-existent setting', async () => {
      const value = await getSetting('nonExistent', 'default');
      expect(value).toBe('default');
    });

    it('should update existing setting', async () => {
      await saveSetting('theme', 'dark');
      await saveSetting('theme', 'light');
      
      const value = await getSetting('theme');
      expect(value).toBe('light');
    });

    it('should handle complex objects as settings', async () => {
      const complexSetting = {
        notifications: true,
        checkInterval: 360,
        retailers: ['amazon', 'ebay', 'walmart']
      };

      await saveSetting('userPreferences', complexSetting);
      const retrieved = await getSetting('userPreferences');
      
      expect(retrieved).toEqual(complexSetting);
    });
  });

  describe('Data Export/Import', () => {
    it('should export all data', async () => {
      // Add test data
      await saveProduct({
        id: 'amazon_TEST',
        retailer: 'amazon',
        productId: 'TEST',
        title: 'Test Product',
        url: 'https://amazon.com/test',
        currentPrice: 10,
        currency: '$',
        lowestPrice: 10,
        highestPrice: 10,
        averagePrice: 10,
        firstTracked: Date.now(),
        lastChecked: Date.now(),
        checkCount: 1
      });

      await addPricePoint({
        productKey: 'amazon_TEST',
        price: 10,
        currency: '$',
        timestamp: Date.now()
      });

      await saveSetting('test', 'value');

      const exported = await exportAllData();
      
      expect(exported.products.length).toBe(1);
      expect(exported.priceHistory.length).toBe(1);
      expect(exported.settings.length).toBe(1);
    });

    it('should import data', async () => {
      const dataToImport = {
        products: [{
          id: 'amazon_IMPORT',
          retailer: 'amazon' as const,
          productId: 'IMPORT',
          title: 'Imported Product',
          url: 'https://amazon.com/import',
          currentPrice: 20,
          currency: '$',
          lowestPrice: 20,
          highestPrice: 20,
          averagePrice: 20,
          firstTracked: Date.now(),
          lastChecked: Date.now(),
          checkCount: 1
        }],
        settings: [{
          key: 'imported',
          value: true,
          updatedAt: Date.now()
        }]
      };

      await importData(dataToImport);

      const product = await getProduct('amazon_IMPORT');
      const setting = await getSetting('imported');

      expect(product).toBeDefined();
      expect(setting).toBe(true);
    });
  });

  describe('Data Clearing', () => {
    it('should clear all data', async () => {
      // Add various data
      await saveProduct({
        id: 'test',
        retailer: 'amazon',
        productId: 'TEST',
        title: 'Test',
        url: 'https://test.com',
        currentPrice: 1,
        currency: '$',
        lowestPrice: 1,
        highestPrice: 1,
        averagePrice: 1,
        firstTracked: Date.now(),
        lastChecked: Date.now(),
        checkCount: 1
      });

      await addPricePoint({
        productKey: 'test',
        price: 1,
        currency: '$',
        timestamp: Date.now()
      });

      await saveSetting('test', 'value');

      // Clear everything
      await clearAllData();

      // Verify all cleared
      const products = await getAllProducts();
      const exported = await exportAllData();

      expect(products.length).toBe(0);
      expect(exported.priceHistory.length).toBe(0);
      expect(exported.settings.length).toBe(0);
    });
  });
});
