/**
 * Unit tests for Amazon product extractor
 */

import { extractAmazonProduct, isAmazonProductPage } from '../../src/extractors/amazon';

// Mock DOM environment
function setupMockDOM(html: string) {
  document.body.innerHTML = html;
}

// Mock window.location
function mockLocation(url: string) {
  delete (window as any).location;
  (window as any).location = new URL(url);
}

describe('Amazon Product Extractor', () => {
  describe('isAmazonProductPage', () => {
    it('should detect valid Amazon product URLs', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM('<div id="productTitle">Test Product</div>');
      
      expect(isAmazonProductPage()).toBe(true);
    });

    it('should detect gp/product URLs', () => {
      mockLocation('https://www.amazon.com/gp/product/B08N5WRWNW');
      setupMockDOM('<div id="productTitle">Test Product</div>');
      
      expect(isAmazonProductPage()).toBe(true);
    });

    it('should reject non-product pages', () => {
      mockLocation('https://www.amazon.com/');
      setupMockDOM('<div>Homepage</div>');
      
      expect(isAmazonProductPage()).toBe(false);
    });
  });

  describe('extractAmazonProduct', () => {
    beforeEach(() => {
      // Reset DOM
      document.body.innerHTML = '';
    });

    it('should extract complete product data', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Echo Dot (4th Gen) | Smart speaker</div>
        <span class="a-price-whole">49.99</span>
        <span class="a-price-symbol">$</span>
        <img id="landingImage" src="https://m.media-amazon.com/images/I/test.jpg" />
        <span id="availability">In Stock</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product?.retailer).toBe('amazon');
      expect(result.product?.title).toBe('Echo Dot (4th Gen) | Smart speaker');
      expect(result.product?.price).toBe(49.99);
      expect(result.product?.currency).toBe('$');
      expect(result.product?.productId).toBe('B08N5WRWNW');
      expect(result.product?.imageUrl).toContain('test.jpg');
      expect(result.product?.availability).toContain('In Stock');
    });

    it('should handle European price format (comma decimal)', () => {
      mockLocation('https://www.amazon.de/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <span class="a-price-whole">49,99 €</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product?.price).toBe(49.99);
      expect(result.product?.currency).toBe('€');
    });

    it('should handle large prices with thousands separator', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Expensive Item</div>
        <span class="a-price-whole">$1,234.56</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product?.price).toBe(1234.56);
    });

    it('should extract price from JSON-LD structured data', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "offers": {
            "price": "29.99",
            "priceCurrency": "USD"
          }
        }
        </script>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product?.price).toBe(29.99);
      expect(result.product?.currency).toBe('USD');
    });

    it('should fail gracefully when no price found', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <!-- No price element -->
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not find price');
    });

    it('should fail gracefully when no ASIN found', () => {
      mockLocation('https://www.amazon.com/some-other-page');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <span class="a-price-whole">$49.99</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not extract ASIN');
    });

    it('should extract ASIN from data-asin attribute', () => {
      mockLocation('https://www.amazon.com/some-page');
      setupMockDOM(`
        <div data-asin="B08N5WRWNW" id="productTitle">Test Product</div>
        <span class="a-price-whole">$49.99</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product?.productId).toBe('B08N5WRWNW');
    });

    it('should handle multiple price selectors (fallback)', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <span id="priceblock_ourprice">$39.99</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      expect(result.product?.price).toBe(39.99);
    });

    it('should handle deal prices', () => {
      mockLocation('https://www.amazon.com/dp/B08N5WRWNW');
      setupMockDOM(`
        <div id="productTitle">Test Product</div>
        <span id="priceblock_dealprice">$19.99</span>
        <span id="priceblock_ourprice">$49.99</span>
      `);

      const result = extractAmazonProduct();

      expect(result.success).toBe(true);
      // Should extract the first valid price found (deal price)
      expect(result.product?.price).toBe(19.99);
    });
  });
});

// Export for use in integration tests
export { setupMockDOM, mockLocation };
