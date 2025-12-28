// Saves options to chrome.storage
const saveOptions = () => {
  const timeout = document.getElementById('timeout').value;
  const keepAliveInterval = document.getElementById('keepAliveInterval').value;
  chrome.storage.sync.set(
    {
      timeout: parseInt(timeout, 10),
      keepAliveInterval: parseInt(keepAliveInterval, 10)
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 1500);
    }
  );
};

// Restores state using the preferences stored in chrome.storage
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      timeout: 1000,
      keepAliveInterval: 20
    }, // default values
    (items) => {
      document.getElementById('timeout').value = items.timeout;
      document.getElementById('keepAliveInterval').value = items.keepAliveInterval;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
