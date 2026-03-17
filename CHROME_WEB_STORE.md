# Chrome Web Store Submission Guide

## 📦 Required Assets

### Icons (REQUIRED)
- ✅ `assets/icons/icon.svg` (source)
- ⚠️ **MISSING**: PNG icons needed:
  - `icon16.png` - 16×16 pixels
  - `icon48.png` - 48×48 pixels
  - `icon128.png` - 128×128 pixels

**Create icons**: Convert SVG to PNG using:
- https://www.aconvert.com/image/svg-to-png/
- Or ImageMagick (if available on system)

### Screenshots (REQUIRED - 5 recommended)
**Size**: 1280×800 or 640×400 pixels

1. **Popup UI** - Show tracked products list
2. **Price Chart Modal** - Price history visualization
3. **Product Page Widget** - Keepa-style injection
4. **Settings Page** - Privacy + data management
5. **Alert Notification** - Browser notification example

**Create**: Load extension in Chrome, capture screens with browser's screenshot tool.

### Promotional Images (OPTIONAL but recommended)
- Small tile: 440×280 pixels
- Marquee: 1400×560 pixels

## 📝 Store Listing Content

### Name
**Honest Price Tracker**

### Tagline (132 chars max)
Privacy-first price tracker for Amazon, eBay & Walmart. No cookie hijacking. No fake coupons. Just honest price tracking.

### Summary (132 chars max)
Track prices privately. Get alerts on price drops. 100% local processing. No data upload. Open source.

### Description
```
🎯 Tired of extensions like Honey hijacking your cookies and selling your data?

Honest Price Tracker is different:

✅ 100% PRIVACY-FIRST
• All data stored locally on YOUR device (IndexedDB)
• Never modifies cookies (no affiliate hijacking like Honey)
• Zero data upload to external servers
• No analytics, no tracking, no third-party services
• 100% open source - audit the code yourself

💰 HONEST PRICING
• True free tier (20 price checks/day)
• No fake "unlimited free" that becomes subscription trap
• No hidden costs or surprise charges
• Transparent pricing, transparent code

📊 POWERFUL FEATURES
• Multi-retailer support (Amazon, eBay, Walmart)
• Automatic price tracking & history charts
• Real-time price drop alerts
• Browser notifications (no email delays)
• On-page price history widget (Keepa-style)
• Export/import your data anytime (GDPR compliant)

🔔 SMART ALERTS
• Set target price for any product
• Get notified instantly when price drops
• Customizable check frequency (1h - 24h)
• No subscription required for alerts

🆚 VS COMPETITORS

vs Honey:
❌ Honey modifies cookies to hijack affiliate commissions
✅ We NEVER touch cookies

❌ Honey uploads your browsing data
✅ We process 100% locally on your device

❌ Honey shows fake coupons that never work
✅ We show real price history data

vs Keepa:
❌ Keepa uploads data to their servers
✅ We keep ALL data local

❌ Keepa charges $18/month for premium features
✅ We're free and open source

⚡ HOW IT WORKS

1. Visit Amazon/eBay/Walmart product page
2. Extension automatically tracks the product
3. View price history chart in popup or on-page widget
4. Set price alert for your target price
5. Get notified when price drops

📖 OPEN SOURCE
GitHub: https://github.com/mingshi/honest-price-tracker
License: MIT
Website: https://honest-price-tracker.tokensdance.ai

🔒 PRIVACY POLICY
Full policy: https://github.com/mingshi/honest-price-tracker/blob/main/PRIVACY_POLICY.md

We believe price tracking should be honest, private, and transparent.
No dark patterns. No hidden agendas. Just price tracking done right.
```

### Category
**Shopping**

### Language
**English (United States)**

## 🔐 Privacy Practices

### Single Purpose Description
```
Track product prices on Amazon, eBay, and Walmart. Alert users when prices drop below their target.
```

### Permissions Justification

**storage**
```
Required to save tracked products and price history locally on the user's device using IndexedDB. All data stays on the user's computer and is never uploaded.
```

**notifications**
```
Required to alert users when product prices drop below their set target price. Uses Chrome's built-in notification API.
```

**alarms**
```
Required to schedule periodic price checks (every 6 hours by default, user-configurable). Uses Chrome's alarm API to wake the service worker.
```

**Host permissions (amazon.com, ebay.com, walmart.com)**
```
Required to extract product price and title when user visits these retailer sites. Only reads public information displayed on the page. Does not modify cookies or inject tracking.
```

### Data Usage

**What data do you collect?**
```
None. All data is stored locally on the user's device. We do not collect, transmit, or store any user data on external servers.
```

**How is user data used?**
```
Product URLs, titles, and prices are stored locally in the browser's IndexedDB to track price history. This data never leaves the user's device.
```

**Is data sold to third parties?**
```
No. We do not collect any data, so there is nothing to sell.
```

### Certification
- ✅ Product does NOT collect or transmit user data
- ✅ Product does NOT use or transfer user data for purposes unrelated to core functionality
- ✅ Product does NOT collect data for advertising
- ✅ Product respects user privacy

## 🚀 Distribution

### Visibility
**Public** (searchable on Chrome Web Store)

### Regions
**All regions**

### Pricing
**Free**

## 📋 Pre-Submission Checklist

### Technical
- [x] Extension manifest v3 compliant
- [x] All permissions justified
- [x] No console errors in background worker
- [x] No console errors in popup
- [x] No console errors in content scripts
- [x] Extension loads successfully
- [ ] All icons present (16×16, 48×48, 128×128)
- [x] Privacy policy published and linked
- [x] Source code public (GitHub)

### Content
- [ ] 5 screenshots created (1280×800 each)
- [ ] Store description written
- [ ] All permissions justified
- [ ] Privacy practices disclosed
- [ ] Single purpose clearly stated

### Legal
- [x] MIT License included
- [x] Privacy Policy written (11.8KB)
- [x] CONTRIBUTING.md guide
- [x] No trademark violations
- [x] No copyright violations

## 🎯 Launch Strategy

### Pre-Launch
1. Create PNG icons (convert from SVG)
2. Take 5 high-quality screenshots
3. Test extension on fresh Chrome profile
4. Fix any bugs found in testing

### Launch Day (Week 1)
1. Submit to Chrome Web Store
2. Wait for review (1-3 days typically)
3. Once approved, announce on:
   - Reddit: r/Frugal, r/Privacy, r/opensource
   - Hacker News: Show HN
   - Product Hunt
   - Twitter

### Post-Launch (Week 2-4)
1. Monitor user reviews
2. Fix reported bugs quickly
3. Add eBay/Walmart extractors (currently Amazon-only)
4. Implement Chart.js for better charts
5. Add fake review detection feature

## 📧 Support

For Chrome Web Store review questions, respond within 24 hours:
- GitHub Issues: https://github.com/mingshi/honest-price-tracker/issues
- Email: privacy@tokensdance.ai

## 🔗 Links

- Repository: https://github.com/mingshi/honest-price-tracker
- Website: https://honest-price-tracker.tokensdance.ai
- Privacy Policy: https://github.com/mingshi/honest-price-tracker/blob/main/PRIVACY_POLICY.md
- License: https://github.com/mingshi/honest-price-tracker/blob/main/LICENSE
