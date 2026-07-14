// Map settings keys to HTML class names
const classMap = {
  hideHomeFeed: 'yt-hide-home-feed',
  hideSubscriptions: 'yt-hide-subscriptions',
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
  dockCommentsSidebar: 'yt-enable-comments-dock'
};

// Apply classes to the document element (html tag)
// We use documentElement because body might not exist yet at document_start
let lastSidebarActiveState = null;

function updateSidebarState() {
  const root = document.documentElement;
  
  // 1. Check for expanded engagement panels (chapters, transcript, description, etc.)
  const hasExpandedPanel = !!document.querySelector('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]');
  
  // 2. Check for active playlist panel
  const playlistPanel = document.querySelector('ytd-playlist-panel-renderer');
  const hasActivePlaylist = playlistPanel && !playlistPanel.hasAttribute('hidden') && playlistPanel.style.display !== 'none';
  
  // 3. Check for active live chat
  const chatPanel = document.getElementById('chat') || document.querySelector('ytd-live-chat-frame');
  const hasActiveChat = chatPanel && !chatPanel.hasAttribute('hidden') && !chatPanel.hasAttribute('collapsed') && chatPanel.style.display !== 'none';
  
  // 4. Check for docked comments
  const hasDockedComments = root.classList.contains('yt-comments-docked');
  
  const shouldShowSidebar = hasExpandedPanel || hasActivePlaylist || hasActiveChat || hasDockedComments;
  
  if (shouldShowSidebar) {
    root.classList.add('yt-sidebar-active');
  } else {
    root.classList.remove('yt-sidebar-active');
  }

  // If the state changed, trigger a window resize event to force player recalculation
  if (shouldShowSidebar !== lastSidebarActiveState) {
    lastSidebarActiveState = shouldShowSidebar;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150); // Double-trigger to ensure YouTube's JS catches it after browser layout transition
  }
}

