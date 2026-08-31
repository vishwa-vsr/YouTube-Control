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
  showRefreshCommentsBtn: 'yt-enable-comments-refresh',
  showCommentScreenshotBtn: 'yt-show-comment-screenshot-btn',
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
    
    const refreshBtn = document.querySelector('.yt-refresh-comments-btn');
    if (refreshBtn) refreshBtn.remove();
    
    document.querySelectorAll('.yt-comment-screenshot-btn').forEach(btn => btn.remove());
    
    const headerActions = document.querySelector('.yt-comments-header-actions');
    if (headerActions && !headerActions.hasChildNodes()) headerActions.remove();
    
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

  if (settings.showRefreshCommentsBtn === true && !isLiveOrChat) {
    injectRefreshCommentsButton();
  } else {
    const btn = document.querySelector('.yt-refresh-comments-btn');
    if (btn) btn.remove();
  }

  if (settings.showCommentScreenshotBtn === true) {
    injectCommentScreenshotButtons();
  } else {
    document.querySelectorAll('.yt-comment-screenshot-btn').forEach(btn => btn.remove());
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

function getOrCreateCommentsHeaderActions(header) {
  let container = header.querySelector('.yt-comments-header-actions');
  if (!container) {
    container = document.createElement('div');
    container.className = 'yt-comments-header-actions';
    header.appendChild(container);
  }
  return container;
}

function injectSidebarCommentsButton() {
  if (isLiveStreamOrChatActive()) {
    const btn = document.querySelector('.yt-dock-comments-btn');
    if (btn) btn.remove();
    return;
  }
  const header = document.querySelector('ytd-comments-header-renderer');
  if (!header || header.querySelector('.yt-dock-comments-btn')) return;
  
  const container = getOrCreateCommentsHeaderActions(header);
  const btn = document.createElement('button');
  btn.className = 'yt-dock-comments-btn';
  const isDocked = document.documentElement.classList.contains('yt-comments-docked');
  if (isDocked) {
    btn.classList.add('active');
    btn.setAttribute('aria-label', 'Restore comments below player');
    setCommentsBtnIcon(btn, true);
  } else {
    btn.classList.remove('active');
    btn.setAttribute('aria-label', 'Move comments to sidebar');
    setCommentsBtnIcon(btn, false);
  }
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebarComments();
  }, true);
  container.appendChild(btn);
}

function injectRefreshCommentsButton() {
  if (isLiveStreamOrChatActive()) {
    const btn = document.querySelector('.yt-refresh-comments-btn');
    if (btn) btn.remove();
    return;
  }
  const header = document.querySelector('ytd-comments-header-renderer');
  if (!header || header.querySelector('.yt-refresh-comments-btn')) return;
  
  const container = getOrCreateCommentsHeaderActions(header);
  const btn = document.createElement('button');
  btn.className = 'yt-refresh-comments-btn';
  btn.setAttribute('aria-label', 'Refresh comments');
  btn.setAttribute('title', 'Refresh comments');
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'currentColor');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z');
  svg.appendChild(path);
  btn.appendChild(svg);
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    triggerCommentsRefresh(btn);
  }, true);
  
  const dockBtn = container.querySelector('.yt-dock-comments-btn');
  if (dockBtn) {
    container.insertBefore(btn, dockBtn);
  } else {
    container.appendChild(btn);
  }
}

