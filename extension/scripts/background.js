// background.js

// Set default protection state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ protectionEnabled: true });
});

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROTECTION_TOGGLE") {
    console.log("Protection toggled:", message.enabled);
    chrome.storage.sync.set({ protectionEnabled: message.enabled });
  }
});