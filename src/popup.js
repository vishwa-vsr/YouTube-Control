// List of all configuration keys (excluding the master Clean Mode)
const configKeys = [
  'hideHomeFeed',
  'customGridEnabled',
  'hideSubscriptions',
  'hideYou',
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
  'hideSidebarFooter'
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

  const customGridCheckbox = document.getElementById('customGridEnabled');
  const subRowGridCols = document.getElementById('sub-row-grid-cols');
  const gridPillBtns = document.querySelectorAll('.grid-pill-btn');
  let currentVideosPerRow = 4;

  const masterToggle = document.getElementById('masterToggle');
  const tabsNav = document.querySelector('.tabs-navigation');
  const optionsScroll = document.getElementById('options-scroll-area');

  function updateSubOptionState() {
    if (blurThumbnailsCheckbox && subRowUnblur) {
      if (blurThumbnailsCheckbox.checked) {
        subRowUnblur.classList.remove('disabled');
        if (unblurOnHoverCheckbox) unblurOnHoverCheckbox.disabled = false;
      } else {
        subRowUnblur.classList.add('disabled');
        if (unblurOnHoverCheckbox) unblurOnHoverCheckbox.disabled = true;
      }
    }

    if (customGridCheckbox && subRowGridCols) {
      if (customGridCheckbox.checked) {
        subRowGridCols.classList.remove('disabled');
      } else {
        subRowGridCols.classList.add('disabled');
      }
    }
  }

  if (blurThumbnailsCheckbox) {
    blurThumbnailsCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (customGridCheckbox) {
    customGridCheckbox.addEventListener('change', updateSubOptionState);
  }

  function updateMasterToggleUI(enabled) {
    if (!masterToggle) return;
    masterToggle.checked = enabled;
    if (enabled) {
      if (tabsNav) tabsNav.classList.remove('disabled-mode');
      if (optionsScroll) optionsScroll.classList.remove('disabled-mode');
    } else {
      if (tabsNav) tabsNav.classList.add('disabled-mode');
      if (optionsScroll) optionsScroll.classList.add('disabled-mode');
    }
  }

  function sendCurrentSettingsToActiveTab() {
    chrome.storage.local.get(['extensionEnabled', 'videosPerRow', ...configKeys], (res) => {
      const extensionEnabled = res.extensionEnabled !== false;
      const updatedSettings = { 
        extensionEnabled, 
        videosPerRow: res.videosPerRow || currentVideosPerRow 
      };
      Object.keys(checkboxes).forEach(k => {
        if (checkboxes[k]) {
          updatedSettings[k] = checkboxes[k].checked;
        }
      });
      sendSettingsToActiveTab(updatedSettings);
    });
  }

  // Handle pill selector button clicks
  gridPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cols = parseInt(btn.getAttribute('data-cols'), 10) || 4;
      currentVideosPerRow = cols;

      gridPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      chrome.storage.local.set({ videosPerRow: cols }, () => {
        sendCurrentSettingsToActiveTab();
      });
    });
  });

  // Load initial settings
  chrome.storage.local.get(['extensionEnabled', 'videosPerRow', ...configKeys], (settings) => {
    const currentSettings = {};
    const extensionEnabled = settings.extensionEnabled !== false;
    
    updateMasterToggleUI(extensionEnabled);

    currentVideosPerRow = settings.videosPerRow || 4;
    gridPillBtns.forEach(btn => {
      const cols = parseInt(btn.getAttribute('data-cols'), 10);
      if (cols === currentVideosPerRow) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Set default for certain keys to true if they are undefined
    const defaultTrueKeys = [
      'unblurOnHover',
      'dockCommentsSidebar',
      'stickyPlayer',
      'showMiniFullscreenBtn',
      'hideShorts',
      'hideAmbientMode'
    ];
    defaultTrueKeys.forEach(key => {
      if (settings[key] === undefined) {
        settings[key] = true;
      }
    });
    
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
          const error = chrome.runtime.lastError;
        });
      }
    });
  }

  // Master Toggle change listener
  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const newEnabled = masterToggle.checked;
      chrome.storage.local.set({ extensionEnabled: newEnabled }, () => {
        updateMasterToggleUI(newEnabled);
        sendCurrentSettingsToActiveTab();
      });
    });
  }

  // Add event listeners to all checkboxes
  Object.keys(checkboxes).forEach(key => {
    if (checkboxes[key]) {
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
          sendCurrentSettingsToActiveTab();
        });
      });
    }
  });

  // Tab switching logic
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
});
