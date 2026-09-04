/**
 * YouTube Control - Watch Navigation & Dual-Scroll Coordinator
 * Manages YouTube SPA transitions, Polymer navigation hooks,
 * dual-scroll resets, and wheel/touch cancellation listeners.
 */

let scrollResetTimers = [];

export function cancelScrollResetTimers() {
  while (scrollResetTimers.length > 0) {
    clearTimeout(scrollResetTimers.pop());
  }
}

export function resetPaneScrolls() {
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

export function robustResetPaneScrolls() {
  cancelScrollResetTimers();
  resetPaneScrolls();
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(resetPaneScrolls);
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

export function getVideoId(urlOrStr) {
  if (!urlOrStr) return null;
  try {
    const origin = (typeof window !== 'undefined' && window.location) ? window.location.origin : 'https://www.youtube.com';
    const url = new URL(urlOrStr, origin);
    const v = url.searchParams.get('v');
    if (v) return v;
    if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2] || null;
    }
    if (url.pathname.startsWith('/live/')) {
      return url.pathname.split('/')[2] || null;
    }
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) {
      const id = url.pathname.slice(1).split('/')[0];
      if (id) return id;
    }
  } catch (e) {
    const match = String(urlOrStr).match(/[?&]v=([^&#]+)/);
    if (match) return match[1];
  }
  return null;
}

export function initWatchNavigation({
  isTopWindow = true,
  onVideoChange,
  onNavigateStart,
  onNavigateFinish,
  onPageUpdate,
  onPopState
} = {}) {
  if (typeof window === 'undefined') return;

  // Cancel delayed resets if the user starts scrolling manually with mouse wheel or touch
  window.addEventListener('wheel', cancelScrollResetTimers, { passive: true });
  window.addEventListener('touchmove', cancelScrollResetTimers, { passive: true });

  let currentActiveVideoId = getVideoId(window.location.href);
  let pendingNavigationDifferent = false;

  function handleVideoChange(destinationUrlOrId) {
    const targetId = destinationUrlOrId ? (getVideoId(destinationUrlOrId) || destinationUrlOrId) : getVideoId(window.location.href);
    if (targetId && targetId !== currentActiveVideoId) {
      const prevId = currentActiveVideoId;
      currentActiveVideoId = targetId;
      robustResetPaneScrolls();
      if (onVideoChange) {
        onVideoChange(targetId, prevId);
      }
      return true;
    } else if (!targetId && currentActiveVideoId) {
      const prevId = currentActiveVideoId;
      currentActiveVideoId = null;
      if (onVideoChange) {
        onVideoChange(null, prevId);
      }
      return true;
    }
    return false;
  }

  if (isTopWindow) {
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
        const targetId = getVideoId(link.href);
        if (targetId && targetId !== currentActiveVideoId) {
          pendingNavigationDifferent = true;
          robustResetPaneScrolls();
        }
      }
    }, true);

    // Re-apply settings and reset scroll positions ONLY when navigating to a different video
    window.addEventListener('yt-navigate-finish', (e) => {
      const nextUrl = (e && e.detail && e.detail.response && e.detail.response.endpoint && e.detail.response.endpoint.commandMetadata && e.detail.response.endpoint.commandMetadata.webCommandMetadata && e.detail.response.endpoint.commandMetadata.webCommandMetadata.url) || window.location.href;
      const targetId = getVideoId(nextUrl);
      const isDifferent = pendingNavigationDifferent || (targetId !== null && targetId !== currentActiveVideoId) || (targetId === null && currentActiveVideoId !== null);
      pendingNavigationDifferent = false;
      handleVideoChange(nextUrl);
      if (onNavigateFinish) {
        onNavigateFinish({ isDifferent, url: nextUrl, videoId: currentActiveVideoId });
      }
    });

    window.addEventListener('yt-navigate-start', (e) => {
      const nextUrl = (e && e.detail && e.detail.url) ? e.detail.url : window.location.href;
      const targetId = getVideoId(nextUrl);
      const isDifferentVideo = pendingNavigationDifferent || (targetId !== null && targetId !== currentActiveVideoId) || (targetId === null && currentActiveVideoId !== null);
      if (isDifferentVideo) {
        pendingNavigationDifferent = true;
      }
      handleVideoChange(nextUrl);
      if (onNavigateStart) {
        onNavigateStart({ isDifferentVideo, url: nextUrl, videoId: currentActiveVideoId });
      }
    });

    window.addEventListener('yt-page-data-updated', () => {
      const isDifferent = handleVideoChange(window.location.href);
      if (onPageUpdate) {
        onPageUpdate({ isDifferent, videoId: currentActiveVideoId });
      }
    });

    window.addEventListener('popstate', () => {
      const isDifferent = handleVideoChange(window.location.href);
      if (onPopState) {
        onPopState({ isDifferent, videoId: currentActiveVideoId });
      }
    });
  }

  return {
    getCurrentVideoId: () => currentActiveVideoId,
    handleVideoChange,
    robustResetPaneScrolls
  };
}
