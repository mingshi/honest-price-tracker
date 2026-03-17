# Testing Guide - Honest Price Tracker

## ✅ Build Status

**Last Build**: 2026-03-17 18:33
**Status**: ✅ Successful
**Output**: dist/ folder with all assets

## 📦 Build the Extension

```bash
cd /home/admin/.openclaw/workspace/honest-price-tracker

# Install dependencies (if not already done)
npm install

# Build
npm run build

# Copy static files to dist/
cp manifest.json dist/
cp src/popup/*.html src/popup/*.css dist/
cp src/options/index.html dist/options.html
cp src/content/styles.css dist/content.css
cp -r assets dist/
mv dist/index.html dist/popup.html
```

## 🔧 Load in Chrome

### 1. Open Chrome Extensions Page
- Visit `chrome://extensions/`
- Or Menu → Extensions → Manage Extensions

### 2. Enable Developer Mode
- Toggle "Developer mode" in the top-right corner

### 3. Load Unpacked Extension
- Click "Load unpacked"
- Navigate to: `/home/admin/.openclaw/workspace/honest-price-tracker/dist/`
- Click "Select Folder"

### 4. Verify Installation
- Extension should appear with name "Honest Price Tracker"
- Icon might show as default (PNG icons need to be added)
- Click extension icon to open popup

## ⚠️ Known Issues

### Missing Icons
The extension currently lacks PNG icons. Chrome will show a default icon.

**Fix**: Create icon16.png, icon48.png, icon128.png in `dist/assets/icons/`

**Temporary workaround**: Use online SVG→PNG converter:
1. Upload `assets/icons/icon.svg`
2. Convert to 16×16, 48×48, 128×128
3. Save as icon16.png, icon48.png, icon128.png

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Popup opens and displays empty state
- [ ] Visit Amazon product page
- [ ] Product is automatically tracked
- [ ] Refresh popup to see tracked product
- [ ] Click "View" button opens product page
- [ ] Click "🔔 Alert" button opens modal
- [ ] Set price alert and save
- [ ] Click "🔄" button triggers manual check
- [ ] Click "Delete" button removes product

### Background Monitoring
- [ ] Check DevTools → Background Service Worker console
- [ ] Verify periodic alarm is set (chrome.alarms)
- [ ] Manually trigger price check
- [ ] Verify price history is recorded

### Storage
- [ ] DevTools → Application → IndexedDB → HonestPriceTracker
- [ ] Verify 4 object stores exist
- [ ] Verify product data is saved

### Notifications
- [ ] Set a price alert below current price
- [ ] Wait for next price check (or trigger manually)
- [ ] Verify notification appears if price drops

## 🐛 Debugging

### View Logs
**Background Worker**:
1. `chrome://extensions/` → Details → "service worker" link
2. Opens DevTools for background script

**Popup**:
1. Right-click extension icon → "Inspect popup"
2. Opens DevTools for popup

**Content Script**:
1. Open Amazon product page
2. F12 → Console
3. Filter for "Honest Price Tracker" messages

### Common Issues

**Extension doesn't load**:
- Check console for errors
- Verify manifest.json syntax
- Check all file paths in manifest.json

**Product not tracked**:
- Check content script console
- Verify retailer detection (amazon.com, ebay.com, walmart.com)
- Check if extraction succeeded

**Popup shows errors**:
- Check popup console
- Verify background worker is running
- Check IndexedDB permissions

**Notifications don't appear**:
- Check Chrome notification permissions
- Verify chrome.notifications permission in manifest
- Check background worker console for errors

## 📊 Test Data

### Sample Amazon URLs
- Echo Dot: https://www.amazon.com/dp/B08N5WRWNW
- Fire TV Stick: https://www.amazon.com/dp/B08C1W5N87
- Kindle: https://www.amazon.com/dp/B09SWV4KZ8

### Manual Testing Script
```javascript
// In background service worker console:

// Get all tracked products
chrome.runtime.sendMessage({type: 'GET_TRACKED_PRODUCTS'}, console.log);

// Trigger manual check
chrome.runtime.sendMessage({
  type: 'CHECK_PRODUCT_NOW', 
  productId: 'amazon_B08N5WRWNW'
}, console.log);

// Get monitoring stats
chrome.runtime.sendMessage({type: 'GET_MONITORING_STATS'}, console.log);
```

## 🚀 Next Steps

After successful testing:
1. Fix PNG icons
2. Test on eBay and Walmart
3. Test price history chart (TODO: Task 2.10)
4. Package for Chrome Web Store submission
