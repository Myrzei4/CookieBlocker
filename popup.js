// popup.js - Handles the popup UI interactions for the CookiesBlock extension
// Navigation elements
const viewMain = document.getElementById("view-main");
const viewWhitelist = document.getElementById("view-whitelist");
const navToWhitelist = document.getElementById("nav-to-whitelist");
const navToMain = document.getElementById("nav-to-main");

// Main view elements
const toggle = document.getElementById("status-toggle");
const dynamicBtn = document.getElementById("dynamic-domain-btn");

// Whitelist view elements
const input = document.getElementById("domain-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("whitelist-items");

// Global state
let currentDomain = "";
let appWhitelist = [];

// Remove protocol and www prefix
function cleanDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
  }
}


async function init() {
  // Get current tab URL
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith("chrome://") && !tabs[0].url.startsWith("edge://")) {
    currentDomain = cleanDomain(tabs[0].url);
  } else {
    dynamicBtn.disabled = true;
    dynamicBtn.innerText = "Unavailable on this page";
    dynamicBtn.classList.add("btn-secondary");
  }

  chrome.storage.local.get(["isEnabled", "whitelist"], (res) => {
    toggle.checked = res.isEnabled || false;
    appWhitelist = res.whitelist || [];
    updateUI();
  });
}

function updateUI() {

  if (currentDomain) {
    if (appWhitelist.includes(currentDomain)) {
      dynamicBtn.innerText = `Remove "${currentDomain}" from Whitelist`;
      dynamicBtn.classList.remove("btn-secondary");
      dynamicBtn.classList.add("btn-danger");
    } else {
      dynamicBtn.innerText = `Add "${currentDomain}" to Whitelist`;
      dynamicBtn.classList.remove("btn-danger", "btn-secondary");
    }
  }

  renderWhitelist();
}

navToWhitelist.addEventListener("click", () => {
  viewMain.classList.remove("active");
  viewWhitelist.classList.add("active");
});

navToMain.addEventListener("click", () => {
  viewWhitelist.classList.remove("active");
  viewMain.classList.add("active");
});

function saveAndRefresh() {
  chrome.storage.local.set({ whitelist: appWhitelist }, () => {
    updateUI();
    chrome.runtime.sendMessage({ action: "updateRules" });
  });
}

dynamicBtn.addEventListener("click", () => {
  if (!currentDomain) return;

  if (appWhitelist.includes(currentDomain)) {
    appWhitelist = appWhitelist.filter(d => d !== currentDomain);
  } else {
    appWhitelist.push(currentDomain);
  }
  saveAndRefresh();
});

toggle.addEventListener("change", () => {
  const action = toggle.checked ? "enableBlocking" : "disableBlocking";
  chrome.storage.local.set({ isEnabled: toggle.checked }, () => {
    chrome.runtime.sendMessage({ action: action });
  });
});

addBtn.addEventListener("click", () => {
  const rawInput = input.value.trim();
  const domain = cleanDomain(rawInput);
  if (domain && !appWhitelist.includes(domain)) {
    appWhitelist.push(domain);
    input.value = "";
    saveAndRefresh();
  }
});

function renderWhitelist() {
  list.innerHTML = "";

  const sortedWhiteList = [...appWhitelist].sort((a, b) => {
    if (a === currentDomain) return -1;
    if (b === currentDomain) return 1;
    return a.localeCompare(b);
  });
  sortedWhiteList.forEach(domain => {
    const li = document.createElement("li");
    li.className = "whitelist-item";

    const isCurrent = domain === currentDomain;
    const tagHtml = isCurrent ? `<span class="current-tag">Current</span>` : "";

    li.innerHTML = `
      <span>${domain} ${tagHtml}</span>
      <span class="remove-btn" data-domain="${domain}" title="Remove">✕</span>
      `;

    list.appendChild(li);
  });
}

list.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const domainToRemove = e.target.getAttribute("data-domain");
    appWhitelist = appWhitelist.filter(d => d !== domainToRemove);
    saveAndRefresh();
  }
});

init();