function triggerCommentsRefresh(btn) {
  if (!btn || btn.classList.contains('spinning')) return;
  btn.classList.add('spinning');
  
  let finished = false;
  const stopSpinning = () => {
    if (finished) return;
    finished = true;
    btn.classList.remove('spinning');
  };
  
  // Safe maximum spinning timeout (2.5 seconds)
  const spinTimeout = setTimeout(stopSpinning, 2500);
  
  try {
    // Observe contents list to stop spinning when new comments arrive
    const contentsEl = document.querySelector('ytd-comments #sections #contents, #comments #contents');
    if (contentsEl) {
      const obs = new MutationObserver((mutations, observerInstance) => {
        observerInstance.disconnect();
        clearTimeout(spinTimeout);
        setTimeout(stopSpinning, 200);
      });
      obs.observe(contentsEl, { childList: true });
    }
    
    // Look for active item or trigger YouTube's sort dropdown
    const sortMenuBtn = document.querySelector('ytd-comments-header-renderer #sort-menu yt-button-shape button, ytd-comments-header-renderer #sort-menu button, ytd-comments-header-renderer yt-sort-filter-sub-menu-renderer yt-dropdown-menu, ytd-comments-header-renderer #sort-menu');
    
    const existingActiveItem = document.querySelector('tp-yt-paper-listbox#menu .iron-selected, ytd-menu-service-item-renderer[aria-selected="true"], ytd-comments-header-renderer tp-yt-paper-item.iron-selected');
    
    if (existingActiveItem) {
      existingActiveItem.click();
    } else if (sortMenuBtn) {
      sortMenuBtn.click();
      setTimeout(() => {
        const items = document.querySelectorAll('tp-yt-paper-listbox#menu tp-yt-paper-item, ytd-popup-container ytd-menu-service-item-renderer, ytd-menu-service-item-renderer');
        let itemToClick = null;
        for (const it of items) {
          if (it.classList.contains('iron-selected') || it.getAttribute('aria-selected') === 'true') {
            itemToClick = it;
            break;
          }
        }
        if (!itemToClick && items.length > 0) itemToClick = items[0];
        if (itemToClick) {
          itemToClick.click();
        } else if (sortMenuBtn) {
          sortMenuBtn.click();
        }
      }, 50);
    }
  } catch (err) {}
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

function setCommentCameraIcon(button) {
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
}

function setCommentCheckmarkIcon(button) {
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#2ba640" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
}

function injectCommentScreenshotButtons() {
  const commentElements = document.querySelectorAll('ytd-comment-view-model, ytd-comment-renderer');
  if (!commentElements.length) return;

  commentElements.forEach(commentEl => {
    if (commentEl.querySelector('.yt-comment-screenshot-btn')) return;

    const toolbar = commentEl.querySelector('ytd-comment-engagement-bar #toolbar, #action-buttons #toolbar, #toolbar');
    if (!toolbar) return;

    const btn = document.createElement('button');
    btn.className = 'yt-comment-screenshot-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Screenshot comment & copy to clipboard');
    btn.setAttribute('title', 'Screenshot comment & copy to clipboard');
    setCommentCameraIcon(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      captureCommentScreenshot(commentEl, btn);
    }, true);

    const replyBtn = toolbar.querySelector('#reply-button-end, #reply-dialog');
    if (replyBtn && replyBtn.parentNode === toolbar) {
      replyBtn.after(btn);
    } else {
      toolbar.appendChild(btn);
    }
  });
}

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const paragraphs = text.split('\n');
  const lines = [];

  paragraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  });

  return lines;
}

function drawRoundedCard(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCommentThumbIcon(ctx, x, y, color, isDislike = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  const pathData = isDislike
    ? "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"
    : "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z";
  const p = new Path2D(pathData);
  ctx.scale(0.55, 0.55);
  ctx.fill(p);
  ctx.restore();
}

function drawCreatorHeartBadge(ctx, x, y, img, colors) {
  const size = 18;
  const radius = size / 2;

  // 1. Creator Avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = colors.avatarBg;
    ctx.fill();
  }
  ctx.restore();

  // 2. Red Heart overlay on bottom-right corner
  ctx.save();
  ctx.translate(x + 9, y + 9);
  ctx.fillStyle = '#ff0000';
  const heartPath = new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
  ctx.scale(0.42, 0.42);
  ctx.fill(heartPath);
  ctx.restore();
}

function loadAvatarImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 800);
  });
}

