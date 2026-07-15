// Map settings keys to HTML class names
const classMap = {
  hideHomeFeed: 'yt-hide-home-feed',
  hideSubscriptions: 'yt-hide-subscriptions',
  hideYou: 'yt-hide-you',
  hideExplore: 'yt-hide-explore',
  hideMoreFromYoutube: 'yt-hide-more-from-youtube',
  hideShorts: 'yt-hide-shorts',
  hideRecommended: 'yt-hide-recommended',
  hideComments: 'yt-hide-comments',
  hideButtonsStats: 'yt-hide-buttons-stats',
  hideHeader: 'yt-hide-header',
  grayscaleMode: 'yt-grayscale-mode',
  blurThumbnails: 'yt-blur-thumbnails',
  showScreenshotBtn: 'yt-show-screenshot-btn',
  showMiniFullscreenBtn: 'yt-show-mini-fullscreen-btn',
  stickyPlayer: 'yt-sticky-player',
  dockCommentsSidebar: 'yt-enable-comments-dock',
  hideAmbientMode: 'yt-hide-ambient-mode',
  hideSidebarFooter: 'yt-hide-sidebar-footer'
};

// Global memory cache to hold settings and save battery/CPU
let cachedSettings = {};
let lastSidebarActiveState = null;
let _pendingInject = null;

function updateSidebarState() {
  const root = document.documentElement;
  const hasExpandedPanel = !!document.querySelector('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]');
  const playlistPanel = document.querySelector('ytd-playlist-panel-renderer');
  const hasActivePlaylist = playlistPanel && !playlistPanel.hasAttribute('hidden') && playlistPanel.style.display !== 'none';
  const chatPanel = document.getElementById('chat') || document.querySelector('ytd-live-chat-frame');
  const hasActiveChat = chatPanel && !chatPanel.hasAttribute('hidden') && !chatPanel.hasAttribute('collapsed') && chatPanel.style.display !== 'none';
  const hasDockedComments = root.classList.contains('yt-comments-docked');
  
  const shouldShowSidebar = hasExpandedPanel || hasActivePlaylist || hasActiveChat || hasDockedComments;
  
  if (shouldShowSidebar) {
    root.classList.add('yt-sidebar-active');
  } else {
    root.classList.remove('yt-sidebar-active');
  }

  // Trigger resize event to force player recalculation
  if (shouldShowSidebar !== lastSidebarActiveState) {
    lastSidebarActiveState = shouldShowSidebar;
    dispatchResize();
  }
}

// Single debounced resize dispatcher to prevent screen flickering
function dispatchResize() {
  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}

