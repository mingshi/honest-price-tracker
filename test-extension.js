#!/usr/bin/env node
/**
 * Test Chrome extension using Puppeteer
 * Load extension, navigate to product page, test Compare button
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testExtension() {
  console.log('🧪 Testing Honest Price Tracker extension...\n');
  
  const extensionPath = path.join(__dirname, 'dist');
  console.log(`Extension path: ${extensionPath}\n`);
  
  // Launch browser with extension loaded
  const browser = await puppeteer.launch({
    headless: false, // Need to see what happens
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to a test Amazon product page
    console.log('📄 Loading Amazon product page...');
    await page.goto('https://www.amazon.com/dp/B0D1XD1ZV3', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Page loaded\n');
    
    // Wait a bit for extension to inject content script
    await page.waitForTimeout(2000);
    
    // Check if price tracker injected anything
    const hasExtension = await page.evaluate(() => {
      return !!document.querySelector('[data-honest-price-tracker]');
    });
    
    if (hasExtension) {
      console.log('✅ Extension content script detected');
    } else {
      console.log('⚠️  Extension content script NOT detected');
    }
    
    // Open extension popup (this is tricky, might need workaround)
    console.log('\n📋 To test popup:');
    console.log('1. Click the extension icon in toolbar');
    console.log('2. Look for tracked products');
    console.log('3. Click "Compare" button');
    console.log('4. Check if mock data appears (Amazon $89.99, eBay $94.50, Walmart $92.99)');
    
    // Keep browser open for manual testing
    console.log('\n⏳ Browser will stay open for 60 seconds for manual testing...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

// Run test
testExtension()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
