# Privacy Policy for Honest Price Tracker

**Last Updated**: March 17, 2026  
**Effective Date**: March 17, 2026

---

## Our Core Commitment

**Honest Price Tracker is built on one simple principle: Your data belongs to you.**

Unlike other price tracking extensions (like Honey), we:
- ✅ **NEVER** modify your cookies
- ✅ **NEVER** upload your browsing data
- ✅ **NEVER** sell your information to third parties
- ✅ Process everything **locally on YOUR device**

This isn't marketing speak. This is how our extension is fundamentally architected.

---

## What Data We Collect

### Data Stored Locally on Your Device

The following data is stored **exclusively on your device** using Chrome's local storage:

1. **Tracked Product Information**
   - Product URLs you choose to track
   - Product titles
   - Current and historical prices
   - Product images (URLs only)
   - Timestamp of when you added the product

2. **Price History**
   - Historical price data for tracked products
   - Stored in your browser's IndexedDB
   - Limited to last 100 price points per product

3. **Your Settings**
   - Price check frequency
   - Notification preferences
   - Custom alert thresholds

### Data We Do NOT Collect

We explicitly **do not** collect:
- ❌ Your browsing history
- ❌ Personal information (name, email, address)
- ❌ Payment information
- ❌ Cookies or session data
- ❌ Analytics or usage statistics
- ❌ Any data from websites you visit

---

## How We Use Your Data

**Short answer: We don't "use" your data because we never have access to it.**

All data processing happens **locally on your device**:

1. **Price Extraction**: When you visit Amazon, eBay, or Walmart, our extension reads the product page **in your browser** to extract price information. This happens entirely on your device.

2. **Price Monitoring**: Our background service worker checks tracked product pages **from your browser** at intervals you set. No data is sent to any server.

3. **Notifications**: When prices drop, we use Chrome's notification API to alert you. No external service is involved.

---

## Data Storage Location

**All data is stored in Chrome's built-in storage mechanisms:**

1. **chrome.storage.local**: For tracked products and settings
2. **IndexedDB** (future): For price history
3. **No external servers**: We don't operate any servers to store your data

**You can verify this yourself:**
1. Open Chrome DevTools (F12)
2. Go to Application → Storage
3. Check IndexedDB and Local Storage
4. You'll see all your data stored locally

---

## Data Sharing

**We never share your data because we never have access to it.**

Specifically:
- ❌ No third-party analytics (no Google Analytics, no Mixpanel)
- ❌ No advertising networks
- ❌ No data brokers
- ❌ No "anonymized" data sharing
- ❌ No cookies modified or tracked

---

## How We're Different from Competitors

### Honey (PayPal)
- ❌ **Modifies cookies** to hijack affiliate links
- ❌ **Uploads browsing data** to their servers
- ❌ **Shares data** with PayPal and partners

**Honest Price Tracker**:
- ✅ **Never touches cookies**
- ✅ **Zero data upload**
- ✅ **100% local processing**

### Keepa
- ⚠️ **Uploads price data** to their servers
- ⚠️ **Requires account** (email collection)
- ⚠️ **Cloud-based processing**

**Honest Price Tracker**:
- ✅ **All data stays local**
- ✅ **No account required**
- ✅ **On-device processing**

---

## Technical Architecture (For Transparency)

### How Price Extraction Works

```javascript
// This code runs ONLY in your browser
function extractAmazonPrice() {
  // Read price from the page you're viewing
  const price = document.querySelector('.a-price-whole')?.textContent;
  
  // Store locally in YOUR browser
  chrome.storage.local.set({ currentPrice: price });
  
  // NO network request is made
  // NO data is uploaded
}
```

### Offline Test

**You can verify our privacy commitment:**

1. Disconnect your internet
2. Use the extension (track products, view history)
3. Everything still works

**Why?** Because we never need to contact any server. Everything runs on your device.

---

## Permissions Explained

Our extension requests the following Chrome permissions:

### 1. `storage`
**Why**: To save your tracked products and settings locally
**What we do**: Store data in `chrome.storage.local` (on your device)
**What we DON'T do**: Upload this data anywhere

### 2. `notifications`
**Why**: To alert you when prices drop
**What we do**: Use Chrome's built-in notification API
**What we DON'T do**: Send notifications through any third-party service

### 3. `alarms`
**Why**: To schedule periodic price checks
**What we do**: Use Chrome's alarm API to wake up our service worker
**What we DON'T do**: Contact any external server

### 4. `host_permissions` (Amazon, eBay, Walmart)
**Why**: To read product information when you visit these sites
**What we do**: Extract price and title from the page you're viewing
**What we DON'T do**: Track your browsing or access other sites

---

## Your Rights (GDPR, CCPA, and Beyond)

Even though we don't collect data, we respect your rights:

### Right to Access
**You have full access** to all data stored by the extension:
- Chrome DevTools → Application → Storage
- Settings → Export Data (backup your tracking list)

### Right to Deletion
**You can delete data at any time**:
- Remove individual products from tracking list
- Settings → Clear All Data (delete everything)
- Uninstall extension (automatic full deletion)

### Right to Portability
**Export your data anytime**:
- Settings → Export Data → JSON file
- Take your tracking list to another service
- No vendor lock-in

### Right to Object
**You control what we process**:
- Disable price monitoring in Settings
- Disable notifications
- Untrack specific products

### Right to be Forgotten
**Simply uninstall the extension.** Since we have no servers, there's nothing for us to "forget" — your data never left your device.

---