function extractSingleCommentData(elem) {
  if (!elem) return null;
  const authorEl = elem.querySelector('#author-text, #header-author #author-text, h3 #author-text');
  const author = authorEl ? authorEl.textContent.trim() : '@user';

  const timeEl = elem.querySelector('#published-time-text, #published-time-text a, #header-author #published-time-text');
  const time = timeEl ? timeEl.textContent.trim() : '';

  const contentEl = elem.querySelector('#content-text, #expander #content-text, yt-attributed-string#content-text');
  const commentText = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';

  const voteEl = elem.querySelector('#vote-count-middle, #vote-count-left, ytd-toggle-button-renderer#like-button #vote-count-middle');
  const likes = voteEl ? voteEl.textContent.trim() : '';

  const avatarImg = elem.querySelector('#author-thumbnail img, #author-thumbnail-button img, yt-img-shadow img');
  const avatarSrc = avatarImg ? (avatarImg.currentSrc || avatarImg.src) : null;

  // Creator heart
  const heartElem = elem.querySelector('ytd-creator-heart-renderer, #creator-heart');
  let creatorHeartSrc = null;
  if (heartElem && !heartElem.hasAttribute('hidden') && heartElem.style.display !== 'none') {
    const creatorImg = heartElem.querySelector('#creator-thumbnail img, img');
    if (creatorImg) {
      creatorHeartSrc = creatorImg.currentSrc || creatorImg.src || null;
    }
  }

  return { author, time, text: commentText, likes, avatarSrc, creatorHeartSrc, hasCreatorHeart: !!creatorHeartSrc };
}

