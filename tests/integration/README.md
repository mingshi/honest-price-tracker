# Integration Tests

End-to-end tests for Honest Price Tracker.

## Test Scenarios

### 1. Complete User Journey
1. User installs extension
2. Visits Amazon product page
3. Product is automatically tracked
4. User views product in popup
5. User sets price alert
6. Background worker detects price drop
7. User receives notification
8. User clicks notification → opens product page

### 2. Multi-Retailer Flow
1. Track product on Amazon
2. Track product on eBay
3. Track product on Walmart
4. View all products in popup
5. Verify each product has correct retailer

### 3. Data Persistence
1. Add multiple products
2. Set multiple alerts
3. Close browser
4. Reopen browser
5. Verify all data persisted (IndexedDB)
6. Export data to JSON
7. Clear all data
8. Import data from JSON
9. Verify restoration

### 4. Price Monitoring
1. Track product
2. Manually trigger price check
3. Verify price history updated
4. Wait for background check
5. Verify automatic update
6. Check notification if price dropped

### 5. Privacy Verification
1. Install extension
2. Open network monitoring (DevTools)
3. Use all features
4. Verify zero external requests
5. Run built-in privacy test
6. Verify all checks pass

## How to Run

### Manual Testing
```bash
# 1. Build extension
npm run build

# 2. Load in Chrome
chrome://extensions/ → Load unpacked → select dist/

# 3. Follow test scenarios above
```

### Automated Testing (TODO)
```bash
# Install Puppeteer
npm install --save-dev puppeteer

# Run tests
npm run test:integration
```

## Test Data

### Sample Amazon URLs
- Product page: `https://www.amazon.com/dp/B08J5F3G18`
- gp/product: `https://www.amazon.com/gp/product/B08J5F3G18`
- With tracking: `https://www.amazon.com/dp/B08J5F3G18?tag=test-20`

### Sample eBay URLs
- Item page: `https://www.ebay.com/itm/123456789`
- BIN listing: `https://www.ebay.com/itm/123456789?hash=...`

### Sample Walmart URLs
- Product page: `https://www.walmart.com/ip/123456789`

## Expected Results

### Successful Product Tracking
- ✅ Product appears in popup
- ✅ Title extracted correctly
- ✅ Price extracted correctly
- ✅ Currency detected
- ✅ Price history initialized
- ✅ Product ID saved

### Successful Alert
- ✅ Alert saved to IndexedDB
- ✅ Target price stored
- ✅ Alert appears in popup
- ✅ Notification fires when price drops
- ✅ Notification has correct buttons

### Successful Privacy Test
- ✅ IndexedDB accessible
- ✅ Chrome APIs available
- ✅ No external requests detected
- ✅ Offline functionality works
- ✅ Cookie API never used

## Known Issues

### Non-Blocking
- PNG icons missing (default icon shown)
- First load may take 2-3 seconds (IndexedDB init)

### Blocking (Report These)
- Product not tracking: Check console errors
- Price not extracted: Check DOM structure changed
- Notification not firing: Check permissions
- Data not persisting: Check IndexedDB quota

## Debugging

### Enable Debug Logs
```javascript
// In background worker console
localStorage.setItem('DEBUG', 'true');
```

### Check IndexedDB
```javascript
// In popup console
chrome.storage.local.get(null, console.log);
```

### Monitor Network
1. Open DevTools → Network tab
2. Use extension features
3. Should see ZERO requests to external servers
4. Only requests: Amazon/eBay/Walmart product pages

## Regression Tests

After each release, verify:
- [ ] Amazon tracking works
- [ ] Popup displays products
- [ ] Chart modal opens
- [ ] Alert can be set
- [ ] Manual refresh works
- [ ] Settings page loads
- [ ] Data export works
- [ ] Data import works
- [ ] Privacy test passes
- [ ] No console errors

## Performance Benchmarks

Target metrics:
- Extension load time: <1s
- Product tracking: <2s
- Popup open: <500ms
- Chart render: <300ms
- Memory usage: <50MB
- IndexedDB operations: <100ms

Measure with:
```javascript
// In background console
performance.mark('start');
// ... operation ...
performance.mark('end');
performance.measure('operation', 'start', 'end');
console.log(performance.getEntriesByType('measure'));
```

## CI/CD Integration (TODO)

```yaml
# .github/workflows/integration-test.yml
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
```
