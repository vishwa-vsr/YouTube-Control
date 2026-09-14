/**
 * YouTube Control - Scroll Distance Tracker
 * Measures physical downward scroll distance across YouTube feeds
 * and the watch page sidebar with 0% CPU lag and automatic daily rollover.
 * Displays a clean, native text overlay in the top header beside the logo.
 */

export const METERS_PER_PIXEL = 0.000264583;
export const MIN_JITTER_THRESHOLD = 5; // Ignore micro-vibrations under 5 pixels

export function calculateMeters(pixels) {
  if (typeof pixels !== 'number' || isNaN(pixels) || pixels <= 0) return 0;
  return pixels * METERS_PER_PIXEL;
}

export function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isNewDay(storedDate, currentDate = getTodayDateString()) {
  if (!storedDate) return true;
  return storedDate !== currentDate;
}

export function parseStoredDistance(res, currentDate = getTodayDateString()) {
  const storedDate = res ? res.scrollDate : null;
  const isRollover = isNewDay(storedDate, currentDate);
  let todayMeters = (res && typeof res.scrollMetersToday === 'number') ? res.scrollMetersToday : 0;
  const allTimeMeters = (res && typeof res.scrollMetersAllTime === 'number') ? res.scrollMetersAllTime : 0;

  if (isRollover) {
    todayMeters = 0;
  }

  return {
    scrollDate: currentDate,
    todayMeters,
    allTimeMeters,
    isRollover
  };
}

export function getDistanceStats(callback) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (callback) callback({ todayMeters: 0, allTimeMeters: 0, isEnabled: false });
    return;
  }
  try {
    chrome.storage.local.get(['scrollDate', 'scrollMetersToday', 'scrollMetersAllTime', 'trackScrollDistance'], (res) => {
      if (chrome.runtime.lastError) {
        if (callback) callback({ todayMeters: 0, allTimeMeters: 0, isEnabled: false });
        return;
      }
      const isEnabled = res && res.trackScrollDistance === true;
      const stats = parseStoredDistance(res);
      if (callback) {
        callback({
          todayMeters: stats.todayMeters,
          allTimeMeters: stats.allTimeMeters,
          isEnabled
        });
      }
    });
  } catch (e) {
    if (callback) callback({ todayMeters: 0, allTimeMeters: 0, isEnabled: false });
  }
}

export function formatDistance(meters) {
  if (typeof meters !== 'number' || isNaN(meters) || meters <= 0) {
    return '0m';
  }
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  const formattedKm = km >= 100 ? Math.round(km) : km.toFixed(1);
  return `${formattedKm}km`;
}

export function getScrolledTodaySuffix() {
  if (typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function') {
    const msg = chrome.i18n.getMessage('scrolledToday');
    if (msg) return msg;
  }
  return 'scrolled today';
}

export function formatHeaderText(meters) {
  const dist = formatDistance(meters);
  const suffix = getScrolledTodaySuffix();
  return `${dist} ${suffix}`;
}

export function isAllowedTrackingPage(pathname = (typeof window !== 'undefined' && window.location ? window.location.pathname : '')) {
  if (!pathname) return false;
  // Home feed: '/' or ''
  if (pathname === '/' || pathname === '') return true;
  // Search results: '/results'
  if (pathname === '/results') return true;
  // Subscriptions feed: '/feed/subscriptions'
  if (pathname === '/feed/subscriptions') return true;
  // Channel pages: '/@username', '/channel/*', '/c/*', '/user/*'
  if (pathname.startsWith('/@') || pathname.startsWith('/channel/') || pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
    return true;
  }
  // Watch page: '/watch'
  if (pathname === '/watch') return true;

  return false;
}

// ── Runtime Content Script State ──
let isTrackingEnabled = false;
let lastWindowScrollY = 0;
let jitterAccumulator = 0;
let pendingDeltaMeters = 0;
let currentTodayMeters = 0;
let flushTimer = null;
let midnightTimer = null;
let rafUpdateScheduled = false;
let boundScroll = false;
const lastScrollMap = new WeakMap();

