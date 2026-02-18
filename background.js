console.log("✅ Service worker running");

const RULE_ID = 1; // Unique ID for the dynamic rule

// Function to refresh declarative net request rules based on stored settings
async function refreshRules() {
  const data = await chrome.storage.local.get(["isEnabled", "whitelist"]);
  const isEnabled = data.isEnabled || false;
  const whitelist = data.whitelist || [];

  // First, remove existing rule
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] // Remove any existing rules with these IDs,
  });

  // If enabled, add the rule back with updated conditions
  if (isEnabled) {
    const rules = [];
    // Block all third-party cookies by default
    rules.push({
      id: 1,
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
    });

    const authKeywords = ["auth", "login", "account", "accounts", "aauth", "sso", "oauth", "signin", "session", "token", "secure"];

    authKeywords.forEach((keyword, index) => {
      rules.push({
        id: 2 + index,
        priority: 2,
        action: { type: "allow" },
        condition: {
          urlFilter: `*${keyword}`,
          resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
        }
      });
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
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