function drawAvatarCircle(ctx, x, y, size, img, author, colors) {
  const radius = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = colors.avatarBg;
    ctx.fill();
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `bold ${Math.round(size * 0.42)}px Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initial = (author.replace('@', '').charAt(0) || 'U').toUpperCase();
    ctx.fillText(initial, x + radius, y + radius);
  }
  ctx.restore();
}

async function captureCommentScreenshot(commentEl, btnEl) {
  if (!commentEl) return;

  const isInsideReplies = !!commentEl.closest('ytd-comment-replies-renderer');
  const mainCommentData = extractSingleCommentData(commentEl);
  if (!mainCommentData) return;

  let repliesData = [];
  if (!isInsideReplies) {
    const thread = commentEl.closest('ytd-comment-thread-renderer');
    const repliesContainer = thread?.querySelector('ytd-comment-replies-renderer');
    if (repliesContainer) {
      const replyElements = Array.from(repliesContainer.querySelectorAll('ytd-comment-view-model, ytd-comment-renderer'));
      const visibleReplies = replyElements.filter(r => {
        if (r.hasAttribute('hidden') || r.classList.contains('sf-hidden') || r.style.display === 'none') return false;
        return r.offsetWidth > 0 || r.offsetHeight > 0 || r.offsetParent !== null;
      });
      repliesData = visibleReplies.map(extractSingleCommentData).filter(Boolean);
    }
  }

  const isThread = repliesData.length > 0;

  // Determine parent-child relationship for each reply
  const knownAuthors = [mainCommentData.author];
  const structuredReplies = repliesData.map(r => {
    // Check if the reply mentions another author in the thread
    const mentionMatch = r.text.match(/@[a-zA-Z0-9_.-]+/);
    let parentAuthor = mainCommentData.author;
    if (mentionMatch) {
      const targetMention = mentionMatch[0].toLowerCase();
      const matched = knownAuthors.find(a => a.toLowerCase() === targetMention);
      if (matched) {
        parentAuthor = matched;
      }
    }
    knownAuthors.push(r.author);
    return { ...r, parentAuthor };
  });

  // Theme check
  const isDark = document.documentElement.hasAttribute('dark') || 
                 document.documentElement.classList.contains('dark') || 
                 document.body?.classList?.contains('dark');

  const colors = {
    cardBg: isDark ? '#0f0f0f' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    textPrimary: isDark ? '#f1f1f1' : '#0f0f0f',
    textSecondary: isDark ? '#aaaaaa' : '#606060',
    likeIcon: isDark ? '#aaaaaa' : '#606060',
    avatarBg: isDark ? '#272727' : '#e5e5e5',
    threadLine: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)',
    watermark: isDark ? '#555555' : '#aaaaaa'
  };

  // Dimensions & Layout calculation
  const cardWidth = 640;
  const padX = 28;
  const padY = 24;
  const mainAvatarSize = 44;
  const replyAvatarSize = 32;
  const lineHeight = 20;

  // Temporary canvas to measure wrapped text
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = '14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

  // Measure Main Comment
  const mainTextX = padX + mainAvatarSize + 14;
  const mainContentWidth = cardWidth - padX - mainTextX;
  const mainLines = wrapCanvasText(tempCtx, mainCommentData.text, mainContentWidth);

  // Position Main Comment
  let currentY = padY;
  const mainTopY = currentY;
  const mainAvatarCenter = {
    x: padX + mainAvatarSize / 2,
    y: mainTopY + mainAvatarSize / 2
  };
  const mainAuthorY = mainTopY + 14;
  const mainTextStartY = mainTopY + 34;
  const mainLikesY = mainTextStartY + (mainLines.length * lineHeight) + 12;
  const mainBlockHeight = Math.max(mainAvatarSize + 12, (mainLikesY + 18) - mainTopY) + 16;
  currentY += mainBlockHeight;

  // Measure and Position Replies
  const measuredReplies = structuredReplies.map((r) => {
    const isNested = r.parentAuthor !== mainCommentData.author;
    const indentX = isNested ? padX + 54 : padX + 32;
    const textX = indentX + replyAvatarSize + 12;
    const contentWidth = cardWidth - padX - textX;

    const lines = wrapCanvasText(tempCtx, r.text, contentWidth);
    const topY = currentY;
    const avatarCenter = {
      x: indentX + replyAvatarSize / 2,
      y: topY + replyAvatarSize / 2
    };
    const authorY = topY + 14;
    const textStartY = topY + 32;
    const likesY = textStartY + (lines.length * lineHeight) + 12;
    const blockHeight = Math.max(replyAvatarSize + 12, (likesY + 18) - topY) + 14;

    currentY += blockHeight;

    return {
      ...r,
      isNested,
      indentX,
      textX,
      lines,
      topY,
      avatarCenter,
      authorY,
      textStartY,
      likesY,
      blockHeight
    };
  });

  const watermarkHeight = 24;
  const cardHeight = Math.max(140, currentY + watermarkHeight + padY);

  // High-DPI canvas (Scale 2x)
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = cardWidth * scale;
  canvas.height = cardHeight * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Draw Card Background
  drawRoundedCard(ctx, 0, 0, cardWidth, cardHeight, 16);
  ctx.fillStyle = colors.cardBg;
  ctx.fill();
  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Load all avatar images & creator heart images concurrently
  const avatarUrls = [
    mainCommentData.avatarSrc,
    mainCommentData.creatorHeartSrc,
    ...structuredReplies.flatMap(r => [r.avatarSrc, r.creatorHeartSrc])
  ];
  const loadedImages = await Promise.all(avatarUrls.map(loadAvatarImage));

  const mainAvatarImg = loadedImages[0];
  const mainCreatorHeartImg = loadedImages[1];

  const replyAvatarImgs = [];
  const replyCreatorHeartImgs = [];
  for (let i = 2; i < loadedImages.length; i += 2) {
    replyAvatarImgs.push(loadedImages[i]);
    replyCreatorHeartImgs.push(loadedImages[i + 1]);
  }

  // Draw YouTube-Style Curved Threadlines
  if (isThread && measuredReplies.length > 0) {
    ctx.save();
    ctx.strokeStyle = colors.threadLine;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const curveR = 14;

    // 1. Main Spine from Root Comment
    const directReplies = measuredReplies.filter(r => !r.isNested);
    if (directReplies.length > 0) {
      const mainSpineX = mainAvatarCenter.x;
      const startSpineY = mainAvatarCenter.y + mainAvatarSize / 2 + 2;
      const lastDirectReply = directReplies[directReplies.length - 1];

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mainSpineX, startSpineY);
      ctx.lineTo(mainSpineX, lastDirectReply.avatarCenter.y - curveR);
      ctx.stroke();

      // Branch to each direct reply
      directReplies.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(mainSpineX, r.avatarCenter.y - curveR);
        ctx.quadraticCurveTo(mainSpineX, r.avatarCenter.y, mainSpineX + curveR, r.avatarCenter.y);
        ctx.lineTo(r.indentX - 1, r.avatarCenter.y);
        ctx.stroke();
      });
    }

    // 2. Sub-Spines for Nested Replies (e.g. replies to a reply)
    const nestedParents = new Set(measuredReplies.filter(r => r.isNested).map(r => r.parentAuthor));
    nestedParents.forEach(pAuthor => {
      const parentReply = measuredReplies.find(r => r.author === pAuthor);
      if (!parentReply) return;

      const children = measuredReplies.filter(r => r.parentAuthor === pAuthor);
      if (children.length === 0) return;

      const subSpineX = parentReply.avatarCenter.x;
      const subStartY = parentReply.avatarCenter.y + replyAvatarSize / 2 + 2;
      const lastChild = children[children.length - 1];

      // Vertical sub-spine
      ctx.beginPath();
      ctx.moveTo(subSpineX, subStartY);
      ctx.lineTo(subSpineX, lastChild.avatarCenter.y - curveR);
      ctx.stroke();

      // Branch to each child
      children.forEach((c) => {
        ctx.beginPath();
        ctx.moveTo(subSpineX, c.avatarCenter.y - curveR);
        ctx.quadraticCurveTo(subSpineX, c.avatarCenter.y, subSpineX + curveR, c.avatarCenter.y);
        ctx.lineTo(c.indentX - 1, c.avatarCenter.y);
        ctx.stroke();
      });
    });

    ctx.restore();
  }

  // Draw Main Comment Avatar
  drawAvatarCircle(ctx, padX, mainTopY, mainAvatarSize, mainAvatarImg, mainCommentData.author, colors);

  // Draw Main Comment Author & Timestamp
  ctx.font = 'bold 15px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(mainCommentData.author, mainTextX, mainAuthorY);

  if (mainCommentData.time) {
    const authorWidth = ctx.measureText(mainCommentData.author).width;
    ctx.font = '400 12px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(mainCommentData.time, mainTextX + authorWidth + 8, mainAuthorY);
  }

  // Draw Main Comment Text
  ctx.font = '400 14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textPrimary;
  mainLines.forEach((line, idx) => {
    if (line) {
      ctx.fillText(line, mainTextX, mainTextStartY + (idx * lineHeight));
    }
  });

  // Draw Main Comment Toolbar (Like, Count, Dislike, Creator Heart)
  let toolbarX = mainTextX;
  const toolbarY = mainLikesY;

  // 1. Like icon
  drawCommentThumbIcon(ctx, toolbarX, toolbarY - 10, colors.likeIcon, false);
  toolbarX += 16;

  // 2. Like count
  ctx.font = '500 12px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textSecondary;
  ctx.textBaseline = 'middle';
  const mainLikesText = mainCommentData.likes || '0';
  ctx.fillText(mainLikesText, toolbarX, toolbarY - 2);
  toolbarX += ctx.measureText(mainLikesText).width + 16;

  // 3. Dislike icon
  drawCommentThumbIcon(ctx, toolbarX, toolbarY - 10, colors.likeIcon, true);
  toolbarX += 20;

  // 4. Creator Heart Badge
  if (mainCommentData.hasCreatorHeart) {
    drawCreatorHeartBadge(ctx, toolbarX, toolbarY - 12, mainCreatorHeartImg, colors);
  }

  // Draw Replies
  if (isThread) {
    measuredReplies.forEach((r, idx) => {
      const rAvatarImg = replyAvatarImgs[idx];
      const rCreatorHeartImg = replyCreatorHeartImgs[idx];

      // Reply Avatar
      drawAvatarCircle(ctx, r.indentX, r.topY, replyAvatarSize, rAvatarImg, r.author, colors);

      // Reply Author & Time
      ctx.font = 'bold 14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textPrimary;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(r.author, r.textX, r.authorY);

      if (r.time) {
        const rAuthorWidth = ctx.measureText(r.author).width;
        ctx.font = '400 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(r.time, r.textX + rAuthorWidth + 6, r.authorY);
      }

      // Reply Text Lines
      ctx.font = '400 13px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textPrimary;
      r.lines.forEach((line, lIdx) => {
        if (line) {
          ctx.fillText(line, r.textX, r.textStartY + (lIdx * lineHeight));
        }
      });

      // Reply Toolbar (Like, Count, Dislike, Creator Heart)
      let rToolbarX = r.textX;
      const rToolbarY = r.likesY;

      // Like
      drawCommentThumbIcon(ctx, rToolbarX, rToolbarY - 10, colors.likeIcon, false);
      rToolbarX += 16;

      // Like Count
      ctx.font = '500 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textSecondary;
      ctx.textBaseline = 'middle';
      const rLikesText = r.likes || '0';
      ctx.fillText(rLikesText, rToolbarX, rToolbarY - 2);
      rToolbarX += ctx.measureText(rLikesText).width + 16;

      // Dislike
      drawCommentThumbIcon(ctx, rToolbarX, rToolbarY - 10, colors.likeIcon, true);
      rToolbarX += 20;

      // Creator Heart Badge
      if (r.hasCreatorHeart) {
        drawCreatorHeartBadge(ctx, rToolbarX, rToolbarY - 12, rCreatorHeartImg, colors);
      }
    });
  }

  // Draw Bottom Watermark
  const watermarkY = cardHeight - padY;
  ctx.font = '400 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.watermark;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(isThread ? `YouTube Control • Thread (${structuredReplies.length} replies)` : 'YouTube Control', cardWidth - padX, watermarkY);
  ctx.textAlign = 'left';

  // Export to Blob
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    // 1. Copy to Clipboard
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }

    // 2. Download PNG file
    try {
      const url = URL.createObjectURL(blob);
      const safeAuthor = mainCommentData.author.replace(/[^a-zA-Z0-9_@.-]/g, '_').substring(0, 30);
      const link = document.createElement('a');
      link.download = isThread ? `youtube_thread_${safeAuthor}.png` : `youtube_comment_${safeAuthor}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Comment PNG download failed:', err);
    }

    // 3. Button Feedback (Checkmark animation)
    if (btnEl) {
      btnEl.classList.add('copied');
      setCommentCheckmarkIcon(btnEl);
      setTimeout(() => {
        btnEl.classList.remove('copied');
        setCommentCameraIcon(btnEl);
      }, 1500);
    }
  }, 'image/png');
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