## Cookies and Tracking

### Our Cookie Policy

**We do not use cookies. Period.**

Unlike other extensions:
- ❌ No analytics cookies
- ❌ No advertising cookies
- ❌ No session cookies
- ❌ No affiliate cookies

**We specifically never:**
- Modify retailer cookies (unlike Honey's affiliate hijacking)
- Set our own cookies
- Read cookies from websites you visit
- Share cookies with third parties

### Browser Fingerprinting

**We do not collect browser fingerprints.**

We don't collect:
- Your IP address
- Your user agent
- Your screen resolution
- Your installed fonts
- Your timezone
- Any device identifiers

### Tracking Prevention

**We don't track you because tracking is fundamentally incompatible with our architecture.**

- No Google Analytics
- No Facebook Pixel
- No Mixpanel
- No Hotjar
- No Amplitude
- No Sentry error tracking (we use local logging)

---

## Data Security

Since all data is stored locally on your device:

1. **Your responsibility**: Keep your device secure with a strong password
2. **Chrome's security**: Your data is protected by Chrome's built-in security
3. **No server breaches**: Since we have no servers, there's nothing for hackers to breach
4. **Encryption at rest**: Chrome encrypts your local storage automatically
5. **No man-in-the-middle attacks**: Since there's no network communication, there's nothing to intercept

---

## Data Retention

**You control data retention:**

- **Automatic**: We keep the last 100 price points per product (to save space)
- **Manual deletion**: You can delete all data at any time via Settings → Clear All Data
- **Uninstall**: Uninstalling the extension removes all stored data

---

## Children's Privacy

Honest Price Tracker does not knowingly collect data from children under 13. Since we don't collect any data at all, this is inherently compliant with COPPA.

---

## Changes to This Policy

If we ever make changes to this privacy policy, we will:

1. Update the "Last Updated" date at the top
2. Notify you via an extension update
3. Require your consent if the changes are material

We commit to **never** adding data collection without explicit user consent.

---

## Third-Party Services

**We use ZERO third-party services.**

Specifically, we do NOT use:
- ❌ Cloud storage providers (AWS, Google Cloud, Azure)
- ❌ Analytics services (Google Analytics, Mixpanel, Amplitude)
- ❌ Error tracking (Sentry, Rollbar, Bugsnag)
- ❌ A/B testing platforms
- ❌ Customer support tools (Intercom, Zendesk)
- ❌ Payment processors (not applicable, extension is free)
- ❌ CDNs (no external resources loaded)
- ❌ Ad networks
- ❌ Social media widgets

**Our extension loads ZERO external resources.** You can verify this in Chrome DevTools → Network tab.

---

## Compliance

### GDPR (European Union)
**Status**: Fully compliant

Since we don't collect, process, or store personal data on any server, we have no GDPR obligations. All data remains on your device, under your control.

**Specific GDPR rights:**
- ✅ Right to access: You have full access via Chrome DevTools
- ✅ Right to rectification: Edit your tracked products anytime
- ✅ Right to erasure: Delete data in Settings or uninstall
- ✅ Right to data portability: Export data as JSON
- ✅ Right to object: Disable features in Settings
- ✅ Right to be informed: This privacy policy

### CCPA (California Consumer Privacy Act)
**Status**: Fully compliant

We don't "sell" data because we never have access to it. You have full control over your data through Chrome's storage management.

**Specific CCPA rights:**
- ✅ Right to know: This policy discloses everything
- ✅ Right to delete: Settings → Clear All Data
- ✅ Right to opt-out of sale: Not applicable (we don't sell data)
- ✅ Right to non-discrimination: Not applicable (all features are equal)

### PIPEDA (Canada)
**Status**: Fully compliant

No personal information is collected, so PIPEDA obligations do not apply.

### Other Jurisdictions
Our architecture inherently complies with all privacy laws because we don't collect data.

**Countries with strong data protection**: 🇪🇺 EU, 🇬🇧 UK, 🇨🇭 Switzerland, 🇨🇦 Canada, 🇦🇺 Australia, 🇧🇷 Brazil, 🇯🇵 Japan, 🇰🇷 South Korea — all covered by our local-only architecture.

---

## Verification and Auditing

### Open Source
Our code is **fully open source** on GitHub:
- Repository: https://github.com/honest-price-tracker
- License: MIT
- Anyone can audit our code

### Offline Test
1. Install the extension
2. Disconnect internet
3. Verify it still works
4. This proves no data upload

### DevTools Inspection
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Use the extension
4. See zero network requests to external servers

---

## Contact Us

If you have questions about this privacy policy:

- **GitHub Issues**: https://github.com/mingshi/honest-price-tracker/issues
- **Email**: privacy@tokensdance.ai
- **Website**: https://honest-price-tracker.tokensdance.ai

---

## Legal Basis

This extension is provided "as is" under the MIT License. By using it, you agree to:

1. This privacy policy
2. Our Terms of Service (coming soon)
3. Chrome Web Store's policies

---

## Summary (TL;DR)

**We built this extension because we were tired of tools that hijack cookies and steal data.**

**Our commitment is simple:**
- Your data stays on **YOUR** device
- We **NEVER** modify cookies
- We **NEVER** upload data
- Everything is **open source** and verifiable

**This isn't a marketing promise. This is our architecture.**

If you find any evidence that we're violating this policy, please report it immediately. We'll fix it or shut down the extension.

**Privacy first. Always.**

---

**Version**: 1.0  
**Last Reviewed**: March 17, 2026
