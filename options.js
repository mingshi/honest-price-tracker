// Honest Price Tracker - Options/Settings Script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  calculateStorageUsage();
  setupEventListeners();
});

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get({
    checkInterval: 60,
    notifyPriceDrop: true,
    notifyTargetPrice: true
  });
  
  document.getElementById('check-interval').value = settings.checkInterval;
  document.getElementById('notify-price-drop').checked = settings.notifyPriceDrop;
  document.getElementById('notify-target-price').checked = settings.notifyTargetPrice;
}

// Save settings
async function saveSettings() {
  const settings = {
    checkInterval: parseInt(document.getElementById('check-interval').value),
    notifyPriceDrop: document.getElementById('notify-price-drop').checked,
    notifyTargetPrice: document.getElementById('notify-target-price').checked
  };
  
  await chrome.storage.sync.set(settings);
  
  // Update alarm with new interval
  chrome.alarms.clear('priceCheck');
  chrome.alarms.create('priceCheck', {
    periodInMinutes: settings.checkInterval
  });
  
  alert('Settings saved!');
}

// Calculate storage usage
async function calculateStorageUsage() {
  const data = await chrome.storage.local.get(null);
  const size = JSON.stringify(data).length;
  const kb = (size / 1024).toFixed(2);
  
  document.getElementById('storage-used').textContent = `${kb} KB`;
}

// Clear all data
async function clearAllData() {
  if (!confirm('Are you sure you want to clear all data? This will remove all tracked products and price history. This action cannot be undone.')) {
    return;
  }
  
  await chrome.storage.local.clear();
  alert('All data cleared!');
  calculateStorageUsage();
}

// Set up event listeners
function setupEventListeners() {
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('clear-data').addEventListener('click', clearAllData);
}
