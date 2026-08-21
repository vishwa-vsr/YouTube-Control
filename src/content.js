// Map settings keys to HTML class names
const classMap = {
  hideHomeFeed: 'yt-hide-home-feed',
  hideCategoryBar: 'yt-hide-category-bar',
  hideCategoryBarFeeds: 'yt-hide-category-bar-feeds',
  hideCategoryBarChannels: 'yt-hide-category-bar-channels',
  hideCategoryBarWatch: 'yt-hide-category-bar-watch',
  hideMixPlaylists: 'yt-hide-mix-playlists',
  hideMixPlaylistsFeeds: 'yt-hide-mix-playlists-feeds',
  hideMixPlaylistsWatch: 'yt-hide-mix-playlists-watch',
  hideSubscriptions: 'yt-hide-subscriptions',
  hideYou: 'yt-hide-you',
  hideExplore: 'yt-hide-explore',
  hideMoreFromYoutube: 'yt-hide-more-from-youtube',
  hideShorts: 'yt-hide-shorts',
  hideShortsSidebar: 'yt-hide-shorts-sidebar',
  hideShortsFeeds: 'yt-hide-shorts-feeds',
  hideShortsChannel: 'yt-hide-shorts-channel',
  hideShortsWatch: 'yt-hide-shorts-watch',
  hideRecommended: 'yt-hide-recommended',
  hideComments: 'yt-hide-comments',
  hideButtonsStats: 'yt-hide-buttons-stats',
  hideHeader: 'yt-hide-header',
  grayscaleMode: 'yt-grayscale-mode',
  blurThumbnails: 'yt-blur-thumbnails',
  showSpeedBtn: 'yt-show-speed-btn',
  showScreenshotBtn: 'yt-show-screenshot-btn',
  showMiniFullscreenBtn: 'yt-show-mini-fullscreen-btn',
  miniFullscreenFill: 'yt-web-fullscreen-fill',
  stickyPlayer: 'yt-sticky-player',
  dockCommentsSidebar: 'yt-enable-comments-dock',
  hideAmbientMode: 'yt-hide-ambient-mode',
  hideSidebarFooter: 'yt-hide-sidebar-footer'
};

// Global memory cache to hold settings and save battery/CPU
let cachedSettings = {};
let lastSidebarActiveState = null;
let _pendingInject = null;
let userManuallyUndocked = false;

