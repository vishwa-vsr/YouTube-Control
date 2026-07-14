// List of all configuration keys (excluding the master Clean Mode)
const configKeys = [
  'hideHomeFeed',
  'hideSubscriptions',
  'hideExplore',
  'hideMoreFromYoutube',
  'hideShorts',
  'hideRecommended',
  'hideComments',
  'hideButtonsStats',
  'hideHeader',
  'grayscaleMode',
  'blurThumbnails',
  'unblurOnHover',
  'showScreenshotBtn',
  'showMiniFullscreenBtn',
  'stickyPlayer',
  'dockCommentsSidebar',
  'hideAmbientMode',
  'blockAutoplay'
];

document.addEventListener('DOMContentLoaded', () => {
  // Track all checkboxes
  const checkboxes = {};
  configKeys.forEach(key => {
    checkboxes[key] = document.getElementById(key);
  });

  const blurThumbnailsCheckbox = document.getElementById('blurThumbnails');
  const unblurOnHoverCheckbox = document.getElementById('unblurOnHover');
  const subRowUnblur = document.getElementById('sub-row-unblur');

  const masterToggle = document.getElementById('masterToggle');
  const tabsNav = document.querySelector('.tabs-navigation');
  const optionsScroll = document.getElementById('options-scroll-area');
  const statusText = masterToggle ? masterToggle.querySelector('.status-text') : null;

  function updateSubOptionState() {
    if (blurThumbnailsCheckbox.checked) {
      subRowUnblur.classList.remove('disabled');
      unblurOnHoverCheckbox.disabled = false;
    } else {
      subRowUnblur.classList.add('disabled');
      unblurOnHoverCheckbox.disabled = true;
    }
  }

  if (blurThumbnailsCheckbox) {
    blurThumbnailsCheckbox.addEventListener('change', updateSubOptionState);
  }

  function updateMasterToggleUI(enabled) {
    if (!masterToggle) return;
    if (enabled) {
      masterToggle.classList.remove('inactive');
      if (statusText) statusText.textContent = 'active';
      if (tabsNav) tabsNav.classList.remove('disabled-mode');
      if (optionsScroll) optionsScroll.classList.remove('disabled-mode');
    } else {
      masterToggle.classList.add('inactive');
      if (statusText) statusText.textContent = 'inactive';
      if (tabsNav) tabsNav.classList.add('disabled-mode');
      if (optionsScroll) optionsScroll.classList.add('disabled-mode');
    }
  }

  // Load initial settings
  chrome.storage.local.get(['extensionEnabled', ...configKeys], (settings) => {
    const currentSettings = {};
    const extensionEnabled = settings.extensionEnabled !== false;
    
    updateMasterToggleUI(extensionEnabled);

    // Set default for unblurOnHover to true if it is undefined
    if (settings.unblurOnHover === undefined) {
      settings.unblurOnHover = true;
    }
    
    configKeys.forEach(key => {
      const val = settings[key] !== undefined ? settings[key] : false;
      currentSettings[key] = val;
      if (checkboxes[key]) {
        checkboxes[key].checked = val;
      }
    });

    updateSubOptionState();
  });

  // Helper to send settings to the active YouTube tab for instant updates
  function sendSettingsToActiveTab(settings) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSettings', settings }, () => {
          // Accessing lastError suppresses Chrome console warnings if the active tab is not YouTube
          const error = chrome.runtime.lastError;
        });
      }
    });
  }

  // Master Toggle click listener
  if (masterToggle) {
    masterToggle.addEventListener('click', () => {
      chrome.storage.local.get('extensionEnabled', (res) => {
        const currentlyEnabled = res.extensionEnabled !== false;
        const newEnabled = !currentlyEnabled;
        
        chrome.storage.local.set({ extensionEnabled: newEnabled }, () => {
          updateMasterToggleUI(newEnabled);
          
          // Send all settings including master state to the tab
          const updatedSettings = { extensionEnabled: newEnabled };
          Object.keys(checkboxes).forEach(k => {
            updatedSettings[k] = checkboxes[k].checked;
          });
          sendSettingsToActiveTab(updatedSettings);
        });
      });
    });
  }

  // Add event listeners to all checkboxes
  Object.keys(checkboxes).forEach(key => {
    checkboxes[key].addEventListener('change', (e) => {
      const checked = e.target.checked;
      const updateData = { [key]: checked };
      
      // Auto-enable Ambient Mode Blocker when Sticky Player is turned on
      if (key === 'stickyPlayer' && checked) {
        updateData.hideAmbientMode = true;
        if (checkboxes.hideAmbientMode) {
          checkboxes.hideAmbientMode.checked = true;
        }
      }
      
      // Save to storage
      chrome.storage.local.set(updateData, () => {
        // Send updated settings to the active YouTube tab (including master toggle state)
        chrome.storage.local.get('extensionEnabled', (res) => {
          const extensionEnabled = res.extensionEnabled !== false;
          const updatedSettings = { extensionEnabled };
          Object.keys(checkboxes).forEach(k => {
            updatedSettings[k] = checkboxes[k].checked;
          });
          sendSettingsToActiveTab(updatedSettings);
        });
      });
    });
  });

  // Tab switching logic
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      // Add active class to clicked button and corresponding pane
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
});