let isInternalSpeedUpdate = false;

function getActiveVideoElement() {
  return document.querySelector('#movie_player video.html5-main-video') || 
         document.querySelector('.html5-main-video') || 
         document.querySelector('video');
}

function getEffectivePlaybackRate() {
  const saved = parseFloat(cachedSettings.persistentPlaybackRate);
  if (!isNaN(saved) && saved > 0) return saved;
  const speedA = parseFloat(cachedSettings.speedValueA);
  if (!isNaN(speedA) && speedA > 0) return speedA;
  return 1.0;
}

function enforcePersistedPlaybackRate(video) {
  if (cachedSettings.showSpeedBtn !== true || cachedSettings.extensionEnabled === false) return;
  const targetVideo = video || getActiveVideoElement();
  if (!targetVideo) return;

  const targetRate = getEffectivePlaybackRate();
  if (Math.abs(targetVideo.playbackRate - targetRate) > 0.01) {
    isInternalSpeedUpdate = true;
    try {
      targetVideo.playbackRate = targetRate;
    } catch (e) {}
    setTimeout(() => { isInternalSpeedUpdate = false; }, 100);
  }
  updateSpeedButtonText(targetRate);
  attachVideoRateListener(targetVideo);
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
  
  const video = getActiveVideoElement();
  if (rate === undefined || rate === null) {
    rate = video ? video.playbackRate : getEffectivePlaybackRate();
  }
  
  if (video) {
    attachVideoRateListener(video);
  }
  
  const formatted = formatSpeedText(rate);
  badge.textContent = formatted;
  btn.removeAttribute('title');
}

