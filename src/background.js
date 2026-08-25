const UNINSTALL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeM6fiJdQw9JhT9KcC2AQ3QNE3pB3fRrsJ02_zDgF2ydC_WLg/viewform?usp=dialog';

chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL(UNINSTALL_URL);

  // Record install date for the review prompt (only on fresh install)
  if (details.reason === 'install') {
    chrome.storage.local.set({ installDate: Date.now() });
  }
});