// Clean up sidebar sections (Explore and More from YouTube) dynamically to support localized texts and regional channel IDs
function hideSidebarExploreAndMore() {
  const sections = document.querySelectorAll('ytd-guide-section-renderer');
  const root = document.documentElement;
  
  const hideExplore = root.classList.contains('yt-hide-explore');
  const hideMore = root.classList.contains('yt-hide-more-from-youtube');
  
  sections.forEach(section => {
    // Check if it's the Explore section
    const hasExploreLink = !!section.querySelector('a[href*="/feed/trending"], a[href*="/feed/guide_builder"], a[href*="UC6bPxPxDez_F8D8M71nZ0XQ"], a[href*="UCqVDpXKLmKeBU_yyt_QkItQ"], a[href*="UCF0pVplsI8R5kcAqgG8ag5A"], a[href*="UClgRkhTL3_hImCAmdLfDE4g"]');
    const headerText = (section.querySelector('#header, .title, h3') || {}).textContent?.trim()?.toLowerCase() || '';
    const isExploreHeader = headerText === 'explore' || headerText.includes('explore') || headerText === 'eksplorasi' || headerText === 'explorar';

    if (hasExploreLink || isExploreHeader) {
      if (hideExplore) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
    
    // Check if it's the More from YouTube section
    const hasMoreLink = !!section.querySelector('a[href*="/premium"], a[href*="music.youtube.com"], a[href*="kids.youtube.com"]');
    const isMoreHeader = headerText.includes('more from') || headerText.includes('youtube');
    
    // Make sure we don't match the main header or explore
    const isActuallyMoreSection = hasMoreLink || (isMoreHeader && !isExploreHeader && headerText !== '');
    
    if (isActuallyMoreSection) {
      if (hideMore) {
        section.style.setProperty('display', 'none', 'important');
      } else {
        section.style.removeProperty('display');
      }
    }
  });
  
  // Also hide collapsed mini-sidebar entries
  const miniEntries = document.querySelectorAll('ytd-mini-guide-entry-renderer');
  miniEntries.forEach(entry => {
    const href = entry.querySelector('a')?.getAttribute('href') || '';
    
    // Explore mini entries (Trending / Gaming)
    const isExploreMini = href.includes('/feed/trending') || href.includes('UCqVDpXKLmKeBU_yyt_QkItQ') || href.includes('UClgRkhTL3_hImCAmdLfDE4g');
    if (isExploreMini) {
      if (hideExplore) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    }
  });
}

function applySettings(settings) {
  const root = document.documentElement;
  
  // Check master toggle state
  const isEnabled = settings.extensionEnabled !== false;
  
  if (!isEnabled) {
    // 1. Remove all layout helper classes
    Object.keys(classMap).forEach(key => {
      root.classList.remove(classMap[key]);
    });
    root.classList.remove('yt-no-hover-unblur');
    root.classList.remove('yt-comments-docked');
    root.classList.remove('yt-sidebar-active');
    
    // 2. Remove injected elements if present
    const screenshotBtn = document.querySelector('.ytp-screenshot-button');
    if (screenshotBtn) screenshotBtn.remove();
    
    const miniFullscreenBtn = document.querySelector('.ytp-mini-fullscreen-button');
    if (miniFullscreenBtn) {
      if (root.classList.contains('yt-web-fullscreen-active')) {
        toggleMiniFullscreen();
      }
      miniFullscreenBtn.remove();
    }
    
    const commentsBtn = document.querySelector('.yt-dock-comments-btn');
    if (commentsBtn) commentsBtn.remove();
    
    // Restore comments if docked
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
    
    // Restore hidden sidebar sections
    const sections = document.querySelectorAll('ytd-guide-section-renderer');
    sections.forEach(section => {
      section.style.removeProperty('display');
    });
    const miniEntries = document.querySelectorAll('ytd-mini-guide-entry-renderer');
    miniEntries.forEach(entry => {
      entry.style.removeProperty('display');
    });
    
    checkShortsTab();
    return;
  }

  // If enabled, apply configurations normally
  Object.keys(classMap).forEach(key => {
    const className = classMap[key];
    const val = settings[key] === true;
    
    if (val) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  });

  const disableHoverUnblur = settings.unblurOnHover === false;
  if (disableHoverUnblur) {
    root.classList.add('yt-no-hover-unblur');
  } else {
    root.classList.remove('yt-no-hover-unblur');
  }

  checkShortsTab();
  updateSidebarState();
  hideSidebarExploreAndMore();

  // Handle dynamic injection based on individual switches
  if (settings.showScreenshotBtn === true) {
    injectScreenshotButton();
  } else {
    const btn = document.querySelector('.ytp-screenshot-button');
    if (btn) btn.remove();
  }
  
  if (settings.showMiniFullscreenBtn === true) {
    injectMiniFullscreenButton();
  } else {
    const btn = document.querySelector('.ytp-mini-fullscreen-button');
    if (btn) {
      if (root.classList.contains('yt-web-fullscreen-active')) {
        toggleMiniFullscreen();
      }
      btn.remove();
    }
  }
  
  if (settings.dockCommentsSidebar === true) {
    injectSidebarCommentsButton();
  } else {
    const btn = document.querySelector('.yt-dock-comments-btn');
    if (btn) btn.remove();
    if (root.classList.contains('yt-comments-docked')) {
      toggleSidebarComments();
    }
  }

  // Force YouTube to recalculate the video player aspect ratio and dimensions
  // We wait 50ms to ensure the browser has finished rendering the layout classes.
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 50);
}

// Detect if user is directly accessing channel Shorts tab
function checkShortsTab() {
  const path = window.location.pathname;
  const isShortsTab = /\/shorts\/?$/.test(path);
  const root = document.documentElement;
  if (isShortsTab) {
    root.setAttribute('yt-on-shorts-tab', 'true');
  } else {
    root.removeAttribute('yt-on-shorts-tab');
  }
}

