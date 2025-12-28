let keepAliveTimer;

function startKeepAlive(intervalSeconds) {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }

  const intervalMs = intervalSeconds * 1000;
  keepAliveTimer = setInterval(() => {
    chrome.runtime.sendMessage({ keepAlive: true });
  }, intervalMs);
}

// Initial fetch and start
chrome.storage.sync.get({ keepAliveInterval: 20 }, (items) => {
  startKeepAlive(items.keepAliveInterval);
});

// Listen for changes to update the interval dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.keepAliveInterval) {
    startKeepAlive(changes.keepAliveInterval.newValue);
  }
});
