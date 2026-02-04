console.log("✅ Service worker running");

// Listen for messages from popup.js to enable or disable the blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "enableBlocking") {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["blockSetCookie"]
    }, () => {
      chrome.storage.local.set({ isEnabled: true });
      sendResponse({ success: true })
    });
    return true;
  }

  if (message.action === "disableBlocking") {
    chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["blockSetCookie"]
    }, () => {
      chrome.storage.local.set({ isEnabled: false }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});
