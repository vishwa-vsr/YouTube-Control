// List of all configuration keys (excluding the master Clean Mode)
const configKeys = [
  'hideHomeFeed',
  'hideCategoryBar',
  'hideCategoryBarFeeds',
  'hideCategoryBarChannels',
  'hideCategoryBarWatch',
  'customGridEnabled',
  'hideMixPlaylists',
  'hideMixPlaylistsFeeds',
  'hideMixPlaylistsWatch',
  'hideSubscriptions',
  'hideYou',
  'hideExplore',
  'hideMoreFromYoutube',
  'hideShorts',
  'hideShortsSidebar',
  'hideShortsFeeds',
  'hideShortsChannel',
  'hideShortsWatch',
  'hideRecommended',
  'hideComments',
  'hideButtonsStats',
  'hideHeader',
  'grayscaleMode',
  'blurThumbnails',
  'unblurOnHover',
  'showSpeedBtn',
  'showScreenshotBtn',
  'showMiniFullscreenBtn',
  'miniFullscreenFill',
  'stickyPlayer',
  'dockCommentsSidebar',
  'showRefreshCommentsBtn',
  'showCommentScreenshotBtn',
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

  const hideMixCheckbox = document.getElementById('hideMixPlaylists');
  const subMixRows = [
    { row: document.getElementById('sub-row-mix-feeds'), input: document.getElementById('hideMixPlaylistsFeeds') },
    { row: document.getElementById('sub-row-mix-watch'), input: document.getElementById('hideMixPlaylistsWatch') }
  ];

  const hideShortsCheckbox = document.getElementById('hideShorts');
  const subShortsRows = [
    { row: document.getElementById('sub-row-shorts-sidebar'), input: document.getElementById('hideShortsSidebar') },
    { row: document.getElementById('sub-row-shorts-feeds'), input: document.getElementById('hideShortsFeeds') },
    { row: document.getElementById('sub-row-shorts-channel'), input: document.getElementById('hideShortsChannel') },
    { row: document.getElementById('sub-row-shorts-watch'), input: document.getElementById('hideShortsWatch') }
  ];

  const hideCategoryBarCheckbox = document.getElementById('hideCategoryBar');
  const subCategoryRows = [
    { row: document.getElementById('sub-row-category-feeds'), input: document.getElementById('hideCategoryBarFeeds') },
    { row: document.getElementById('sub-row-category-channels'), input: document.getElementById('hideCategoryBarChannels') },
    { row: document.getElementById('sub-row-category-watch'), input: document.getElementById('hideCategoryBarWatch') }
  ];

  const miniFullscreenCheckbox = document.getElementById('showMiniFullscreenBtn');
  const miniFullscreenFillCheckbox = document.getElementById('miniFullscreenFill');
  const subRowMiniFullscreenFill = document.getElementById('sub-row-mini-fullscreen-fill');

  const speedBtnCheckbox = document.getElementById('showSpeedBtn');
  const subRowSpeedInputs = document.getElementById('sub-row-speed-inputs');
  const speedInputA = document.getElementById('speedValueA');
  const speedInputB = document.getElementById('speedValueB');
  const speedInputC = document.getElementById('speedValueC');

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

    if (hideMixCheckbox) {
      subMixRows.forEach(item => {
        if (item.row) {
          if (hideMixCheckbox.checked) {
            item.row.classList.remove('disabled');
            if (item.input) item.input.disabled = false;
          } else {
            item.row.classList.add('disabled');
            if (item.input) item.input.disabled = true;
          }
        }
      });
    }

    if (hideShortsCheckbox) {
      subShortsRows.forEach(item => {
        if (item.row) {
          if (hideShortsCheckbox.checked) {
            item.row.classList.remove('disabled');
            if (item.input) item.input.disabled = false;
          } else {
            item.row.classList.add('disabled');
            if (item.input) item.input.disabled = true;
          }
        }
      });
    }

    if (hideCategoryBarCheckbox) {
      subCategoryRows.forEach(item => {
        if (item.row) {
          if (hideCategoryBarCheckbox.checked) {
            item.row.classList.remove('disabled');
            if (item.input) item.input.disabled = false;
          } else {
            item.row.classList.add('disabled');
            if (item.input) item.input.disabled = true;
          }
        }
      });
    }

    if (miniFullscreenCheckbox && subRowMiniFullscreenFill) {
      if (miniFullscreenCheckbox.checked) {
        subRowMiniFullscreenFill.classList.remove('disabled');
        if (miniFullscreenFillCheckbox) miniFullscreenFillCheckbox.disabled = false;
      } else {
        subRowMiniFullscreenFill.classList.add('disabled');
        if (miniFullscreenFillCheckbox) miniFullscreenFillCheckbox.disabled = true;
      }
    }

    if (speedBtnCheckbox && subRowSpeedInputs) {
      if (speedBtnCheckbox.checked) {
        subRowSpeedInputs.classList.remove('disabled');
        if (speedInputA) speedInputA.disabled = false;
        if (speedInputB) speedInputB.disabled = false;
        if (speedInputC) speedInputC.disabled = false;
      } else {
        subRowSpeedInputs.classList.add('disabled');
        if (speedInputA) speedInputA.disabled = true;
        if (speedInputB) speedInputB.disabled = true;
        if (speedInputC) speedInputC.disabled = true;
      }
    }
  }

  if (blurThumbnailsCheckbox) {
    blurThumbnailsCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (customGridCheckbox) {
    customGridCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (hideMixCheckbox) {
    hideMixCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (hideShortsCheckbox) {
    hideShortsCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (hideCategoryBarCheckbox) {
    hideCategoryBarCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (miniFullscreenCheckbox) {
    miniFullscreenCheckbox.addEventListener('change', updateSubOptionState);
  }

  if (speedBtnCheckbox) {
    speedBtnCheckbox.addEventListener('change', updateSubOptionState);
  }

  function handleSpeedInputChange(input, key, fallback) {
    if (!input) return;
    let val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) {
      val = fallback;
    } else if (val > 16) {
      val = 16;
    }
    val = Math.round(val * 100) / 100;
    input.value = val;
    chrome.storage.local.set({ [key]: val }, () => {
      sendCurrentSettingsToActiveTab();
    });
  }

  if (speedInputA) {
    speedInputA.addEventListener('change', () => handleSpeedInputChange(speedInputA, 'speedValueA', 1.0));
    speedInputA.addEventListener('blur', () => handleSpeedInputChange(speedInputA, 'speedValueA', 1.0));
  }
  if (speedInputB) {
    speedInputB.addEventListener('change', () => handleSpeedInputChange(speedInputB, 'speedValueB', 1.5));
    speedInputB.addEventListener('blur', () => handleSpeedInputChange(speedInputB, 'speedValueB', 1.5));
  }
  if (speedInputC) {
    speedInputC.addEventListener('change', () => handleSpeedInputChange(speedInputC, 'speedValueC', 2.0));
    speedInputC.addEventListener('blur', () => handleSpeedInputChange(speedInputC, 'speedValueC', 2.0));
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
    chrome.storage.local.get(['extensionEnabled', 'videosPerRow', 'speedValueA', 'speedValueB', 'speedValueC', ...configKeys], (res) => {
      const extensionEnabled = res.extensionEnabled !== false;
      const updatedSettings = { 
        extensionEnabled, 
        videosPerRow: res.videosPerRow || currentVideosPerRow,
        speedValueA: res.speedValueA !== undefined ? res.speedValueA : 1.0,
        speedValueB: res.speedValueB !== undefined ? res.speedValueB : 1.5,
        speedValueC: res.speedValueC !== undefined ? res.speedValueC : 2.0
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
  chrome.storage.local.get(['extensionEnabled', 'videosPerRow', 'speedValueA', 'speedValueB', 'speedValueC', ...configKeys], (settings) => {
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

    if (speedInputA) speedInputA.value = settings.speedValueA !== undefined ? settings.speedValueA : 1.0;
    if (speedInputB) speedInputB.value = settings.speedValueB !== undefined ? settings.speedValueB : 1.5;
    if (speedInputC) speedInputC.value = settings.speedValueC !== undefined ? settings.speedValueC : 2.0;

    // Set default for certain keys to true if they are undefined
    const defaultTrueKeys = [
      'unblurOnHover',
      'dockCommentsSidebar',
      'showRefreshCommentsBtn',
      'showCommentScreenshotBtn',
      'stickyPlayer',
      'showMiniFullscreenBtn',
      'hideCategoryBarFeeds',
      'hideCategoryBarChannels',
      'hideCategoryBarWatch',
      'hideMixPlaylistsFeeds',
      'hideMixPlaylistsWatch',
      'hideShorts',
      'hideShortsSidebar',
      'hideShortsFeeds',
      'hideShortsChannel',
      'hideShortsWatch',
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

  // Auto-enable extension if user clicks anywhere in popup options or tabs while disabled
  const autoWakeHandler = () => {
    if (masterToggle && !masterToggle.checked) {
      masterToggle.checked = true;
      chrome.storage.local.set({ extensionEnabled: true }, () => {
        updateMasterToggleUI(true);
        sendCurrentSettingsToActiveTab();
      });
    }
  };

  if (tabsNav) tabsNav.addEventListener('click', autoWakeHandler);
  if (optionsScroll) optionsScroll.addEventListener('click', autoWakeHandler);

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

  // Header & Footer Buttons Event Listeners
  const rateUsBtn = document.getElementById('rateUsBtn');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const githubHeaderBtn = document.getElementById('githubHeaderBtn');

  if (rateUsBtn) {
    rateUsBtn.addEventListener('click', () => {
      const isFirefox = navigator.userAgent.includes('Firefox');
      const isEdge = navigator.userAgent.includes('Edg');
      
      let rateUrl = 'https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj/reviews';
      
      if (isFirefox) {
        rateUrl = 'https://addons.mozilla.org/en-US/firefox/addon/youtube-control/reviews/';
      } else if (isEdge) {
        rateUrl = 'https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki';
      }
      
      chrome.tabs.create({ url: rateUrl });
    });
  }

  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://docs.google.com/forms/d/e/1FAIpQLSdhjOJ_0-0izySTgrnNMdv2HTQxSVweHSp58ylSIRF_4KHiSw/viewform?usp=dialog' });
    });
  }

  if (githubHeaderBtn) {
    githubHeaderBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://github.com/vishwa-vsr/YouTube-Control' });
    });
  }

  // ── Review Prompt Logic ──
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const reviewOverlay = document.getElementById('reviewOverlay');
  const reviewLeaveBtn = document.getElementById('reviewLeaveBtn');
  const reviewLaterBtn = document.getElementById('reviewLaterBtn');
  const reviewDismissBtn = document.getElementById('reviewDismissBtn');

  function hideReviewModal() {
    if (reviewOverlay) reviewOverlay.style.display = 'none';
  }

  function showReviewModal() {
    if (reviewOverlay) reviewOverlay.style.display = 'flex';
  }

  function getReviewUrl() {
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isEdge = navigator.userAgent.includes('Edg');

    if (isFirefox) {
      return 'https://addons.mozilla.org/en-US/firefox/addon/youtube-control/reviews/';
    } else if (isEdge) {
      return 'https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki';
    }
    return 'https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj/reviews';
  }

  // Check if we should show the review prompt
  chrome.storage.local.get(['installDate', 'reviewDismissed', 'reviewCompleted', 'reviewLaterUntil'], (data) => {
    // If user already reviewed or permanently dismissed, don't show
    if (data.reviewCompleted || data.reviewDismissed) return;

    const now = Date.now();

    // If no install date exists (existing user before this update), set one now
    if (!data.installDate) {
      chrome.storage.local.set({ installDate: now });
      return; // Treat today as Day 1, don't show yet
    }

    // Check if 1 day (24 hours) has passed since install
    if (now - data.installDate < ONE_DAY) return;

    // Check if "Maybe Later" cooldown is still active
    if (data.reviewLaterUntil && now < data.reviewLaterUntil) return;

    // All conditions met — show the review prompt
    showReviewModal();
  });

  // "Leave a Review" — open store page, mark as completed forever
  if (reviewLeaveBtn) {
    reviewLeaveBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: getReviewUrl() });
      chrome.storage.local.set({ reviewCompleted: true });
      hideReviewModal();
    });
  }

  // "Maybe Later" — snooze for 1 day
  if (reviewLaterBtn) {
    reviewLaterBtn.addEventListener('click', () => {
      chrome.storage.local.set({ reviewLaterUntil: Date.now() + ONE_DAY });
      hideReviewModal();
    });
  }

  // "Don't Ask Again" — permanently dismiss
  if (reviewDismissBtn) {
    reviewDismissBtn.addEventListener('click', () => {
      chrome.storage.local.set({ reviewDismissed: true });
      hideReviewModal();
    });
  }
});
