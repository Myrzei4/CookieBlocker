console.log("✅ Service worker running");

const RULE_ID = 1; // Unique ID for the dynamic rule

// Function to refresh declarative net request rules based on stored settings
async function refreshRules() {
  const data = await chrome.storage.local.get(["isEnabled", "whitelist"]);
  const isEnabled = data.isEnabled || false;
  const whitelist = data.whitelist || [];

  // First, remove existing rule
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
  });

  // If enabled, add the rule back with updated conditions
  if (isEnabled) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        id: RULE_ID,
        priority: 1,
        action: { 
          type: "modifyHeaders",
          requestHeaders: [{header: "cookie", operation: "remove"}],
          responseHeaders: [{header: "set-cookie", operation: "remove"}]
        },
        condition: {
          urlFilter: "|",
          domainType: "thirdParty",
          excludedInitiatorDomains: whitelist,
          resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
      }
    }]
  });
  }
}

// Listen for messages from popup.js to update rules or get current settings
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle requests for current settings
  if (message.action === "getContentSettings") {
    chrome.storage.local.get(["isEnabled", "whitelist"], (data) => {
      const topUrl = sender.tab ? sender.tab.url : null;
      
      sendResponse({
        isEnabled: data.isEnabled || false,
        whitelist: data.whitelist || [],
        topUrl: topUrl
      });
    });
    return true; // Indicates that we will send a response asynchronously
  }
  // Handle enable/disable and rule updates
  if (message.action === "enableBlocking") {
    chrome.storage.local.set({ isEnabled: true }, refreshRules);
  } else if (message.action === "disableBlocking") {
    chrome.storage.local.set({ isEnabled: false }, refreshRules);
  } else if (message.action === "updateRules") {
    refreshRules();
  }
  return true;
});

// Initialize rules on startup
chrome.runtime.onInstalled.addListener(refreshRules);
chrome.runtime.onStartup.addListener(refreshRules);