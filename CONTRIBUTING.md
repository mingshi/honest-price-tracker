# Contributing to Honest Price Tracker

Thank you for your interest in contributing! We welcome contributions from the community.

## 🎯 Our Mission

Stop companies like Honey from hijacking cookies and selling user data. We believe price tracking should be:
- **Honest** - No fake coupons, no hidden agendas
- **Private** - 100% local processing, no data uploads
- **Transparent** - Open source, auditable code

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug is already reported in [Issues](https://github.com/YOUR_USERNAME/honest-price-tracker/issues)
2. If not, create a new issue with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots if applicable

### Suggesting Features

1. Check [existing feature requests](https://github.com/YOUR_USERNAME/honest-price-tracker/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with:
   - Clear description of the feature
   - Use case / why it's needed
   - Proposed implementation (optional)

### Code Contributions

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**:
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation
4. **Commit**: Use clear commit messages
   - Good: "Add eBay price extraction support"
   - Bad: "Update code"
5. **Push**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**:
   - Link related issues
   - Describe what you changed and why
   - Add screenshots for UI changes

### Adding Retailer Support

We currently support Amazon, eBay, and Walmart. To add a new retailer:

1. Create `src/extractors/[retailer].ts` following this template:

```typescript
export interface Product {
  retailer: string;
  title: string;
  price: number;
  currency: string;
  productId: string;
  url: string;
  imageUrl?: string;
}

export function extractProduct(): Product | null {
  // Your extraction logic here
  const priceElement = document.querySelector('.price-selector');
  const price = parseFloat(priceElement?.textContent || '0');
  
  return {
    retailer: 'your-retailer',
    title: 'Product title',
    price: price,
    currency: 'USD',
    productId: 'ABC123',
    url: window.location.href
  };
}
```

2. Add retailer detection in `src/content/index.ts`
3. Add host permission in `manifest.json`
4. Add tests in `tests/extractors/[retailer].test.ts`
5. Update README with new retailer

## 📜 Code Style

- **TypeScript**: Use strict mode, no `any` types
- **Formatting**: 2 spaces indentation
- **Naming**: 
  - Variables/functions: `camelCase`
  - Classes/interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Comments**: Explain "why", not "what"

## 🧪 Testing

Before submitting:

```bash
npm run test        # Run unit tests
npm run build       # Verify build succeeds
npm run lint        # Check code style (if we add linter)
```

Manual testing:
1. Load extension in Chrome (`chrome://extensions/`)
2. Test on multiple retailers
3. Verify no console errors
4. Test offline functionality

## 🚫 What We Don't Accept

- **Cookie modification code** - Never. This is our core principle.
- **External data uploads** - All processing must be local
- **Tracking/analytics** - No user behavior tracking
- **Obfuscated code** - Must be readable and auditable
- **Non-MIT compatible licenses** - Keep dependencies MIT/BSD/Apache 2.0

## ⚡ Quick Tips

- **Start small**: Fix typos, improve docs, add tests
- **Ask questions**: Open an issue if you're unsure
- **Be patient**: Reviews may take a few days
- **Be respectful**: We're all volunteers building something good

## 📞 Questions?

- **GitHub Issues**: Technical questions
- **Reddit**: r/HonestPriceTracker (community)
- **Email**: [maintainer email] (security issues only)

---

**Thank you for helping us build an honest alternative to Honey!** 🎉
