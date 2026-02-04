const statusElement = document.getElementById("status");

// Initialize the status on popup load
chrome.storage.local.get(["isEnabled"], (result) => {
  if (result.isEnabled) {
    statusElement.textContent = "Status: Blocking on";
  } else {
    statusElement.textContent = "Status: Blocking off";
  }
});

document.getElementById("enable").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "enableBlocking" }, (response) => {
    if (response && response.success) {
      document.getElementById("status").textContent = "Blocking on";
    }
  });
});

document.getElementById("disable").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "disableBlocking" }, () => {
    document.getElementById("status").textContent = "Blocking off";
  });
});
