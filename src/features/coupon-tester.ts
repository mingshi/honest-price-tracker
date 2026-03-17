/**
 * Coupon Tester Feature (MVP Simplified Version)
 * Shows coupon success rates and last verified times
 * Community contribution interface for future iterations
 */

export interface Coupon {
  code: string;
  description: string;
  discount: string;
  source: string; // 'official' | 'community' | 'scraped'
  lastTested: number; // timestamp
  lastWorked: number | null; // timestamp or null if never worked
  successRate: number; // 0-100
  timesUsed: number;
  timesSucceeded: number;
  retailer: string; // 'amazon' | 'ebay' | 'walmart'
  expiresAt: number | null; // timestamp or null
  verified: boolean;
}

export interface CouponTestResult {
  code: string;
  worked: boolean;
  timestamp: number;
  discountAmount?: number;
  errorMessage?: string;
}

/**
 * Get coupons for a retailer
 */
export async function getCouponsForRetailer(
  retailer: string
): Promise<Coupon[]> {
  // In MVP, return empty array (coupons will be added in v0.2)
  // Future: Fetch from local database or community API
  return [];
}

/**
 * Test a coupon code
 * Returns success/failure without actually applying it
 */
export async function testCoupon(
  retailer: string,
  productUrl: string,
  couponCode: string
): Promise<CouponTestResult> {
  // In MVP, this is a placeholder
  // Future implementation would:
  // 1. Open offscreen tab with product
  // 2. Try to apply coupon code
  // 3. Check if discount was applied
  // 4. Return result without completing purchase

  return {
    code: couponCode,
    worked: false,
    timestamp: Date.now(),
    errorMessage: 'Coupon testing not yet implemented in MVP'
  };
}

/**
 * Record coupon test result
 */
export async function recordCouponTest(
  result: CouponTestResult,
  retailer: string
): Promise<void> {
  // Store result in IndexedDB for future analytics
  // This helps build a database of real success rates
  
  try {
    const db = await openCouponDB();
    const tx = db.transaction('coupon_tests', 'readwrite');
    const store = tx.objectStore('coupon_tests');
    
    const request = store.add({
      ...result,
      retailer,
      recordedAt: Date.now()
    });
    
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to record coupon test:', error);
  }
}

/**
 * Get coupon statistics
 */
export async function getCouponStats(
  retailer: string,
  couponCode: string
): Promise<{
  totalTests: number;
  totalSuccesses: number;
  successRate: number;
  lastTested: number | null;
  lastWorked: number | null;
}> {
  try {
    const db = await openCouponDB();
    const tx = db.transaction('coupon_tests', 'readonly');
    const store = tx.objectStore('coupon_tests');
    const index = store.index('by_code_retailer');
    
    const key = [couponCode, retailer];
    const request = index.getAll(key);
    
    const tests: any[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (tests.length === 0) {
      return {
        totalTests: 0,
        totalSuccesses: 0,
        successRate: 0,
        lastTested: null,
        lastWorked: null
      };
    }
    
    const successes = tests.filter((t: any) => t.worked);
    const lastTested = Math.max(...tests.map((t: any) => t.timestamp));
    const lastWorked = successes.length > 0
      ? Math.max(...successes.map((t: any) => t.timestamp))
      : null;
    
    return {
      totalTests: tests.length,
      totalSuccesses: successes.length,
      successRate: (successes.length / tests.length) * 100,
      lastTested,
      lastWorked
    };
  } catch (error) {
    console.error('Failed to get coupon stats:', error);
    return {
      totalTests: 0,
      totalSuccesses: 0,
      successRate: 0,
      lastTested: null,
      lastWorked: null
    };
  }
}

/**
 * Open coupon database
 */
async function openCouponDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HonestPriceTracker_Coupons', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create coupon_tests store
      if (!db.objectStoreNames.contains('coupon_tests')) {
        const store = db.createObjectStore('coupon_tests', {
          keyPath: 'id',
          autoIncrement: true
        });
        
        // Index by code + retailer for fast lookup
        store.createIndex('by_code_retailer', ['code', 'retailer']);
        store.createIndex('by_timestamp', 'timestamp');
      }
    };
  });
}

/**
 * Format coupon display
 */
export function formatCouponDisplay(coupon: Coupon): string {
  const successRateColor = 
    coupon.successRate >= 80 ? '#4CAF50' :
    coupon.successRate >= 50 ? '#ff9800' : '#f44336';
  
  const lastWorkedText = coupon.lastWorked
    ? `Last worked: ${formatTimeAgo(coupon.lastWorked)}`
    : 'Never verified';
  
  const expiresText = coupon.expiresAt
    ? `Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`
    : 'No expiration';
  
  return `
    <div style="
      padding: 12px;
      border: 1px solid #e1e8ed;
      border-radius: 6px;
      margin-bottom: 8px;
      background: white;
    ">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <div style="font-size: 16px; font-weight: 600; color: #2c3e50; font-family: monospace;">
            ${coupon.code}
          </div>
          <div style="font-size: 13px; color: #8899a6; margin-top: 4px;">
            ${coupon.description}
          </div>
        </div>
        <div style="
          padding: 4px 8px;
          background: ${successRateColor};
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        ">
          ${coupon.successRate.toFixed(0)}% success
        </div>
      </div>
      
      <div style="font-size: 12px; color: #8899a6;">
        <div>${lastWorkedText}</div>
        <div>${expiresText}</div>
        <div>Used ${coupon.timesUsed} times (${coupon.timesSucceeded} successful)</div>
      </div>
      
      ${coupon.verified ? `
        <div style="margin-top: 8px; padding: 6px; background: #e8f5e9; border-radius: 4px; font-size: 11px; color: #2e7d32;">
          ✅ Community verified
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Format time ago
 */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Get coupon disclaimer
 */
export function getCouponDisclaimer(): string {
  return `
    <div style="padding: 12px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; margin: 12px 0;">
      <div style="font-weight: 600; color: #e65100; margin-bottom: 6px; font-size: 13px;">
        ⚠️ Why Our Coupons Are Different
      </div>
      <div style="color: #e65100; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0 0 8px 0;">
          Unlike Honey, we show <strong>REAL success rates</strong> based on community testing:
        </p>
        <ul style="margin: 0; padding-left: 18px;">
          <li><strong>Last Worked Date</strong> - When someone actually used it successfully</li>
          <li><strong>Success Rate</strong> - Real percentage, not fake 100%</li>
          <li><strong>Community Verified</strong> - Multiple users confirmed it works</li>
        </ul>
        <p style="margin: 8px 0 0 0;">
          <strong>Honey's fake coupons:</strong> They show coupons that never work just to 
          track your behavior and hijack affiliate commissions. We only show coupons with 
          verified success rates.
        </p>
      </div>
    </div>
  `;
}

/**
 * Get "coming soon" message for MVP
 */
export function getCouponComingSoon(): string {
  return `
    <div style="text-align: center; padding: 40px 20px; color: #8899a6;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎫</div>
      <div style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
        Honest Coupons Coming Soon
      </div>
      <div style="font-size: 14px; line-height: 1.6; max-width: 400px; margin: 0 auto;">
        We're building a coupon database with <strong>real success rates</strong> 
        and <strong>verified last-used dates</strong>.
        <br><br>
        Unlike Honey's fake coupons, ours will show actual community-verified data.
      </div>
      <div style="margin-top: 24px; font-size: 13px; color: #4CAF50;">
        Expected in v0.2.0 (next month)
      </div>
    </div>
  `;
}