function isLiveStreamOrChatActive() {
  const watchFlexy = document.querySelector('ytd-watch-flexy');
  const isLiveFlexy = watchFlexy && watchFlexy.hasAttribute('is-live');
  
  const player = document.querySelector('.html5-video-player');
  const isLivePlayer = player && player.classList.contains('ytp-live');
  
  const liveBadge = document.querySelector('.ytp-live-badge');
  const isLiveBadgeVisible = liveBadge && !liveBadge.hasAttribute('hidden') && liveBadge.style.display !== 'none' && !liveBadge.classList.contains('sf-hidden') && (liveBadge.offsetWidth > 0 || liveBadge.offsetHeight > 0);
  
  const isLive = !!(isLiveFlexy || isLivePlayer || isLiveBadgeVisible);

  const chatPanel = document.getElementById('chat') || document.querySelector('ytd-live-chat-frame') || document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="ytd-engagement-panel-live-chat"]');
  const hasActiveChat = !!(
    chatPanel && 
    !chatPanel.hasAttribute('hidden') && 
    !chatPanel.hasAttribute('collapsed') && 
    chatPanel.style.display !== 'none' &&
    (chatPanel.offsetWidth > 0 || chatPanel.offsetHeight > 0) &&
    chatPanel.querySelector('iframe[src*="live_chat"]')
  );
  
  return isLive || hasActiveChat;
}

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
  setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
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
    
    // Clean up custom grid
    cleanupCustomGrid();
    
    // Remove injected elements
    const speedBtn = document.querySelector('.ytp-speed-button');
    if (speedBtn) speedBtn.remove();

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

  // Handle Shorts master & sub-classes cleanly
  const hideShortsMaster = settings.hideShorts === true && isEnabled;
  if (hideShortsMaster) {
    if (settings.hideShortsSidebar !== false) root.classList.add('yt-hide-shorts-sidebar');
    else root.classList.remove('yt-hide-shorts-sidebar');

    if (settings.hideShortsFeeds !== false) root.classList.add('yt-hide-shorts-feeds');
    else root.classList.remove('yt-hide-shorts-feeds');

    if (settings.hideShortsChannel !== false) root.classList.add('yt-hide-shorts-channel');
    else root.classList.remove('yt-hide-shorts-channel');

    if (settings.hideShortsWatch !== false) root.classList.add('yt-hide-shorts-watch');
    else root.classList.remove('yt-hide-shorts-watch');
  } else {
    root.classList.remove('yt-hide-shorts');
    root.classList.remove('yt-hide-shorts-sidebar');
    root.classList.remove('yt-hide-shorts-feeds');
    root.classList.remove('yt-hide-shorts-channel');
    root.classList.remove('yt-hide-shorts-watch');
  }

  // Handle Category Bar master & sub-classes cleanly
  const hideCatMaster = settings.hideCategoryBar === true && isEnabled;
  if (hideCatMaster) {
    if (settings.hideCategoryBarFeeds !== false) root.classList.add('yt-hide-category-bar-feeds');
    else root.classList.remove('yt-hide-category-bar-feeds');

    if (settings.hideCategoryBarChannels !== false) root.classList.add('yt-hide-category-bar-channels');
    else root.classList.remove('yt-hide-category-bar-channels');

    if (settings.hideCategoryBarWatch !== false) root.classList.add('yt-hide-category-bar-watch');
    else root.classList.remove('yt-hide-category-bar-watch');
  } else {
    root.classList.remove('yt-hide-category-bar');
    root.classList.remove('yt-hide-category-bar-feeds');
    root.classList.remove('yt-hide-category-bar-channels');
    root.classList.remove('yt-hide-category-bar-watch');
  }

  // Handle Mix Playlists master & sub-classes cleanly
  const hideMixMaster = settings.hideMixPlaylists === true && isEnabled;
  if (hideMixMaster) {
    if (settings.hideMixPlaylistsFeeds !== false) root.classList.add('yt-hide-mix-playlists-feeds');
    else root.classList.remove('yt-hide-mix-playlists-feeds');

    if (settings.hideMixPlaylistsWatch !== false) root.classList.add('yt-hide-mix-playlists-watch');
    else root.classList.remove('yt-hide-mix-playlists-watch');
  } else {
    root.classList.remove('yt-hide-mix-playlists');
    root.classList.remove('yt-hide-mix-playlists-feeds');
    root.classList.remove('yt-hide-mix-playlists-watch');
  }

  if (settings.unblurOnHover === false) {
    root.classList.add('yt-no-hover-unblur');
  } else {
    root.classList.remove('yt-no-hover-unblur');
  }

  // Handle Custom Home Feed Grid
  if (settings.customGridEnabled === true) {
    enforceCustomGrid();
  } else {
    cleanupCustomGrid();
  }

  checkShortsTab();
  updateSidebarState();

  // Injections based on active settings
  if (settings.showSpeedBtn === true) injectSpeedButton();
  else {
    const btn = document.querySelector('.ytp-speed-button');
    if (btn) btn.remove();
  }

  if (settings.showScreenshotBtn === true) injectScreenshotButton();
  else {
    const btn = document.querySelector('.ytp-screenshot-button');
    if (btn) btn.remove();
  }
  
  if (settings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
  else {
    root.classList.remove('yt-web-fullscreen-fill');
    const btn = document.querySelector('.ytp-mini-fullscreen-button');
    if (btn) {
      if (root.classList.contains('yt-web-fullscreen-active')) toggleMiniFullscreen();
      btn.remove();
    }
  }
  
  const isLiveOrChat = isLiveStreamOrChatActive();
  if (settings.dockCommentsSidebar === true && !isLiveOrChat) {
    injectSidebarCommentsButton();
  } else {
    const btn = document.querySelector('.yt-dock-comments-btn');
    if (btn) btn.remove();
    if (root.classList.contains('yt-comments-docked')) toggleSidebarComments(true);
  }

  hideSidebarElements();
  dispatchResize();
}

