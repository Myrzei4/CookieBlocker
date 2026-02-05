const toggle = document.getElementById("status-toggle");
const input = document.getElementById("domain-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("whitelist-items");


function cleanDomain(url) {
  // Remove protocol and www prefix
  return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
}

// Load initial state
chrome.storage.local.get(["isEnabled", "whitelist"], (res) => {
  toggle.checked = res.isEnabled || false;
  renderWhitelist(res.whitelist || []);
});

// Toggle enabled/disabled state
toggle.addEventListener("change", () => {
  const action = toggle.checked ? "enableBlocking" : "disableBlocking";
  chrome.runtime.sendMessage({ action });
});

// Add domain to whitelist
addBtn.addEventListener("click", () => {
  const rawInput = input.value.trim();
  const domain = cleanDomain(rawInput);
  
  if (domain) {
    chrome.storage.local.get(["whitelist"], (res) => {
      const whitelist = res.whitelist || [];
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        chrome.storage.local.set({ whitelist }, () => {
          renderWhitelist(whitelist);
          input.value = "";
          chrome.runtime.sendMessage({ action: "updateRules" }); 
        });
      }
    });
  }
});

// Render whitelist items
function renderWhitelist(items) {
  list.innerHTML = "";
  items.forEach(domain => {
    const li = document.createElement("li");
    li.className = "whitelist-item";
    li.innerHTML = `<span>${domain}</span><span class="remove-btn" data-domain="${domain}">✕</span>`;
    list.appendChild(li);
  });
}

// Remove domain from whitelist
list.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const domain = e.target.getAttribute("data-domain");
    chrome.storage.local.get(["whitelist"], (res) => {
      const whitelist = (res.whitelist || []).filter(d => d !== domain);
      chrome.storage.local.set({ whitelist }, () => {
        renderWhitelist(whitelist);
        chrome.runtime.sendMessage({ action: "updateRules" }); 
      });
    });
  }
});