export function scheduleMidnightCheck() {
  if (midnightTimer) {
    clearTimeout(midnightTimer);
    midnightTimer = null;
  }
  if (typeof window === 'undefined') return;

  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

  midnightTimer = setTimeout(() => {
    if (pendingDeltaMeters > 0) {
      flushDistance();
    } else {
      currentTodayMeters = 0;
      updateHeaderOverlay(0);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          scrollDate: getTodayDateString(),
          scrollMetersToday: 0
        });
      }
    }
    scheduleMidnightCheck();
  }, msUntilMidnight);
}

export function updateHeaderOverlay(meters = (currentTodayMeters + pendingDeltaMeters)) {
  if (typeof document === 'undefined') return;
  if (!isTrackingEnabled) {
    removeHeaderOverlay();
    return;
  }

  let el = document.getElementById('yt-control-distance-header');
  if (!el) {
    const logoRenderer = document.querySelector('ytd-topbar-logo-renderer#logo') || 
                         document.querySelector('#masthead #start ytd-topbar-logo-renderer') ||
                         document.querySelector('ytd-topbar-logo-renderer');
    if (!logoRenderer) return;

    el = document.createElement('span');
    el.id = 'yt-control-distance-header';
    el.className = 'yt-control-distance-header';
    logoRenderer.insertAdjacentElement('afterend', el);
  }

  const dist = formatDistance(meters);
  const suffix = getScrolledTodaySuffix();
  const numSpan = el.querySelector('.yt-control-distance-num');
  const suffixSpan = el.querySelector('.yt-control-distance-suffix');
  if (numSpan && suffixSpan) {
    if (numSpan.textContent !== dist) numSpan.textContent = dist;
    if (suffixSpan.textContent !== ` ${suffix}`) suffixSpan.textContent = ` ${suffix}`;
  } else {
    el.innerHTML = `<span class="yt-control-distance-num">${dist}</span><span class="yt-control-distance-suffix"> ${suffix}</span>`;
  }
}

export function requestHeaderUpdate() {
  if (rafUpdateScheduled || typeof window === 'undefined') return;
  rafUpdateScheduled = true;
  window.requestAnimationFrame(() => {
    rafUpdateScheduled = false;
    updateHeaderOverlay(currentTodayMeters + pendingDeltaMeters);
  });
}

export function removeHeaderOverlay() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('yt-control-distance-header');
  if (el) {
    el.remove();
  }
}

function isWatchPageCommentScroll() {
  if (typeof window === 'undefined' || !window.location || window.location.pathname !== '/watch') {
    return false;
  }
  const commentsEl = document.getElementById('comments') || document.querySelector('ytd-comments');
  if (!commentsEl) return false;

  const rect = commentsEl.getBoundingClientRect();
  // If the top of the comments section is in the top 60% of the screen, user is viewing comments
  if (rect.top < window.innerHeight * 0.6) {
    return true;
  }
  return false;
}

function onAnyScroll(e) {
  if (!isTrackingEnabled) return;

  // Restrict tracking strictly to allowed feeds and watch page
  if (!isAllowedTrackingPage()) return;

  const target = e.target;
  if (!target) return;

  // Ignore scrolling inside comments or reply boxes
  if (target instanceof Element && target.closest && target.closest('#comments, ytd-comments, #comment, ytd-comment-view-model, [target-id="comments-section"]')) {
    return;
  }

  const isDoc = (target === document || target === window || target === document.documentElement || target === document.body);

  // On watch pages, do not track window scrolling once user scrolls down into comments
  if (isDoc && isWatchPageCommentScroll()) {
    return;
  }

  let currentY = 0;
  let lastY = 0;

  if (isDoc) {
    currentY = window.scrollY || window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
    lastY = lastWindowScrollY;
  } else if (target instanceof Element) {
    currentY = target.scrollTop || 0;
    lastY = lastScrollMap.get(target) || 0;
  } else {
    return;
  }

  const diff = currentY - lastY;

  // Downward exploration only; accumulate micro-movements to avoid losing slow trackpad scrolling
  if (diff > 0) {
    jitterAccumulator += diff;
    if (jitterAccumulator >= MIN_JITTER_THRESHOLD) {
      pendingDeltaMeters += calculateMeters(jitterAccumulator);
      jitterAccumulator = 0;
      requestHeaderUpdate();
      scheduleFlush();
    }
  } else if (diff < -MIN_JITTER_THRESHOLD) {
    // Meaningful upward scroll; clear forward jitter accumulation
    jitterAccumulator = 0;
  }

  if (isDoc) {
    lastWindowScrollY = currentY;
  } else {
    lastScrollMap.set(target, currentY);
  }
}