// Inject comments side-dock toggle button
function injectSidebarCommentsButton() {
  const header = document.querySelector('ytd-comments-header-renderer');
  if (!header || header.querySelector('.yt-dock-comments-btn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'yt-dock-comments-btn';
  btn.title = 'Move comments to sidebar';
  btn.innerHTML = getCommentsBtnIcon(false); // Always starts undocked
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebarComments();
  }, true);
  header.appendChild(btn);
}

// Get the correct SVG string based on active state
function getCommentsBtnIcon(isActive) {
  if (isActive) {
    // Cross / Close Icon (X)
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;
  } else {
    // Split Screen Icon
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h6v-2h-6v2zm0-4h6v-2h-6v2zm0-4h6V7h-6v2zM7 7h2v10H7V7z"/>
      </svg>
    `;
  }
}

// Toggle comments between sidebar and main position via local CSS class toggling
function toggleSidebarComments() {
  const root = document.documentElement;
  const comments = document.getElementById('comments');
  const primaryInner = document.querySelector('#primary-inner');
  const secondaryInner = document.querySelector('#secondary-inner');
  
  if (!comments || !primaryInner || !secondaryInner) return;
  
  const isDocked = root.classList.contains('yt-comments-docked');
  
  if (!isDocked) {
    // Move to sidebar
    secondaryInner.insertBefore(comments, secondaryInner.firstChild);
    root.classList.add('yt-comments-docked');
    
    // Update button states
    const btns = document.querySelectorAll('.yt-dock-comments-btn');
    btns.forEach(b => {
      b.title = 'Restore comments below player';
      b.classList.add('active');
      b.innerHTML = getCommentsBtnIcon(true); // Show cross icon
    });
  } else {
    // Move back to main position
    const aboveFold = document.getElementById('above-the-fold') || document.querySelector('ytd-watch-metadata');
    if (aboveFold) {
      aboveFold.after(comments);
    } else {
      primaryInner.appendChild(comments);
    }
    root.classList.remove('yt-comments-docked');
    
    // Update button states
    const btns = document.querySelectorAll('.yt-dock-comments-btn');
    btns.forEach(b => {
      b.title = 'Move comments to sidebar';
      b.classList.remove('active');
      b.innerHTML = getCommentsBtnIcon(false); // Show split screen icon
    });
  }
  
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 50);
}



// Helper to safely access chrome storage without throwing context invalidated exceptions
function safeGetSettings(callback) {
  if (!chrome.runtime || !chrome.runtime.id) {
    return; // Stop execution silently if context is invalidated
  }
  try {
    chrome.storage.local.get(['extensionEnabled', 'unblurOnHover', ...Object.keys(classMap)], (settings) => {
      if (chrome.runtime && chrome.runtime.id) {
        callback(settings);
      }
    });
  } catch (err) {
    // Context invalidated, do nothing
  }
}

// 1. Load and apply initial settings on page start
safeGetSettings((settings) => {
  applySettings(settings);
});

// 2. Listen for direct messages from the popup (for instant updates when settings toggle)
if (chrome.runtime && chrome.runtime.id) {
  try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateSettings') {
        applySettings(message.settings);
      }
    });
  } catch (err) {}
}

// 4. Re-apply settings on YouTube dynamic page transitions (SPA navigation)
window.addEventListener('yt-navigate-finish', () => {
  safeGetSettings((settings) => {
    applySettings(settings);
  });
});

window.addEventListener('yt-navigate-start', () => {
  const root = document.documentElement;
  if (root.classList.contains('yt-comments-docked')) {
    toggleSidebarComments();
  }
});

window.addEventListener('yt-page-data-updated', () => {
  safeGetSettings((settings) => {
    applySettings(settings);
  });
});

// ==========================================================================
// SCREENSHOT FEATURE LOGIC
// ==========================================================================

function captureScreenshot() {
  const video = document.querySelector('.html5-main-video');
  if (!video) {
    alert('No active video found to capture!');
    return;
  }
  
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    alert('Video is still loading. Please play it for a moment before taking a screenshot.');
    return;
  }

  // Create temporary canvas
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  try {
    const dataUrl = canvas.toDataURL('image/png');
    
    // Get clean video title
    let videoTitle = 'youtube_screenshot';
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title.ytd-video-primary-info-renderer');
    if (titleElement) {
      videoTitle = titleElement.textContent.trim().replace(/[\\/:*?\"<>|]/g, '');
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${videoTitle}.png`;
    link.href = dataUrl;
    link.click();
    
    // Premium visual shutter flash effect
    const player = document.querySelector('#movie_player') || video.parentElement;
    if (player) {
      const flash = document.createElement('div');
      flash.className = 'yt-screenshot-flash';
      player.appendChild(flash);
      
      // Force layout recalculation to trigger CSS transition
      flash.offsetHeight;
      
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 150);
    }
  } catch (err) {
    console.error('Failed to capture video frame:', err);
    alert('Browser Security: Could not capture this video frame.');
  }
}

function injectScreenshotButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;
  
  // Prevent duplicate injection
  if (rightControls.querySelector('.ytp-screenshot-button')) return;
  
  const btn = document.createElement('button');
  btn.className = 'ytp-button ytp-screenshot-button';
  btn.title = 'Take Screenshot';
  // White camera icon matching YouTube control bar styling
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; display: block;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    captureScreenshot();
  });
  
  // Insert before subtitles button, settings gear, or just at the beginning
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
  
  // Update the button icon to show "Exit" state
  const btn = document.querySelector('.ytp-mini-fullscreen-button');
  if (btn) {
    if (isWebFullscreen) {
      btn.title = 'Exit Mini Fullscreen';
      // Exit mini fullscreen icon (arrows pointing inwards)
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path></svg>`;
    } else {
      btn.title = 'Mini Fullscreen';
      // Mini fullscreen icon (two overlapping boxes)
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="12" height="12" rx="2" ry="2" fill="#FFFFFF" fill-opacity="0.3"></rect></svg>`;
    }
  }
  
  // Trigger resize to fit player to 100% viewport width/height
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 50);
}

function injectMiniFullscreenButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;
  
  // Prevent duplicate injection
  if (rightControls.querySelector('.ytp-mini-fullscreen-button')) return;
  
  const btn = document.createElement('button');
  btn.className = 'ytp-button ytp-mini-fullscreen-button';
  btn.title = 'Mini Fullscreen';
  
  // Custom modern mini fullscreen SVG icon (two overlapping boxes)
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
  
  // Insert before native fullscreen button or settings gear
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
    const root = document.documentElement;
    if (root.classList.contains('yt-web-fullscreen-active')) {
      toggleMiniFullscreen();
    }
  }
}, true); // Use capture phase so we catch it before YouTube's native player overrides it

// Debounced observer to inject buttons — runs at most once every 500ms
let _pendingInject = null;

function scheduleButtonInjection() {
  if (_pendingInject) return; // already scheduled
  _pendingInject = setTimeout(() => {
    _pendingInject = null;
    
    // Disconnect the observer to prevent infinite self-triggering loops during our modifications
    if (typeof observer !== 'undefined') {
      observer.disconnect();
    }
    
    safeGetSettings((settings) => {
      const isEnabled = settings.extensionEnabled !== false;
      if (isEnabled) {
        if (settings.showScreenshotBtn === true) injectScreenshotButton();
        if (settings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
        if (settings.dockCommentsSidebar === true) injectSidebarCommentsButton();
        updateSidebarState();
        hideSidebarExploreAndMore();
      }
      
      // Resume observing the DOM
      if (typeof observer !== 'undefined') {
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }
    });
  }, 500);
}

const observer = new MutationObserver(scheduleButtonInjection);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Initial run
safeGetSettings((settings) => {
  const isEnabled = settings.extensionEnabled !== false;
  if (isEnabled) {
    if (settings.showScreenshotBtn === true) injectScreenshotButton();
    if (settings.showMiniFullscreenBtn === true) injectMiniFullscreenButton();
    if (settings.dockCommentsSidebar === true) injectSidebarCommentsButton();
    updateSidebarState();
    hideSidebarExploreAndMore();
  }
});
