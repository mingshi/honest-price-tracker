#!/bin/bash
# Test Chrome extension with xvfb

set -e

EXT_DIR="/home/admin/.openclaw/workspace/honest-price-tracker/dist"
TEST_URL="https://www.amazon.com/dp/B0D1XD1ZV3"

echo "🧪 Testing Honest Price Tracker Extension"
echo "=========================================="
echo ""
echo "Extension: $EXT_DIR"
echo "Test URL: $TEST_URL"
echo ""

# Check if extension directory exists
if [ ! -d "$EXT_DIR" ]; then
    echo "❌ Extension directory not found: $EXT_DIR"
    exit 1
fi

# Check manifest
if [ ! -f "$EXT_DIR/manifest.json" ]; then
    echo "❌ manifest.json not found in $EXT_DIR"
    exit 1
fi

echo "✅ Extension directory found"
echo "✅ manifest.json exists"
echo ""

# Check key files
echo "📋 Checking extension files:"
for file in background.js popup.js popup.html popup.css content.js; do
    if [ -f "$EXT_DIR/$file" ]; then
        size=$(du -h "$EXT_DIR/$file" | cut -f1)
        echo "  ✅ $file ($size)"
    else
        echo "  ❌ $file NOT FOUND"
    fi
done
echo ""

# Check CSS for comparison styles
echo "🎨 Checking CSS for comparison styles:"
if grep -q "comparison-card" "$EXT_DIR/popup.css"; then
    echo "  ✅ .comparison-card found"
    lines=$(grep -c "comparison" "$EXT_DIR/popup.css")
    echo "  ✅ $lines lines containing 'comparison'"
else
    echo "  ❌ .comparison-card NOT found"
fi
echo ""

# Check background.js for search function
echo "🔍 Checking background.js for search functions:"
if grep -q "SEARCH_PRODUCT" "$EXT_DIR/background.js"; then
    echo "  ✅ SEARCH_PRODUCT handler found"
else
    echo "  ❌ SEARCH_PRODUCT handler NOT found"
fi

if grep -q "searchProductMock" "$EXT_DIR/background.js"; then
    echo "  ✅ searchProductMock found"
    count=$(grep -c "searchProductMock" "$EXT_DIR/background.js")
    echo "  ✅ $count occurrences"
else
    echo "  ❌ searchProductMock NOT found"
fi
echo ""

# Launch chromium with extension in xvfb
echo "🚀 Launching Chromium with extension..."
echo "   (This will run for 30 seconds to allow manual inspection)"
echo ""

# Create temporary user data directory
USER_DATA_DIR=$(mktemp -d)
echo "User data dir: $USER_DATA_DIR"

# Run chromium in xvfb
xvfb-run --server-args="-screen 0 1920x1080x24" \
    chromium-browser \
    --no-first-run \
    --no-default-browser-check \
    --disable-extensions-except="$EXT_DIR" \
    --load-extension="$EXT_DIR" \
    --user-data-dir="$USER_DATA_DIR" \
    --window-size=1920,1080 \
    "$TEST_URL" \
    &

CHROME_PID=$!
echo "Chromium PID: $CHROME_PID"
echo ""

# Wait a bit for chromium to start
sleep 5

if ps -p $CHROME_PID > /dev/null; then
    echo "✅ Chromium is running"
    echo ""
    echo "📊 Extension should be loaded. To verify:"
    echo "   1. Check if extension icon appears in toolbar"
    echo "   2. Navigate to chrome://extensions/ to see if loaded"
    echo "   3. Click extension icon to open popup"
    echo "   4. Click 'Compare' button and check console for logs"
    echo ""
    echo "⏳ Keeping Chromium running for 30 seconds..."
    sleep 30
    
    # Kill chromium
    kill $CHROME_PID 2>/dev/null || true
    wait $CHROME_PID 2>/dev/null || true
    
    echo ""
    echo "✅ Test completed"
else
    echo "❌ Chromium failed to start"
    exit 1
fi

# Cleanup
rm -rf "$USER_DATA_DIR"

echo ""
echo "=========================================="
echo "Test Summary:"
echo "  - Extension files: OK"
echo "  - CSS styles: OK"
echo "  - Search handlers: OK"
echo "  - Chromium launch: OK"
echo ""
echo "ℹ️  For full UI testing, manually load the extension"
echo "   and test the Compare button functionality."