function checkShortsTab() {
  const path = window.location.pathname;
  if (/\/shorts(\/|$)/.test(path)) {
    document.documentElement.setAttribute('yt-on-shorts-tab', 'true');
  } else {
    document.documentElement.removeAttribute('yt-on-shorts-tab');
  }
}

function injectSidebarCommentsButton() {
  if (isLiveStreamOrChatActive()) {
    const btn = document.querySelector('.yt-dock-comments-btn');
    if (btn) btn.remove();
    return;
  }
  const header = document.querySelector('ytd-comments-header-renderer');
  if (!header || header.querySelector('.yt-dock-comments-btn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'yt-dock-comments-btn';
  btn.setAttribute('aria-label', 'Move comments to sidebar');
  setCommentsBtnIcon(btn, false);
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebarComments();
  }, true);
  header.appendChild(btn);
}

function setCommentsBtnIcon(button, isActive) {
  button.textContent = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'currentColor');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  if (isActive) {
    path.setAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
  } else {
    path.setAttribute('d', 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h6v-2h-6v2zm0-4h6v-2h-6v2zm0-4h6V7h-6v2zM7 7h2v10H7V7z');
  }
  svg.appendChild(path);
  button.appendChild(svg);
}

function toggleSidebarComments(isAuto = false) {
  const root = document.documentElement;
  const comments = document.getElementById('comments');
  const primaryInner = document.querySelector('#primary-inner');
  const secondaryInner = document.querySelector('#secondary-inner');
  
  if (!comments || !primaryInner || !secondaryInner) return;
  
  if (!root.classList.contains('yt-comments-docked')) {
    comments.removeAttribute('hidden');
    comments.classList.remove('sf-hidden');
    comments.style.removeProperty('display');
    secondaryInner.insertBefore(comments, secondaryInner.firstChild);
    root.classList.add('yt-comments-docked');
    document.querySelectorAll('.yt-dock-comments-btn').forEach(b => {
      b.removeAttribute('title');
      b.setAttribute('aria-label', 'Restore comments below player');
      b.classList.add('active');
      setCommentsBtnIcon(b, true);
    });
  } else {
    const aboveFold = document.getElementById('above-the-fold') || document.querySelector('ytd-watch-metadata');
    if (aboveFold) {
      aboveFold.after(comments);
    } else {
      primaryInner.appendChild(comments);
    }
    root.classList.remove('yt-comments-docked');
    if (!isAuto) {
      userManuallyUndocked = true;
    }
    document.querySelectorAll('.yt-dock-comments-btn').forEach(b => {
      b.removeAttribute('title');
      b.setAttribute('aria-label', 'Move comments to sidebar');
      b.classList.remove('active');
      setCommentsBtnIcon(b, false);
    });
  }
  dispatchResize();
}

function captureScreenshot() {
  const video = document.querySelector('#movie_player video.html5-main-video') || document.querySelector('.html5-main-video');
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
  btn.setAttribute('aria-label', 'Screenshot');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; display: block;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    captureScreenshot();
  });
  
  const speedBtn = rightControls.querySelector('.ytp-speed-button');
  const settingsBtn = rightControls.querySelector('.ytp-settings-button') || 
                      rightControls.querySelector('.ytp-subtitles-button') ||
                      rightControls.firstChild;
                      
  if (speedBtn && speedBtn.parentNode === rightControls) {
    speedBtn.parentNode.insertBefore(btn, speedBtn);
  } else if (settingsBtn && settingsBtn.parentNode) {
    settingsBtn.parentNode.insertBefore(btn, settingsBtn);
  } else {
    rightControls.appendChild(btn);
  }
}

