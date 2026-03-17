# Brand Guidelines - Honest Price Tracker

Visual identity and brand usage guidelines.

---

## Brand Identity

### Mission
**"Honest, privacy-first price tracking"**

We exist to provide transparent price tracking without dark patterns, cookie hijacking, or data collection.

### Core Values
1. **Honesty** - No hidden agendas, no fake coupons
2. **Privacy** - User data stays on user devices
3. **Transparency** - Open source, auditable code
4. **Respect** - For users, creators, and truth

---

## Logo Usage

### Primary Logo
![Primary Logo](./logo-variations.svg#primary-logo)

**When to use**: Main branding, app icons, headers

**Specifications**:
- Circle: #4CAF50 (brand green)
- Emoji: 💰 (money bag)
- Text: #2c3e50 (dark gray)

### Horizontal Logo
![Horizontal Logo](./logo-variations.svg#horizontal-logo)

**When to use**: Website headers, email signatures, promotional materials

**Minimum width**: 200px

### Icon Only
![Icon Only](./logo-variations.svg#icon-only)

**When to use**: App icons, favicons, social media avatars

**Sizes needed**:
- 16×16 (favicon)
- 48×48 (extension)
- 128×128 (Chrome Web Store)
- 512×512 (high resolution)

### Text Only
![Text Only](./logo-variations.svg#text-only)

**When to use**: Plain text contexts, merchandise

**Font**: Arial Bold (or similar sans-serif)

---

## Color Palette

### Primary Colors

**Brand Green** (#4CAF50)
- Main brand color
- Buttons, links, accents
- Represents: Trust, growth, honesty

**Dark Gray** (#2c3e50)
- Text, headings
- Professional, readable

**White** (#FFFFFF)
- Backgrounds, contrast
- Clean, simple

### Secondary Colors

**Light Gray** (#f5f7fa)
- Backgrounds, cards
- Subtle contrast

**Medium Gray** (#8899a6)
- Secondary text, captions
- Less emphasis

**Blue** (#2196F3)
- Info states, current price indicator
- Represents: Reliability, data

**Red** (#f44336)
- Alerts, price increases
- Represents: Attention, warning

**Yellow/Orange** (#ff9800)
- Warnings, problem cards
- Represents: Caution

---

## Typography

### Primary Font
**System Font Stack**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

**Why**: Native look, fast loading, no external requests

### Font Sizes

**Headings**:
- H1: 36-48px (bold)
- H2: 28-32px (semi-bold)
- H3: 20-24px (semi-bold)

**Body**:
- Primary: 15-16px (normal)
- Secondary: 13-14px (normal)
- Caption: 11-12px (normal)

**Buttons**: 14-16px (semi-bold)

---

## Icon System

### Emoji Icons (Primary)
We use emoji for quick visual recognition:

- 💰 Money bag - Main logo, pricing
- 🔒 Lock - Privacy, security
- 🍪 Cookie - Cookie policy
- 📊 Chart - Price history
- 🔔 Bell - Alerts, notifications
- ⚙️ Gear - Settings
- ✅ Check mark - Success, verified
- ❌ Cross mark - Failure, blocked
- 📈 Chart increasing - Trending up
- 📉 Chart decreasing - Price drop

**Why emoji**: Universal, no licensing, loads instantly

### SVG Icons (Secondary)
For more complex UI elements:
- Menu icons
- Chart elements
- Loading states

**Style**: Outline, 2px stroke, rounded corners

---

## Voice & Tone

### Voice Characteristics
- **Honest**: Direct, no marketing fluff
- **Friendly**: Approachable, not corporate
- **Technical**: Accurate, precise
- **Confident**: We know what we're doing

### Tone Examples

**✅ Good**:
- "We never modify cookies. Here's proof."
- "Your data stays on your device. Verify it yourself."
- "100% open source. Audit the code."

**❌ Bad**:
- "We're the best price tracker!" (marketing fluff)
- "Trust us with your data" (anti-privacy)
- "Amazing features!" (vague claims)

### Writing Style
- **Short sentences** - Easy to scan
- **Active voice** - Clear and direct
- **Specific claims** - "100% local" not "very private"
- **Verifiable** - Link to code, show proof

---

## UI Design Principles

### 1. Privacy-First
- No tracking pixels
- No external fonts (system fonts only)
- No analytics
- Clear data flow diagrams

### 2. Honest Transparency
- Show what we do (and don't do)
- Comparison tables (honest, not biased)
- Open about limitations
- Link to source code

### 3. Clean Simplicity
- Minimal design
- White space
- Clear hierarchy
- No clutter

### 4. Instant Feedback
- Loading states visible
- Actions have immediate response
- Error messages helpful
- Success confirmations clear

---

## UI Components

### Buttons

**Primary** (Call-to-action):
```css
background: #4CAF50;
color: white;
padding: 12px 24px;
border-radius: 6px;
font-weight: 600;
```

**Secondary** (Alternative action):
```css
background: #f0f0f0;
color: #2c3e50;
padding: 12px 24px;
border-radius: 6px;
```

**Danger** (Destructive action):
```css
background: #fee;
color: #f44336;
padding: 12px 24px;
border-radius: 6px;
```

### Cards
```css
background: white;
border-radius: 12px;
padding: 20px;
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```

### Modals
```css
background: white;
border-radius: 16px;
padding: 32px;
max-width: 500px;
box-shadow: 0 8px 32px rgba(0,0,0,0.2);
```

---

## Marketing Materials

### Screenshots
- **Resolution**: 1280×800 or higher
- **Style**: Clean, annotated
- **Focus**: One feature per screenshot
- **Text**: Large enough to read

### Social Media
- **Cover images**: 1200×628
- **Profile picture**: 512×512 (icon only)
- **Posts**: Include logo or brand color

### Promotional Graphics
- **Background**: White or brand green gradient
- **Text**: High contrast, readable
- **CTA**: Clear and prominent

---

## Brand Do's and Don'ts

### ✅ Do
- Use brand green (#4CAF50) for primary actions
- Maintain consistent spacing (8px grid)
- Show comparisons honestly
- Link to open source code
- Respect user privacy in messaging

### ❌ Don't
- Use competitor colors (Honey yellow, Keepa blue)
- Exaggerate claims ("best ever")
- Hide limitations
- Use dark patterns
- Track users in marketing materials

---

## Competitive Differentiation

### Visual Differentiators

**vs Honey**:
- Their color: Yellow/Gold (#FFC107)
- Our color: Green (#4CAF50)
- Their vibe: Flashy, promotional
- Our vibe: Clean, transparent

**vs Keepa**:
- Their color: Blue (#1976d2)
- Our color: Green (#4CAF50)
- Their vibe: Data-heavy, technical
- Our vibe: Privacy-focused, friendly

**Our unique position**: Privacy + honesty + open source

---

## Brand Assets

### Logo Files
- `logo.svg` - Vector (scalable)
- `logo-*.png` - Raster (16, 48, 128, 512px)
- `logo-variations.svg` - All variations

### Color Swatches
- `brand-colors.css` - CSS variables
- `brand-colors.json` - JSON format

### Templates
- `email-signature.html` - Email template
- `social-media-cover.svg` - Social cover
- `presentation-template.key` - Slides

---

## License

**Brand assets**: CC BY-SA 4.0 (Creative Commons)
- You can use, modify, share
- Must attribute
- Share-alike (derivatives use same license)

**Exception**: Logo emoji (💰) is Unicode standard

---

## Updates

**Last updated**: 2026-03-17  
**Version**: 1.0  
**Contact**: GitHub Issues for brand questions

---

**Remember**: Our brand is built on honesty. Everything we say must be verifiable in code.
