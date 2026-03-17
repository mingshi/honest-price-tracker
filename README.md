# Honest Price Tracker

> Privacy-first price tracker. No cookie hijacking. No fake coupons. Just honest price tracking.

## 🎯 Mission

Stop companies like Honey from hijacking your affiliate cookies and selling your data. We believe price tracking should be **honest**, **private**, and **transparent**.

## ✨ Features (MVP)

- ✅ **100% Local Processing** - All data stored on your device using IndexedDB
- ✅ **No Cookie Modification** - We never touch your cookies (unlike Honey)
- ✅ **Multi-Retailer Support** - Amazon, eBay, Walmart
- ✅ **Price History Charts** - Visualize price trends over time
- ✅ **Real-Time Alerts** - Browser notifications when prices drop
- ✅ **Offline Test Feature** - Prove that we work 100% offline

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

### Development Mode

```bash
npm run watch
```

## 📁 Project Structure

```
honest-price-tracker/
├── src/
│   ├── background/       # Background service worker
│   ├── content/          # Content scripts (injected into pages)
│   ├── popup/            # Extension popup UI
│   ├── options/          # Settings page
│   ├── extractors/       # Retailer-specific price extractors
│   ├── storage/          # IndexedDB wrapper
│   ├── features/         # Core features (offline test, coupon tester, etc.)
│   └── utils/            # Shared utilities
├── assets/               # Icons and images
├── tests/                # Unit and integration tests
└── docs/                 # Documentation

```

## 🚀 Roadmap

- [x] Phase 1: Technical validation
- [ ] Phase 2: MVP development (in progress)
- [ ] Phase 3: Testing & Chrome Web Store launch

## 📜 License

MIT © 2026 MingshiHacking

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 💬 Support

- GitHub Issues: [Report bugs](https://github.com/YOUR_USERNAME/honest-price-tracker/issues)
- Reddit: r/HonestPriceTracker (coming soon)

---

**Remember**: You deserve honest tools. No dark patterns. No hidden agendas. Just price tracking done right.