function applySettings(settings) {
  const root = document.documentElement;
  const isEnabled = settings.extensionEnabled !== false;
  
  if (!isEnabled) {
    // Clean up layout helpers
    Object.keys(classMap).forEach(key => root.classList.remove(classMap[key]));
    root.classList.remove('yt-no-hover-unblur');
    root.classList.remove('yt-comments-docked');
    root.classList.remove('yt-sidebar-active');
    
    // Remove injected elements
    const screenshotBtn = document.querySelector('.ytp-screenshot-button');
    if (screenshotBtn) screenshotBtn.remove();
    
    const miniFullscreenBtn = document.querySelector('.ytp-mini-fullscreen-button');
    if (miniFullscreenBtn) {
      if (root.classList.contains('yt-web-fullscreen-active')) toggleMiniFullscreen();
      miniFullscreenBtn.remove();
    }
    
    const commentsBtn = document.querySelector('.yt-dock-comments-btn');
    if (commentsBtn) commentsBtn.remove();
    
    // Restore comments
    const comments = document.getElementById('comments');
    const primaryInner = document.querySelector('#primary-inner');
    if (comments && primaryInner && !primaryInner.contains(comments)) {
      const aboveFold = document.getElementById('above-the-fold') || document.querySelector('ytd-watch-metadata');
      if (aboveFold) {
        aboveFold.after(comments);
      } else {
        primaryInner.appendChild(comments);
      }
    }
    
    checkShortsTab();
    return;
  }

  // Apply configurations
  Object.keys(classMap).forEach(key => {
    const className = classMap[key];
    if (settings[key] === true) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  });

  if (settings.unblurOnHover === false) {
    root.classList.add('yt-no-hover-unblur');
  } else {
    root.classList.remove('yt-no-hover-unblur');
  }

  checkShortsTab();
  updateSidebarState();

  // Injections based on active settings
  if (settings.showScreenshotBtn === true) injectScreenshotButton();
  else {
    const btn = document.querySelector('.ytp-screenshot-button');
    if (btn) btn.remove();
  }
  
  if (settings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
  else {
    const btn = document.querySelector('.ytp-mini-fullscreen-button');
    if (btn) {
      if (root.classList.contains('yt-web-fullscreen-active')) toggleMiniFullscreen();
      btn.remove();
    }
  }
  
  if (settings.dockCommentsSidebar === true) injectSidebarCommentsButton();
  else {
    const btn = document.querySelector('.yt-dock-comments-btn');
    if (btn) btn.remove();
    if (root.classList.contains('yt-comments-docked')) toggleSidebarComments();
  }

  hideSidebarElements();
  dispatchResize();
}

function checkShortsTab() {
  const path = window.location.pathname;
  if (/\/shorts\/?$/.test(path)) {
    document.documentElement.setAttribute('yt-on-shorts-tab', 'true');
  } else {
    document.documentElement.removeAttribute('yt-on-shorts-tab');
  }
}

function injectSidebarCommentsButton() {
  const header = document.querySelector('ytd-comments-header-renderer');
  if (!header || header.querySelector('.yt-dock-comments-btn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'yt-dock-comments-btn';
  btn.title = 'Move comments to sidebar';
  btn.innerHTML = getCommentsBtnIcon(false);
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebarComments();
  }, true);
  header.appendChild(btn);
}

function getCommentsBtnIcon(isActive) {
  return isActive 
    ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
    : `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h6v-2h-6v2zm0-4h6v-2h-6v2zm0-4h6V7h-6v2zM7 7h2v10H7V7z"/></svg>`;
}

function toggleSidebarComments() {
  const root = document.documentElement;
  const comments = document.getElementById('comments');
  const primaryInner = document.querySelector('#primary-inner');
  const secondaryInner = document.querySelector('#secondary-inner');
  
  if (!comments || !primaryInner || !secondaryInner) return;
  
  if (!root.classList.contains('yt-comments-docked')) {
    secondaryInner.insertBefore(comments, secondaryInner.firstChild);
    root.classList.add('yt-comments-docked');
    document.querySelectorAll('.yt-dock-comments-btn').forEach(b => {
      b.title = 'Restore comments below player';
      b.classList.add('active');
      b.innerHTML = getCommentsBtnIcon(true);
    });
  } else {
    const aboveFold = document.getElementById('above-the-fold') || document.querySelector('ytd-watch-metadata');
    if (aboveFold) {
      aboveFold.after(comments);
    } else {
      primaryInner.appendChild(comments);
    }
    root.classList.remove('yt-comments-docked');
    document.querySelectorAll('.yt-dock-comments-btn').forEach(b => {
      b.title = 'Move comments to sidebar';
      b.classList.remove('active');
      b.innerHTML = getCommentsBtnIcon(false);
    });
  }
  dispatchResize();
}

function captureScreenshot() {
  const video = document.querySelector('.html5-main-video');
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  try {
    const dataUrl = canvas.toDataURL('image/png');
    let videoTitle = 'youtube_screenshot';
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title.ytd-video-primary-info-renderer');
    if (titleElement) {
      videoTitle = titleElement.textContent.trim().replace(/[\\/:*?\"<>|]/g, '');
    }
    
    const link = document.createElement('a');
    link.download = `${videoTitle}.png`;
    link.href = dataUrl;
    link.click();
    
    const player = document.querySelector('#movie_player') || video.parentElement;
    if (player) {
      const flash = document.createElement('div');
      flash.className = 'yt-screenshot-flash';
      player.appendChild(flash);
      flash.offsetHeight; // force reflow
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 150);
    }
  } catch (err) {
    console.error('Failed to capture video frame:', err);
  }
}

function injectScreenshotButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls || rightControls.querySelector('.ytp-screenshot-button')) return;
  
  const btn = document.createElement('button');
  btn.className = 'ytp-button ytp-screenshot-button';
  btn.title = 'Take Screenshot';
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; display: block;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    captureScreenshot();
  });
  
  const settingsBtn = rightControls.querySelector('.ytp-settings-button') || 
                      rightControls.querySelector('.ytp-subtitles-button') ||
                      rightControls.firstChild;
                      
  if (settingsBtn && settingsBtn.parentNode) {
    settingsBtn.parentNode.insertBefore(btn, settingsBtn);
  } else {
    rightControls.appendChild(btn);
  }
}

