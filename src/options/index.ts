/**
 * Options/Settings Page
 */

import { exportAllData, importData, clearAllData, getSetting, saveSetting } from '../storage/db';

// DOM Elements
let notificationsCheckbox: HTMLInputElement;
let checkIntervalSelect: HTMLSelectElement;
let exportBtn: HTMLButtonElement;
let importBtn: HTMLButtonElement;
let importFileInput: HTMLInputElement;
let clearDataBtn: HTMLButtonElement;

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  notificationsCheckbox = document.getElementById('notificationsEnabled') as HTMLInputElement;
  checkIntervalSelect = document.getElementById('checkInterval') as HTMLSelectElement;
  exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
  importBtn = document.getElementById('importBtn') as HTMLButtonElement;
  importFileInput = document.getElementById('importFile') as HTMLInputElement;
  clearDataBtn = document.getElementById('clearDataBtn') as HTMLButtonElement;

  // Load settings
  await loadSettings();

  // Event listeners
  notificationsCheckbox.addEventListener('change', handleNotificationsChange);
  checkIntervalSelect.addEventListener('change', handleIntervalChange);
  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleImport);
  clearDataBtn.addEventListener('click', handleClearData);

  // Stats
  await updateStats();
});

/**
 * Load settings from storage
 */
async function loadSettings(): Promise<void> {
  try {
    const notificationsEnabled = await getSetting('notificationsEnabled', true);
    const checkInterval = await getSetting('checkInterval', 360); // 6 hours default

    notificationsCheckbox.checked = notificationsEnabled;
    checkIntervalSelect.value = checkInterval.toString();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Handle notifications toggle
 */
async function handleNotificationsChange(): Promise<void> {
  try {
    await saveSetting('notificationsEnabled', notificationsCheckbox.checked);
    showToast(notificationsCheckbox.checked ? '🔔 Notifications enabled' : '🔕 Notifications disabled');
  } catch (error) {
    console.error('Error saving notifications setting:', error);
    showToast('❌ Failed to save setting', 'error');
  }
}

/**
 * Handle check interval change
 */
async function handleIntervalChange(): Promise<void> {
  try {
    const interval = parseInt(checkIntervalSelect.value);
    await saveSetting('checkInterval', interval);

    // Update background monitoring interval
    await chrome.runtime.sendMessage({
      type: 'UPDATE_CHECK_INTERVAL',
      interval
    });

    const hours = interval / 60;
    showToast(`✅ Check interval updated to ${hours} hour${hours !== 1 ? 's' : ''}`);
  } catch (error) {
    console.error('Error saving interval setting:', error);
    showToast('❌ Failed to save setting', 'error');
  }
}

/**
 * Handle data export
 */
async function handleExport(): Promise<void> {
  try {
    exportBtn.disabled = true;
    exportBtn.textContent = '⏳ Exporting...';

    const data = await exportAllData();

    // Create JSON file
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `honest-price-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);

    showToast('✅ Data exported successfully');
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('❌ Export failed', 'error');
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = '📥 Export Data';
  }
}

/**
 * Handle data import
 */
async function handleImport(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!confirm(`Import ${data.products?.length || 0} products and ${data.priceHistory?.length || 0} price points?\n\nThis will ADD to your existing data (not replace).`)) {
      return;
    }

    await importData(data);

    showToast('✅ Data imported successfully');
    setTimeout(() => location.reload(), 1000);
  } catch (error) {
    console.error('Error importing data:', error);
    showToast('❌ Import failed - invalid file format', 'error');
  } finally {
    input.value = ''; // Reset input
  }
}

/**
 * Handle clear all data
 */
async function handleClearData(): Promise<void> {
  if (!confirm('⚠️ Delete ALL tracked products and price history?\n\nThis action cannot be undone!')) {
    return;
  }

  if (!confirm('Are you SURE? This will delete everything.')) {
    return;
  }

  try {
    clearDataBtn.disabled = true;
    clearDataBtn.textContent = '⏳ Clearing...';

    await clearAllData();

    showToast('✅ All data cleared');
    setTimeout(() => location.reload(), 1000);
  } catch (error) {
    console.error('Error clearing data:', error);
    showToast('❌ Failed to clear data', 'error');
  } finally {
    clearDataBtn.disabled = false;
    clearDataBtn.textContent = '🗑️ Clear All Data';
  }
}

/**
 * Update statistics
 */
async function updateStats(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_MONITORING_STATS'
    });

    if (response.success && response.stats) {
      const stats = response.stats;
      document.getElementById('statProducts')!.textContent = stats.totalProducts.toString();
      document.getElementById('statAlerts')!.textContent = stats.activeAlerts.toString();
      
      if (stats.lastCheck) {
        document.getElementById('statLastCheck')!.textContent = new Date(stats.lastCheck).toLocaleString();
      }
      
      if (stats.nextCheck) {
        document.getElementById('statNextCheck')!.textContent = new Date(stats.nextCheck).toLocaleString();
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Show toast notification
 */
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