export function flushDistance() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (pendingDeltaMeters <= 0) return;

  const deltaToFlush = pendingDeltaMeters;
  pendingDeltaMeters = 0;

  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    return;
  }

  try {
    const today = getTodayDateString();
    chrome.storage.local.get(['scrollDate', 'scrollMetersToday', 'scrollMetersAllTime'], (res) => {
      if (chrome.runtime.lastError) return;

      const stats = parseStoredDistance(res, today);
      let todayMeters = stats.todayMeters + deltaToFlush;
      let allTimeMeters = stats.allTimeMeters + deltaToFlush;
      currentTodayMeters = todayMeters;

      chrome.storage.local.set({
        scrollDate: today,
        scrollMetersToday: Math.round(todayMeters * 100) / 100,
        scrollMetersAllTime: Math.round(allTimeMeters * 100) / 100
      });

      if (isTrackingEnabled) {
        requestHeaderUpdate();
      }
    });
  } catch (e) {
    // Non-fatal extension context invalidation safeguard
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushDistance();
  }, 2000);
}

export function rebindScrollTargets() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Re-synchronize baseline coordinates so first scroll on navigation doesn't jump
  lastWindowScrollY = window.scrollY || window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
  jitterAccumulator = 0;

  const watchFlexy = document.querySelector('ytd-watch-flexy:not([hidden])');
  if (watchFlexy) {
    const secondary = watchFlexy.querySelector('#secondary') || watchFlexy.querySelector('#secondary-inner');
    if (secondary) {
      lastScrollMap.set(secondary, secondary.scrollTop || 0);
    }
  }

  if (isTrackingEnabled) {
    requestHeaderUpdate();
  }
}

export function initScrollTracker(settings = {}) {
  if (typeof window === 'undefined') return;

  isTrackingEnabled = !!settings.trackScrollDistance;

  // Load today's stored meters so header displays instantly on load
  getDistanceStats(({ todayMeters }) => {
    currentTodayMeters = todayMeters;
    if (isTrackingEnabled) {
      requestHeaderUpdate();
    }
  });

  // Schedule automatic midnight rollover check
  scheduleMidnightCheck();

  if (!boundScroll) {
    // Capture phase intercepts scrolling on any document/element container (feeds, sidebar, columns)
    window.addEventListener('scroll', onAnyScroll, { capture: true, passive: true });
    boundScroll = true;

    // Flush immediately when tab is hidden or closed to prevent lost meters
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flushDistance();
    });
    window.addEventListener('pagehide', flushDistance);
    window.addEventListener('beforeunload', flushDistance);
  }

  rebindScrollTargets();
}

export function updateScrollTrackerSettings(settings = {}) {
  const newEnabled = !!settings.trackScrollDistance;
  if (isTrackingEnabled !== newEnabled) {
    isTrackingEnabled = newEnabled;
    if (!isTrackingEnabled) {
      flushDistance();
      removeHeaderOverlay();
    } else {
      rebindScrollTargets();
      requestHeaderUpdate();
    }
  } else if (isTrackingEnabled) {
    requestHeaderUpdate();
  }
}