function toggleMiniFullscreen() {
  const root = document.documentElement;
  const isWebFullscreen = root.classList.toggle('yt-web-fullscreen-active');
  const btn = document.querySelector('.ytp-mini-fullscreen-button');
  
  if (btn) {
    if (isWebFullscreen) {
      btn.title = 'Exit Mini Fullscreen';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`;
    } else {
      btn.title = 'Mini Fullscreen';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="12" height="12" rx="2" ry="2" fill="#FFFFFF" fill-opacity="0.3"></rect></svg>`;
    }
  }
  dispatchResize();
}

function injectMiniFullscreenButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls || rightControls.querySelector('.ytp-mini-fullscreen-button')) return;
  
  const btn = document.createElement('button');
  btn.className = 'ytp-button ytp-mini-fullscreen-button';
  btn.title = 'Mini Fullscreen';
  
  const isCurrentlyActive = document.documentElement.classList.contains('yt-web-fullscreen-active');
  if (isCurrentlyActive) {
    btn.title = 'Exit Mini Fullscreen';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="12" height="12" rx="2" ry="2" fill="#FFFFFF" fill-opacity="0.3"></rect></svg>`;
  }
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMiniFullscreen();
  });
  
  const nativeFullscreenBtn = rightControls.querySelector('.ytp-fullscreen-button') ||
                               rightControls.querySelector('.ytp-settings-button') ||
                               rightControls.firstChild;
                               
  if (nativeFullscreenBtn && nativeFullscreenBtn.parentNode) {
    nativeFullscreenBtn.parentNode.insertBefore(btn, nativeFullscreenBtn);
  } else {
    rightControls.appendChild(btn);
  }
}

// Escape key listener to exit Mini Fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.documentElement.classList.contains('yt-web-fullscreen-active')) {
      toggleMiniFullscreen();
    }
  }
}, true);

// Listen for native browser fullscreen changes to prevent conflicts
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement && document.documentElement.classList.contains('yt-web-fullscreen-active')) {
    // If native fullscreen is activated, turn off mini web fullscreen to prevent sizing glitches
    toggleMiniFullscreen();
  }
});

function hideSidebarElements() {
  const isEnabled = cachedSettings.extensionEnabled !== false;
  
  // 1. Hide Shorts Sidebar Elements
  const hideShorts = cachedSettings.hideShorts === true;
  const shortsEntries = document.querySelectorAll('ytd-guide-entry-renderer, yt-guide-entry-view-model, ytd-mini-guide-entry-renderer, yt-mini-guide-entry-view-model, tp-yt-paper-item');
  shortsEntries.forEach(entry => {
    const text = entry.textContent || '';
    const href = entry.querySelector('a')?.getAttribute('href') || entry.getAttribute('href') || '';
    const isShorts = text.toLowerCase().includes('shorts') || href.toLowerCase().includes('shorts') || text.toLowerCase().includes('playables') || href.toLowerCase().includes('playables');
    if (isShorts) {
      if (isEnabled && hideShorts) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });

  // 2. Hide Subscriptions Sidebar Elements (Strictly Channel List only)
  const hideSubs = cachedSettings.hideSubscriptions === true;
  const sections = document.querySelectorAll('ytd-guide-section-renderer, yt-guide-section-view-model');
  sections.forEach(section => {
    const hasChannelLinks = !!section.querySelector('a[href*="/channel/"], a[href*="/@"], a[href*="guide_builder"]');
    const isYouSection = !!section.querySelector('a[href*="/feed/history"], a[href*="/feed/playlists"], a[href*="/feed/library"]');
    if (hasChannelLinks && !isYouSection) {
      if (isEnabled && hideSubs) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
  });
  
  // Collapsed mini sidebar subscriptions icon
  const miniEntries = document.querySelectorAll('ytd-mini-guide-entry-renderer, yt-mini-guide-entry-view-model');
  miniEntries.forEach(entry => {
    const href = entry.querySelector('a')?.getAttribute('href') || entry.getAttribute('href') || '';
    const text = entry.textContent || '';
    const isSubs = href.includes('subscriptions') || text.toLowerCase().includes('subscriptions');
    if (isSubs) {
      if (isEnabled && hideSubs) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });

  // 2b. Hide 'You' Sidebar Elements
  const hideYou = cachedSettings.hideYou === true;
  sections.forEach(section => {
    const isYouSection = !!section.querySelector('a[href*="/feed/history"], a[href*="/feed/playlists"], a[href*="/feed/library"]');
    if (isYouSection) {
      if (isEnabled && hideYou) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
  });

  // Collapsed mini sidebar "You" icon
  miniEntries.forEach(entry => {
    const href = entry.querySelector('a')?.getAttribute('href') || entry.getAttribute('href') || '';
    const text = entry.textContent || '';
    const isYou = href.includes('history') || href.includes('playlists') || href.includes('library') || text.toLowerCase().includes('you') || text.toLowerCase().includes('library');
    if (isYou) {
      if (isEnabled && hideYou) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });

  // 3. Hide Explore Elements
  const hideExplore = cachedSettings.hideExplore === true;
  sections.forEach(section => {
    const hasExplore = !!section.querySelector('a[href*="/feed/trending"], a[href*="/feed/guide_builder"], a[href*="/gaming"], a[href*="/trending"]');
    if (hasExplore && !section.querySelector('a[href*="/channel/"], a[href*="/@"]')) {
      if (isEnabled && hideExplore) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
  });
  miniEntries.forEach(entry => {
    const href = entry.querySelector('a')?.getAttribute('href') || entry.getAttribute('href') || '';
    const text = entry.textContent || '';
    const isExplore = href.includes('trending') || href.includes('gaming') || text.toLowerCase().includes('trending') || text.toLowerCase().includes('gaming');
    if (isExplore) {
      if (isEnabled && hideExplore) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });

  // 4. Hide More From YouTube
  const hideMore = cachedSettings.hideMoreFromYoutube === true;
  sections.forEach(section => {
    const hasMore = !!section.querySelector('a[href*="/premium"], a[href*="music.youtube.com"], a[href*="kids.youtube.com"]');
    if (hasMore) {
      if (isEnabled && hideMore) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
  });
}

// Debounced observer to inject buttons - runs at most once every 500ms
function scheduleButtonInjection() {
  if (_pendingInject) return;
  _pendingInject = setTimeout(() => {
    _pendingInject = null;
    
    const isEnabled = cachedSettings.extensionEnabled !== false;
    if (isEnabled) {
      if (cachedSettings.showScreenshotBtn === true) injectScreenshotButton();
      if (cachedSettings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
      if (cachedSettings.dockCommentsSidebar === true) injectSidebarCommentsButton();
      updateSidebarState();
      hideSidebarElements();
    }
  }, 500);
}

// Observe modifications (efficiently using our cached configuration settings)
const observer = new MutationObserver(scheduleButtonInjection);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Load settings into cache once on startup
try {
  chrome.storage.local.get(['extensionEnabled', 'unblurOnHover', ...Object.keys(classMap)], (settings) => {
    cachedSettings = settings;
    applySettings(cachedSettings);
  });
} catch (err) {}

// Listen for updates from the popup to keep cache synchronized
if (chrome.runtime && chrome.runtime.id) {
  try {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'updateSettings') {
        cachedSettings = message.settings;
        applySettings(cachedSettings);
      }
    });
  } catch (err) {}
}

// Re-apply settings on YouTube single-page navigation transitions
window.addEventListener('yt-navigate-finish', () => {
  applySettings(cachedSettings);
});

window.addEventListener('yt-navigate-start', () => {
  if (document.documentElement.classList.contains('yt-comments-docked')) {
    toggleSidebarComments();
  }
});

window.addEventListener('yt-page-data-updated', () => {
  applySettings(cachedSettings);
});
