const UNINSTALL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeM6fiJdQw9JhT9KcC2AQ3QNE3pB3fRrsJ02_zDgF2ydC_WLg/viewform?usp=dialog';

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.setUninstallURL(UNINSTALL_URL);
});
