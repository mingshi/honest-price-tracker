# 💰 Honest Price Tracker

**Privacy-first price tracking extension for Chrome. No cookie hijacking. No fake coupons. Just honest price tracking.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)
[![GitHub Stars](https://img.shields.io/github/stars/mingshi/honest-price-tracker?style=social)](https://github.com/mingshi/honest-price-tracker)

---

## 🎯 Why Honest Price Tracker?

### The Problem with Honey & Others

Extensions like **Honey** and **Rakuten** have a dark secret:

❌ **They hijack your affiliate cookies** - replacing the creator's commission with their own  
❌ **They upload your browsing data** - tracking every product you view  
❌ **They show fake coupons** - that never work, just to collect your clicks  
❌ **Hidden revenue model** - you think it's free, but you're the product  

### Our Solution

✅ **100% Privacy-First** - All data stays on YOUR device (IndexedDB)  
✅ **No Cookie Modification** - We NEVER touch your cookies  
✅ **No External Upload** - Zero network requests (except to retailers)  
✅ **100% Open Source** - Audit every line of code yourself  
✅ **Transparent & Honest** - No hidden agendas, no dark patterns  

---

## ✨ Features

### 📊 Price Tracking
- **Automatic tracking** when you visit Amazon, eBay, or Walmart product pages
- **Historical price charts** showing price trends over time
- **Price statistics**: current, lowest, highest, average prices
- **Multi-currency support**: automatically detects product currency

### 🔔 Price Alerts
- Set target price for any tracked product
- **Real-time browser notifications** when price drops below your target
- **Rich notifications** with quick actions (View Product, Dismiss)
- No email delays - instant alerts

### 📈 Price History Visualization
- **Interactive charts** showing price changes over time
- **On-page widget** (Keepa-style) injected into product pages
- **Popup dashboard** for quick overview of all tracked products
- **Price comparison**: see how current price compares to historical low/high

### 🔒 Privacy Guaranteed
- **100% local storage** (IndexedDB) - nothing uploaded to external servers
- **No analytics** - we don't track you
- **No third-party services** - zero external dependencies
- **GDPR/CCPA compliant** - export/delete your data anytime
- **Open source** - verify our privacy claims yourself

### 🎨 User Interface
- **Modern popup** with product cards and statistics
- **Settings page** with customizable check frequency (1h - 24h)
- **Data management**: export/import backup, clear all data
- **Toast notifications** for user feedback
- **Responsive design** optimized for all screen sizes

---

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
1. Visit [Chrome Web Store](#) (link pending review)
2. Click "Add to Chrome"
3. Done! Visit any Amazon/eBay/Walmart product page to start tracking

### From Source (For Developers)
```bash
# Clone repository
git clone https://github.com/mingshi/honest-price-tracker.git
cd honest-price-tracker

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist/` folder
```

---

## 📖 How to Use

### 1. Track a Product
- Visit any Amazon, eBay, or Walmart product page
- Extension automatically detects and tracks the product
- View tracked products in the popup (click extension icon)

### 2. View Price History
- **In Popup**: Click "📈 Chart" button on any product card
- **On Product Page**: Price history widget appears automatically below product details

### 3. Set Price Alert
- Click "🔔 Alert" button on product card
- Enter your target price
- Get notified instantly when price drops

### 4. Manage Settings
- Click extension icon → Click "⚙️" button
- Customize:
  - Notification preferences
  - Price check frequency (1h/3h/6h/12h/24h)
  - Export/import data
  - Clear all data

---

## 🆚 Comparison

| Feature | Honest Price Tracker | Honey | Keepa |
|---------|---------------------|-------|-------|
| **Privacy** | 100% local, no upload | ❌ Uploads browsing data | ❌ Uploads to servers |
| **Cookie Modification** | ✅ Never | ❌ Hijacks affiliate cookies | ✅ Doesn't modify |
| **Price Tracking** | ✅ Amazon, eBay, Walmart | ✅ Multiple sites | ✅ Amazon only |
| **Alerts** | ✅ Free browser notifications | ✅ Free | ❌ $18/month for alerts |
| **Open Source** | ✅ MIT License | ❌ Closed source | ❌ Closed source |
| **Cost** | ✅ Free forever | Free (but you're the product) | Free (limited) / $18/mo |
| **Coupons** | 🚧 Coming soon (verified only) | ❌ Fake coupons | N/A |
| **On-Page Widget** | ✅ Yes | ❌ No | ✅ Yes |

---

## 🔧 Technical Details

### Architecture
- **Manifest V3** - Modern Chrome extension architecture
- **TypeScript** - Type-safe development
- **IndexedDB** - Client-side database for local storage
- **Canvas API** - Price chart rendering (no Chart.js dependency for MVP)
- **Chrome APIs**: `storage`, `notifications`, `alarms`

### Project Structure
```
honest-price-tracker/
├── src/
│   ├── background/       # Service worker (monitoring, alerts)
│   │   ├── index.ts      # Background script entry
│   │   └── monitor.ts    # Price monitoring service
│   ├── content/          # Content scripts (page injection)
│   │   ├── index.ts      # Product detection & tracking
│   │   └── inject.ts     # On-page widget injection
│   ├── extractors/       # Price extraction logic
│   │   ├── amazon.ts     # Amazon price extractor
│   │   ├── ebay.ts       # eBay extractor (TODO)
│   │   └── walmart.ts    # Walmart extractor (TODO)
│   ├── storage/          # IndexedDB wrapper
│   │   └── db.ts         # Database operations
│   ├── components/       # Reusable UI components
│   │   └── PriceChart.ts # Price history chart
│   ├── popup/            # Extension popup UI
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── popup.css
│   └── options/          # Settings page
│       ├── index.html
│       ├── index.ts
│       └── options.css
├── dist/                 # Built extension (load in Chrome)
├── tests/                # Unit tests
├── assets/               # Icons and images
├── manifest.json         # Extension manifest
├── webpack.config.js     # Build configuration
└── tsconfig.json         # TypeScript configuration
```

### Data Schema (IndexedDB)
```typescript
// Object Store: products
{
  id: string;              // "{retailer}_{productId}"
  url: string;             // Product URL
  title: string;           // Product name
  retailer: string;        // "amazon" | "ebay" | "walmart"
  productId: string;       // ASIN, item ID, etc.
  currentPrice: number;    // Latest price
  lowestPrice: number;     // Historical low
  highestPrice: number;    // Historical high
  averagePrice: number;    // Average price
  currency: string;        // "USD", "EUR", etc.
  firstTracked: number;    // Timestamp
  lastChecked: number;     // Timestamp
  checkCount: number;      // Total checks
}

// Object Store: price_history
{
  id?: number;             // Auto-increment
  productKey: string;      // Foreign key to products
  price: number;           // Price at this point
  timestamp: number;       // When recorded
  source: string;          // "manual" | "auto"
}

// Object Store: alerts
{
  id?: number;             // Auto-increment
  productKey: string;      // Foreign key to products
  targetPrice: number;     // Alert threshold
  notified: boolean;       // Already sent notification?
  createdAt: number;       // Timestamp
}

// Object Store: settings
{
  key: string;             // Setting name
  value: any;              // Setting value
}
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm
- Chrome/Chromium browser

### Setup
```bash
# Install dependencies
npm install

# Start development mode (watch mode)
npm run watch

# Build for production
npm run build

# Run tests (requires setup)
npm test

# Lint code
npm run lint
```

### Testing Extension
1. Build: `npm run build`
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder
5. Visit Amazon product page to test

### Adding a New Retailer
1. Create extractor: `src/extractors/{retailer}.ts`
2. Implement interface:
   ```typescript
   export function is{Retailer}ProductPage(): boolean
   export function extract{Retailer}Product(): Promise<ProductData>
   ```
3. Register in `src/content/index.ts`
4. Add permission in `manifest.json`: `*://*.{retailer}.com/*`
5. Update `src/content/inject.ts` with injection point

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 **Report bugs** - Open an issue with reproduction steps
- ✨ **Suggest features** - Share your ideas in discussions
- 🔧 **Fix issues** - Submit a pull request
- 📖 **Improve docs** - Help make instructions clearer
- 🌐 **Add retailers** - Implement new price extractors (eBay, Walmart, Target, etc.)
- 🧪 **Write tests** - Increase test coverage

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

---

## 📋 Roadmap

### ✅ MVP (v0.1.0) - Current
- [x] Amazon price tracking
- [x] Price history charts
- [x] Browser notifications
- [x] Settings page
- [x] Data export/import
- [x] On-page widget injection

### 🚧 v0.2.0 - Next
- [ ] eBay price extractor
- [ ] Walmart price extractor
- [ ] Target price extractor
- [ ] Chart.js integration (better charts)
- [ ] Fake review detection

### 🔮 v0.3.0 - Future
- [ ] Verified coupon testing (real success rates)
- [ ] Community coupon contributions
- [ ] Multi-language support
- [ ] Firefox extension port
- [ ] Safari extension port
- [ ] Price prediction (ML model)

---

## 📜 License

[MIT License](LICENSE) - Feel free to use, modify, and distribute.

**TL;DR**: You can do whatever you want with this code, as long as you include the original license.

---

## 🔒 Privacy Policy

Full policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

**Summary**:
- ✅ All data stored locally on your device
- ✅ Zero data collection or transmission
- ✅ No analytics, no tracking, no third-party services
- ✅ GDPR/CCPA compliant
- ✅ You can export/delete your data anytime

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mingshi/honest-price-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mingshi/honest-price-tracker/discussions)
- **Email**: privacy@tokensdance.ai (for privacy concerns)
- **Website**: [honest-price-tracker.tokensdance.ai](https://honest-price-tracker.tokensdance.ai)

---

## 🙏 Acknowledgments

- Inspired by the need for honest, privacy-respecting browser extensions
- Built in response to Honey's cookie hijacking controversy
- Thanks to the open-source community for making this possible

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=mingshi/honest-price-tracker&type=Date)](https://star-history.com/#mingshi/honest-price-tracker&Date)

---

**Made with ❤️ and honesty**

*No dark patterns. No hidden agendas. Just price tracking done right.*