function attachVideoRateListener(video) {
  if (!video || video._hasSpeedListeners) return;
  video._hasSpeedListeners = true;

  const applyPersisted = () => {
    enforcePersistedPlaybackRate(video);
  };

  video.addEventListener('loadedmetadata', applyPersisted);
  video.addEventListener('play', applyPersisted);
  video.addEventListener('playing', applyPersisted);

  video.addEventListener('ratechange', () => {
    if (isInternalSpeedUpdate) return;
    if (cachedSettings.showSpeedBtn !== true || cachedSettings.extensionEnabled === false) return;
    
    // If the user changed the rate manually via YouTube menu or keyboard shortcuts during playback
    if (video.readyState >= 1) {
      const newRate = Math.round(video.playbackRate * 100) / 100;
      cachedSettings.persistentPlaybackRate = newRate;
      try {
        chrome.storage.local.set({ persistentPlaybackRate: newRate });
      } catch (e) {}
      updateSpeedButtonText(newRate);
    }
  });
}

function togglePlaybackSpeed() {
  const video = getActiveVideoElement();
  if (!video) return;

  const speedA = parseFloat(cachedSettings.speedValueA) || 1.0;
  const speedB = parseFloat(cachedSettings.speedValueB) || 1.5;
  const speedC = parseFloat(cachedSettings.speedValueC) || 2.0;
  const presets = [speedA, speedB, speedC];
  const currentRate = Math.round(video.playbackRate * 100) / 100;

  let targetSpeed;
  if (Math.abs(currentRate - speedA) < 0.01) {
    targetSpeed = speedB;
  } else if (Math.abs(currentRate - speedB) < 0.01) {
    targetSpeed = speedC;
  } else if (Math.abs(currentRate - speedC) < 0.01) {
    targetSpeed = speedA;
  } else {
    // If current speed is off-preset (e.g. 1.25x), jump to next preset in sequence
    const nextHigher = presets.find(p => p > currentRate + 0.01);
    targetSpeed = (nextHigher !== undefined) ? nextHigher : speedA;
  }

  isInternalSpeedUpdate = true;
  video.playbackRate = targetSpeed;
  setTimeout(() => { isInternalSpeedUpdate = false; }, 100);

  cachedSettings.persistentPlaybackRate = targetSpeed;
  try {
    chrome.storage.local.set({ persistentPlaybackRate: targetSpeed });
  } catch (e) {}

  updateSpeedButtonText(targetSpeed);
}

