// List of selectors for cookie consent banners and overlays
const selectors = [
    '#fides-banner',
    '.fides-overlay', // NYtimes cookie banner
    '#notice.message.type-modal',
    '.sp_btm_fixed_panel',
    '[class*="sp_choice_type"]',
    '[id*="notice"]',
    '#sp_message_container',
    '.message-safe-area-holder',
    'iframe[title^="SP Consent Message"]',
    '#sp_message_container_1355822',
    '#ngasCookiePrompt',
    '.message-container', // BBC cookie banner  
    ".cookie-modal", ".cookie-consent",
    '[class*="cookie-banner"]', '[id*="cookie-banner"]',
    '[class*="cookie-notice"]', '[id*="cookie-notice"]',
    '[class*="consent-wall"]', '[id*="consent-wall"]',
    '.tp-backdrop', '.tp-modal', // OneTrust
    '#onetrust-consent-sdk', '.onetrust-banner-sdk', // OneTrust
    '.qc-cmp2-container', // Quantcast
    '#usercentrics-root', '.usercentrics-overlay', // Usercentrics
    '#CybotCookiebotDialog','.CybotCookiebotDialog',
    "#AcceptCookies", "#CookieConsent", ".cookie-consent-banner", // Generic
];

// Additional selectors can be added as needed
const classesToRemove = ['sp-message-open', 'fides-open', 'modal-open', 'no-scroll'];

// Function to remove elements and reset styles
function cleanPage() {
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.remove();
        });
    });

    const html = document.documentElement;
    const body = document.body;

    // Reset styles on html and body
    [html, body].forEach(el => {
        if (!el) return;
        el.style.setProperty('overflow', 'auto', 'important');
        el.style.setProperty('position', 'static', 'important');
        el.style.setProperty('filter', 'none', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
    });

    // Remove specific classes from html and body
    classesToRemove.forEach(className => {
        if (body) body.classList.remove(className);
        if (html) html.classList.remove(className);
    });
}

// Function to get the clean domain of the current page
function getCleanDomain(url) {
    try {
        if (url) {
            return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
        }
        const topHost = window.top.location.hostname;
        return topHost.toLowerCase().replace(/^www\./, '');
    } catch (e) {
        return window.location.hostname.toLowerCase().replace(/^www\./, '');
    }
}

let isInitialized = false;
// Initialize content script
function init() {
    if (isInitialized) return;

    chrome.runtime.sendMessage({ action: "getContentSettings" }, (response) => {
        if (chrome.runtime.lastError || !response) {
            console.error("Cookie Blocker: Failed to get settings - " + (chrome.runtime.lastError ? chrome.runtime.lastError.message : "No response"))
            return;
        }

        const { isEnabled, whitelist, topUrl } = response;
        const currentDomain = getCleanDomain(topUrl);

        // Check if the current domain is whitelisted (exact match or subdomain)
        const isWhitelisted = whitelist.some(d => {
            const cleanD = d.replace(/^www\./, '');
            return currentDomain === cleanD || currentDomain.endsWith('.' + cleanD);
        });

        if (!isEnabled || isWhitelisted) {
            console.log("Cookie Blocker: Passive (Whitelisted or Disabled) on " + currentDomain);
            isInitialized = true;
            return;
        }

        console.log(`Cookie Blocker: Active on ${currentDomain}`);
        isInitialized = true;

        cleanPage();
        setupObserver();
    });
}
function setupObserver() {
        let timeout = null;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(cleanPage, 300);
    });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
}


init();