function formatSpeedText(rate) {
  if (typeof rate !== 'number' || isNaN(rate)) rate = 1.0;
  const rounded = parseFloat(rate.toFixed(2));
  return `${rounded}x`;
}

function updateSpeedButtonText(rate) {
  const btn = document.querySelector('.ytp-speed-button');
  if (!btn) return;
  
  const badge = btn.querySelector('.ytp-speed-badge');
  if (!badge) return;
  
  const video = document.querySelector('#movie_player video.html5-main-video') || document.querySelector('.html5-main-video');
  if (rate === undefined || rate === null) {
    rate = video ? video.playbackRate : (parseFloat(cachedSettings.speedValueA) || 1.0);
  }
  
  if (video) {
    attachVideoRateListener(video);
  }
  
  const formatted = formatSpeedText(rate);
  badge.textContent = formatted;
  btn.removeAttribute('title');
}

function attachVideoRateListener(video) {
  if (!video || video._hasSpeedRateListener) return;
  video._hasSpeedRateListener = true;
  video.addEventListener('ratechange', () => {
    updateSpeedButtonText(video.playbackRate);
  });
}

function togglePlaybackSpeed() {
  const video = document.querySelector('#movie_player video.html5-main-video') || document.querySelector('.html5-main-video');
  if (!video) return;

  const speedA = parseFloat(cachedSettings.speedValueA) || 1.0;
  const speedB = parseFloat(cachedSettings.speedValueB) || 2.0;
  const currentRate = video.playbackRate;

  let targetSpeed;
  if (Math.abs(currentRate - speedA) < 0.01) {
    targetSpeed = speedB;
  } else {
    targetSpeed = speedA;
  }

  video.playbackRate = targetSpeed;
  updateSpeedButtonText(targetSpeed);
}

function injectSpeedButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;
  
  let btn = rightControls.querySelector('.ytp-speed-button');
  if (btn) {
    updateSpeedButtonText();
    return;
  }

  btn = document.createElement('button');
  btn.className = 'ytp-button ytp-speed-button';
  btn.setAttribute('aria-label', 'Playback speed');
  btn.innerHTML = `<span class="ytp-speed-badge">1x</span>`;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    togglePlaybackSpeed();
  });

  const screenshotBtn = rightControls.querySelector('.ytp-screenshot-button');
  const settingsBtn = rightControls.querySelector('.ytp-settings-button') || 
                      rightControls.querySelector('.ytp-subtitles-button') ||
                      rightControls.firstChild;
                      
  if (screenshotBtn && screenshotBtn.parentNode === rightControls) {
    screenshotBtn.after(btn);
  } else if (settingsBtn && settingsBtn.parentNode) {
    settingsBtn.parentNode.insertBefore(btn, settingsBtn);
  } else {
    rightControls.appendChild(btn);
  }

  const video = document.querySelector('#movie_player video.html5-main-video') || document.querySelector('.html5-main-video');
  if (video) {
    attachVideoRateListener(video);
  }
  updateSpeedButtonText();
}

