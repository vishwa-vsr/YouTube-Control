const UNINSTALL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeM6fiJdQw9JhT9KcC2AQ3QNE3pB3fRrsJ02_zDgF2ydC_WLg/viewform?usp=publish-editor';

// Set the uninstall survey URL when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.setUninstallURL(UNINSTALL_URL);
});

// Also set it immediately when the background worker loads
chrome.runtime.setUninstallURL(UNINSTALL_URL);