function injectSpeedButton() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;
  
  let btn = rightControls.querySelector('.ytp-speed-button');
  if (btn) {
    updateSpeedButtonText();
    enforcePersistedPlaybackRate();
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

  const video = getActiveVideoElement();
  if (video) {
    attachVideoRateListener(video);
    enforcePersistedPlaybackRate(video);
  } else {
    updateSpeedButtonText();
  }
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
  const isHomeOrSubs = location.pathname === '/' || location.pathname === '/index' || location.pathname.startsWith('/feed/subscriptions') || !!document.querySelector('ytd-browse[page-subtype="home"], ytd-browse[page-subtype="subscriptions"]');
  
  let styleEl = document.getElementById('yt-custom-grid-dynamic-style');

  if (!isEnabled || !isHomeOrSubs) {
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

      if (cachedSettings.showRefreshCommentsBtn === true && !isLiveOrChat) {
        injectRefreshCommentsButton();
      } else {
        const btn = document.querySelector('.yt-refresh-comments-btn');
        if (btn) btn.remove();
      }

      if (cachedSettings.showCommentScreenshotBtn === true) {
        injectCommentScreenshotButtons();
      } else {
        document.querySelectorAll('.yt-comment-screenshot-btn').forEach(btn => btn.remove());
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
      'showRefreshCommentsBtn',
      'showCommentScreenshotBtn',
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
  // Dual scrolling is strictly for the watch page; never touch home/feed/search scrolling
  const watchFlexy = document.querySelector('ytd-watch-flexy:not([hidden])');
  if (!watchFlexy) return;

  const elements = [
    watchFlexy.querySelector('#primary'),
    watchFlexy.querySelector('#secondary'),
    watchFlexy.querySelector('#secondary-inner'),
    watchFlexy.querySelector('#primary-inner')
  ];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el && el.scrollTop !== 0) {
      el.scrollTop = 0;
    }
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
    return true;
  }
  return false;
}

// Immediately trigger reset when clicking a DIFFERENT video link in the watch page sidebar
document.addEventListener('click', (e) => {
  // Ignore non-left clicks or modifier keys (opening in new tab)
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
    return;
  }

  // Only intercept clicks from the watch page sidebar (recommended videos)
  const secondary = document.querySelector('ytd-watch-flexy:not([hidden]) #secondary');
  if (!secondary || !secondary.contains(e.target)) {
    return;
  }

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
  enforcePersistedPlaybackRate();
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
  enforcePersistedPlaybackRate();
});

window.addEventListener('popstate', () => {
  handleVideoChange(window.location.href);
  enforcePersistedPlaybackRate();
});