function toggleMiniFullscreen() {
  const root = document.documentElement;
  const isWebFullscreen = root.classList.toggle('yt-web-fullscreen-active');
  const btn = document.querySelector('.ytp-mini-fullscreen-button');
  
  if (btn) {
    btn.removeAttribute('title');
    if (isWebFullscreen) {
      btn.setAttribute('aria-label', 'Exit Mini Fullscreen');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`;
    } else {
      btn.setAttribute('aria-label', 'Mini Fullscreen');
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
  
  const isCurrentlyActive = document.documentElement.classList.contains('yt-web-fullscreen-active');
  btn.setAttribute('aria-label', isCurrentlyActive ? 'Exit Mini Fullscreen' : 'Mini Fullscreen');
  if (isCurrentlyActive) {
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

// Keyboard listeners for Mini Fullscreen (Escape to exit, 'T' to exit on theater toggle)
document.addEventListener('keydown', (e) => {
  if (document.documentElement.classList.contains('yt-web-fullscreen-active')) {
    if (e.key === 'Escape') {
      toggleMiniFullscreen();
    } else if (e.key === 't' || e.key === 'T') {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!isInput) {
        toggleMiniFullscreen();
      }
    }
  }
}, true);

// Listen for clicks on the Cinema / Theater mode button to exit Mini Fullscreen gracefully
document.addEventListener('click', (e) => {
  if (document.documentElement.classList.contains('yt-web-fullscreen-active')) {
    if (e.target && e.target.closest('.ytp-size-button')) {
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
  const hideShortsMaster = cachedSettings.hideShorts === true;
  const hideShortsSidebar = hideShortsMaster && (cachedSettings.hideShortsSidebar !== false);
  const shortsEntries = document.querySelectorAll('ytd-guide-entry-renderer, yt-guide-entry-view-model, ytd-mini-guide-entry-renderer, yt-mini-guide-entry-view-model, tp-yt-paper-item');
  shortsEntries.forEach(entry => {
    const text = entry.textContent || '';
    const href = entry.querySelector('a')?.getAttribute('href') || entry.getAttribute('href') || '';
    const isShorts = text.toLowerCase().includes('shorts') || href.toLowerCase().includes('shorts') || text.toLowerCase().includes('playables') || href.toLowerCase().includes('playables');
    if (isShorts) {
      if (isEnabled && hideShortsSidebar) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });

  // 1b. Hide Channel Header Shorts Tabs
  const hideShortsChannel = hideShortsMaster && (cachedSettings.hideShortsChannel !== false);
  const channelTabs = document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab, yt-tab-group-shape *, ytd-tabbed-header-renderer [role="tab"]');
  channelTabs.forEach(tab => {
    const text = (tab.textContent || '').trim().toLowerCase();
    const href = tab.querySelector('a')?.getAttribute('href') || tab.getAttribute('href') || tab.getAttribute('tab-title') || '';
    const isShortsTab = text === 'shorts' || href.toLowerCase().includes('/shorts');
    if (isShortsTab) {
      if (isEnabled && hideShortsChannel) {
        tab.style.setProperty('display', 'none', 'important');
      } else {
        tab.style.removeProperty('display');
      }
    }
  });

  // 2. Hide Subscriptions Sidebar Elements (Strictly Channel List only)
  const hideSubs = cachedSettings.hideSubscriptions === true;
  const sections = document.querySelectorAll('ytd-guide-section-renderer, yt-guide-section-view-model');
  sections.forEach(section => {
    const titleEl = section.querySelector('#guide-section-title');
    const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : '';

    const hasChannelLinks = !!section.querySelector('a[href*="/channel/"], a[href*="/@"], a[href*="guide_builder"]');
    const isYouSection = !!section.querySelector('a[href*="/feed/history"], a[href*="/feed/playlists"], a[href*="/feed/library"]');
    
    const isExploreSection = [
      'explore', 'explorar', 'explorer', 'entdecken', '探索', '탐색', 'navigator', 'навигатор'
    ].includes(titleText) || !!section.querySelector('a[href*="/feed/trending"], a[href*="/trending"], a[href*="/gaming"], a[href*="/feed/gaming"], a[href*="/podcasts"]');

    const isMoreSection = [
      'more from youtube', 'más de youtube', 'mehr von youtube', 'autres contenus youtube', 'youtube से और भी बहुत कुछ', 'другие возможности'
    ].includes(titleText) || !!section.querySelector('a[href*="/premium"], a[href*="music.youtube.com"], a[href*="kids.youtube.com"]');

    if (hasChannelLinks && !isYouSection && !isExploreSection && !isMoreSection) {
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
    const titleEl = section.querySelector('#guide-section-title');
    const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : '';

    const isExploreSection = [
      'explore', 'explorar', 'explorer', 'entdecken', '探索', '탐색', 'navigator', 'навигатор'
    ].includes(titleText) || !!section.querySelector('a[href*="UC6bPxPxDez_F8D8M71nZ0XQ"], a[href*="UCqVDpXKLmKeBU_yyt_QkItQ"], a[href*="UCF0pVplsI8R5kcAqgG8ag5A"], a[href*="UClgRkhTL3_hImCAmdLfDE4g"], a[href*="/feed/trending"], a[href*="/trending"], a[href*="/gaming"], a[href*="/feed/gaming"], a[href*="/podcasts"]');

    if (isExploreSection) {
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

function updateCategoryBarDynamicStyle() {
  const root = document.documentElement;
  const isEnabled = cachedSettings.hideCategoryBar === true && cachedSettings.extensionEnabled !== false;
  let styleEl = document.getElementById('yt-hide-category-bar-dynamic-style');

  if (!isEnabled) {
    if (styleEl) styleEl.remove();
    return;
  }

  const hideFeeds = cachedSettings.hideCategoryBarFeeds !== false;
  const hideChannels = cachedSettings.hideCategoryBarChannels !== false;
  const hideWatch = cachedSettings.hideCategoryBarWatch !== false;

  let cssText = '';

  if (hideFeeds) {
    cssText += `
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] yt-chip-cloud-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] #chips-wrapper,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] #chips-content,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-sticky-header-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #header,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #header-container,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-feed-filter-chip-bar-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] yt-chip-cloud-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] #chips-wrapper,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] #chips-content,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-sticky-header-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer #header,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer #header-container {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        pointer-events: none !important;
      }
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer {
        --ytd-rich-grid-content-offset-top: 0px !important;
        --ytd-rich-grid-chips-bar-top: 0px !important;
        padding-top: var(--ytd-masthead-height, 56px) !important;
        margin-top: 0 !important;
      }
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-rich-grid-renderer > #contents,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer > #contents {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="home"] ytd-rich-grid-renderer yt-touch-feedback-shape,
      .yt-hide-category-bar-feeds ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer yt-touch-feedback-shape {
        margin: 0 !important;
      }
    `;
  }

  if (hideChannels) {
    cssText += `
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] ytd-feed-filter-chip-bar-renderer,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] yt-chip-cloud-renderer,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] chip-bar-view-model,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] chip-view-model,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] #chips-wrapper,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] #chips-content,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] [chip-shape-type="CHIP_TYPE_SORT"],
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] ytd-sub-feed-selector-renderer,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] yt-sort-filter-sub-menu-renderer,
      .yt-hide-category-bar-channels ytd-browse[page-subtype="channels"] ytd-rich-grid-renderer #header {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        pointer-events: none !important;
      }
    `;
  }

  if (hideWatch) {
    cssText += `
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary #chips,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary yt-chip-cloud-renderer,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary ytd-feed-filter-chip-bar-renderer,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary-inner #chips,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary-inner yt-chip-cloud-renderer,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary-inner ytd-feed-filter-chip-bar-renderer {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        pointer-events: none !important;
      }
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary #items,
      .yt-hide-category-bar-watch ytd-watch-flexy #secondary-inner #items {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
    `;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'yt-hide-category-bar-dynamic-style';
    styleEl.textContent = cssText;
    (document.head || root).appendChild(styleEl);
  } else if (styleEl.textContent !== cssText) {
    styleEl.textContent = cssText;
  }
}

function updateCustomGridDynamicStyle() {
  const root = document.documentElement;
  const isEnabled = cachedSettings.customGridEnabled === true && cachedSettings.extensionEnabled !== false;
  const isHome = location.pathname === '/' || location.pathname === '/index' || !!document.querySelector('ytd-browse[page-subtype="home"]');
  
  let styleEl = document.getElementById('yt-custom-grid-dynamic-style');

  if (!isEnabled || !isHome) {
    if (styleEl) styleEl.remove();
    if (root.classList.contains('yt-custom-grid-active')) {
      root.classList.remove('yt-custom-grid-active');
      root.removeAttribute('data-yt-grid-cols');
      dispatchResize();
    }
    return;
  }

  const cols = cachedSettings.videosPerRow || 4;
  const colsStr = cols.toString();

  if (!root.classList.contains('yt-custom-grid-active')) {
    root.classList.add('yt-custom-grid-active');
  }
  if (root.getAttribute('data-yt-grid-cols') !== colsStr) {
    root.setAttribute('data-yt-grid-cols', colsStr);
  }

  const cssText = `
    html {
      --yt-custom-videos-per-row: ${colsStr};
    }
    html.yt-custom-grid-active ytd-rich-shelf-renderer:not([is-shorts]):not(:has(ytd-rich-item-renderer[is-post])) ytd-rich-item-renderer[is-shelf-item]:nth-child(-n + ${colsStr}) {
      display: block !important;
    }
  `;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'yt-custom-grid-dynamic-style';
    styleEl.textContent = cssText;
    (document.head || root).appendChild(styleEl);
  } else if (styleEl.textContent !== cssText) {
    styleEl.textContent = cssText;
  }
}

function cleanupCustomGrid() {
  updateCategoryBarDynamicStyle();
  updateCustomGridDynamicStyle();
}

function enforceCustomGrid() {
  updateCategoryBarDynamicStyle();
  updateCustomGridDynamicStyle();
}

// Debounced observer to inject buttons - runs at most once every 500ms
function scheduleButtonInjection() {
  if (_pendingInject) return;
  _pendingInject = setTimeout(() => {
    _pendingInject = null;
    
    const isEnabled = cachedSettings.extensionEnabled !== false;
    if (isEnabled) {
      if (cachedSettings.customGridEnabled === true) enforceCustomGrid();
      else cleanupCustomGrid();
      if (cachedSettings.showSpeedBtn === true) injectSpeedButton();
      if (cachedSettings.showScreenshotBtn === true) injectScreenshotButton();
      if (cachedSettings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
      
      const isLiveOrChat = isLiveStreamOrChatActive();
      if (cachedSettings.dockCommentsSidebar === true && !isLiveOrChat) {
        injectSidebarCommentsButton();
      } else {
        const btn = document.querySelector('.yt-dock-comments-btn');
        if (btn) btn.remove();
      }
      
      // Auto-dock comments if enabled in settings and not manually undocked by user
      const root = document.documentElement;
      if (cachedSettings.dockCommentsSidebar === true && !isLiveOrChat && !userManuallyUndocked && !root.classList.contains('yt-comments-docked')) {
        toggleSidebarComments(true);
      }
      
      // If we are on a live stream / active chat, make sure comments are undocked
      if (isLiveOrChat && root.classList.contains('yt-comments-docked')) {
        toggleSidebarComments(true);
      }
      
      updateSidebarState();
      hideSidebarElements();
    } else {
      cleanupCustomGrid();
    }
  }, 500);
}

// Observe modifications (efficiently using our cached configuration settings)
const observer = new MutationObserver(scheduleButtonInjection);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Load settings into cache once on startup
try {
  chrome.storage.local.get(null, (settings) => {
    settings = settings || {};
    // Set default for certain keys to true if they are undefined
    const defaultTrueKeys = [
      'unblurOnHover',
      'dockCommentsSidebar',
      'stickyPlayer',
      'showMiniFullscreenBtn',
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

let scrollResetTimers = [];

function cancelScrollResetTimers() {
  while (scrollResetTimers.length > 0) {
    clearTimeout(scrollResetTimers.pop());
  }
}

function resetPaneScrolls() {
  const elements = [
    document.querySelector('#primary'),
    document.querySelector('#secondary'),
    document.querySelector('#secondary-inner'),
    document.querySelector('#primary-inner'),
    document.querySelector('ytd-watch-flexy'),
    document.querySelector('#columns'),
    document.querySelector('ytd-watch-next-secondary-results-renderer'),
    document.documentElement,
    document.body
  ];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el && el.scrollTop !== 0) {
      el.scrollTop = 0;
    }
  }
  if (window.scrollY !== 0 || window.scrollX !== 0) {
    window.scrollTo(0, 0);
  }
}

function robustResetPaneScrolls() {
  cancelScrollResetTimers();
  resetPaneScrolls();
  if (window.requestAnimationFrame) {
    requestAnimationFrame(resetPaneScrolls);
  }

  // Multi-pass staggered reset ensures asynchronous YouTube recommendation rendering stays at the top
  const delays = [30, 80, 150, 300, 500, 800, 1200];
  delays.forEach(delay => {
    const timer = setTimeout(() => {
      resetPaneScrolls();
    }, delay);
    scrollResetTimers.push(timer);
  });
}

// Cancel delayed resets if the user starts scrolling manually with mouse wheel or touch
window.addEventListener('wheel', cancelScrollResetTimers, { passive: true });
window.addEventListener('touchmove', cancelScrollResetTimers, { passive: true });

// Helper to extract video ID from URL or string
function getVideoId(urlOrStr) {
  if (!urlOrStr) return null;
  try {
    const url = new URL(urlOrStr, window.location.origin);
    const v = url.searchParams.get('v');
    if (v) return v;
    if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2] || null;
    }
    if (url.pathname.startsWith('/live/')) {
      return url.pathname.split('/')[2] || null;
    }
  } catch (e) {
    const match = String(urlOrStr).match(/[?&]v=([^&#]+)/);
    if (match) return match[1];
  }
  return null;
}

let currentActiveVideoId = getVideoId(window.location.href);

function handleVideoChange(destinationUrlOrId) {
  const targetId = destinationUrlOrId ? (getVideoId(destinationUrlOrId) || destinationUrlOrId) : getVideoId(window.location.href);
  if (targetId && targetId !== currentActiveVideoId) {
    currentActiveVideoId = targetId;
    robustResetPaneScrolls();
    return true;
  } else if (!targetId && currentActiveVideoId) {
    currentActiveVideoId = null;
    robustResetPaneScrolls();
    return true;
  }
  return false;
}

// Immediately trigger reset when clicking a DIFFERENT video link (ignoring chapters, transcripts, timestamps)
document.addEventListener('click', (e) => {
  // If clicking inside chapter list, transcript, or timestamp components, ignore
  if (e.target.closest('ytd-chapter-renderer, ytd-macro-markers-list-item-renderer, ytd-transcript-segment-renderer, [target-id*="chapter"], [target-id*="transcript"]')) {
    return;
  }

  const link = e.target.closest('a[href*="watch?v="], a[href*="/shorts/"], ytd-compact-video-renderer a, ytd-thumbnail a, a#video-title-link, a#thumbnail');
  if (link && link.href) {
    handleVideoChange(link.href);
  }
}, true);

// Re-apply settings and reset scroll positions ONLY when navigating to a different video
window.addEventListener('yt-navigate-finish', (e) => {
  const nextUrl = (e && e.detail && e.detail.response && e.detail.response.endpoint && e.detail.response.endpoint.commandMetadata && e.detail.response.endpoint.commandMetadata.webCommandMetadata && e.detail.response.endpoint.commandMetadata.webCommandMetadata.url) || window.location.href;
  handleVideoChange(nextUrl);
  applySettings(cachedSettings);
});

window.addEventListener('yt-navigate-start', (e) => {
  const nextUrl = (e && e.detail && e.detail.url) ? e.detail.url : window.location.href;
  const isDifferentVideo = handleVideoChange(nextUrl);
  
  if (isDifferentVideo) {
    userManuallyUndocked = false;
    if (document.documentElement.classList.contains('yt-comments-docked')) {
      toggleSidebarComments(true); // pass true so we don't treat navigation-based reset as a manual user undock
    }
  }
});

window.addEventListener('yt-page-data-updated', () => {
  handleVideoChange(window.location.href);
  applySettings(cachedSettings);
});

window.addEventListener('popstate', () => {
  handleVideoChange(window.location.href);
});
