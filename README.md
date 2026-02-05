# CookieBlocker

CookieBlocker is a browser extension built on Manifest V3 designed to automate privacy management and clean web pages by removing intrusive cookie consent notifications.

## Key Features

* **Selective Cookie Blocking**: The extension utilizes the `declarativeNetRequest` API to remove `Cookie` and `Set-Cookie` headers exclusively for third-party requests. This ensures users remain authenticated on primary websites while blocking tracking attempts from third-party advertising networks.
* **Consent Banner Removal**: A content script automatically identifies and removes DOM nodes containing cookie consent notices. It is optimized for complex structures found on major sites such as the BBC and NYTimes.
* **UI Restoration**: The extension forcibly restores page scrolling and removes visual filters, such as blurring or darkening overlays, that websites often apply when displaying modal consent windows.
* **State Management**: Users can instantly toggle the network filtering rules on or off through a simple popup interface.

## Technical Implementation

* **Manifest V3**: The project follows modern Chrome extension standards for improved security and performance.
* **Iframe Support**: By setting `all_frames: true`, the content script can process and remove banners embedded within iframes.
* **Dynamic Content Monitoring**: A `MutationObserver` is implemented to detect and eliminate banners that are dynamically injected into the page after the initial load.

## Installation

1. Clone this repository:
   `git clone https://github.com/Myrzei4/CookieBlocker.git`
2. Navigate to `chrome://extensions/` in your browser.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `CookiesBlock` project folder.

## Project Structure

* `manifest.json` — Extension configuration and permission declarations.
* `rules.json` — Static rules for network header modification.
* `content.js` — Logic for DOM manipulation and page style cleanup.
* `background.js` — Service worker for managing ruleset states.
* `popup.html` / `popup.js` — User interface and popup logic.
* `.gitignore` — Prevents IDE-specific files (e.g., `.vs` folder) from being tracked in the repository.

## License

This project is licensed under the MIT License. Feel free to use and modify it as needed.
