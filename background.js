console.log("✅ Service worker running");

function updateIcons(isEnabled) {
  const iconPath = isEnabled 
  ? {
      "16": "icons/icon-on-16.png",
      "48": "icons/icon-on-48.png",
      "128": "icons/icon-on-128.png",
  }
  : {
      "16": "icons/icon-off-16.png",
      "48": "icons/icon-off-48.png",
      "128": "icons/icon-off-128.png",
  };
  chrome.action.setIcon({ path: iconPath });
}

function getCleanDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

// Function to refresh declarative net request rules based on stored settings
async function refreshRules() {
  const data = await chrome.storage.local.get(["isEnabled", "whitelist"]);
  const isEnabled = data.isEnabled || false;
  const whitelist = data.whitelist || [];

  updateIcons(isEnabled);

  // First, remove existing rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] 
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
          urlFilter: `*${keyword}*`,
          resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
        }
      });
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
  }
}

// Контекстное меню при правом клике
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-whitelist",
    title: "Toggle Whitelist for this Site",
    contexts: ["all"]
  });
  refreshRules();
});
  
chrome.runtime.onStartup.addListener(refreshRules);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "toggle-whitelist" && tab && tab.url) {
    const domain = getCleanDomain(tab.url);
    if (!domain) return;

    const data = await chrome.storage.local.get(["whitelist"]);
    let whitelist = data.whitelist || [];

    if (whitelist.includes(domain)) {
      whitelist = whitelist.filter(d => d !== domain);
    } else {
      whitelist.push(domain);
    }

    await chrome.storage.local.set({ whitelist });
    refreshRules();

    chrome.tabs.reload(tab.id);
  }
});

// Слушатель всех сообщений (от content.js и popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // 1. Сообщение для обновления счетчика на иконке
  if (message.action === "updateBadge" && sender.tab) {
    chrome.action.setBadgeText({
      text: message.count.toString(),
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#f28b82",
      tabId: sender.tab.id
    });
    return true;
  }

  // 2. Сообщение для получения настроек контент-скриптом
  if (message.action === "getContentSettings") {
    chrome.storage.local.get(["isEnabled", "whitelist"], (data) => {
      const topUrl = sender.tab ? sender.tab.url : null;
      
      sendResponse({
        isEnabled: data.isEnabled || false,
        whitelist: data.whitelist || [],
        topUrl: topUrl
      });
    });
    return true; 
  }

  // 3. Сообщения от кнопок в попапе
  if (message.action === "enableBlocking") {
    chrome.storage.local.set({ isEnabled: true }, refreshRules);
  } else if (message.action === "disableBlocking") {
    chrome.storage.local.set({ isEnabled: false }, refreshRules);
  } else if (message.action === "updateRules") {
    refreshRules();
  }
  return true;
});