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
    '[class*="cookie-banner"]','[id*="cookie-banner"]', 
    '[class*="cookie-notice"]', '[id*="cookie-notice"]', 
    '[class*="consent-wall"]', '[id*="consent-wall"]',
    '.tp-backdrop', '.tp-modal', // OneTrust
    '#onetrust-consent-sdk', '.onetrust-banner-sdk', // OneTrust
    '.qc-cmp2-container', // Quantcast
    '#usercentrics-root', '.usercentrics-overlay', // Usercentrics
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

// Initial cleanup on page load
cleanPage();
window.addEventListener('load', cleanPage);
setTimeout(cleanPage, 3000);

// Observe DOM changes to handle dynamically loaded content
const observer = new MutationObserver(() => {
    cleanPage();
});
observer.observe(document.documentElement, { childList: true, subtree: true });