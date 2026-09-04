/**
 * YouTube Control - Speed Controller Module
 * Manages video playback rate cycling, video event listeners,
 * player UI speed badge, and persistent rate storage without feedback loops.
 */

let isInternalSpeedUpdate = false;
let currentSettings = {};

export function getActiveVideoElement() {
  return document.querySelector('#movie_player video.html5-main-video') || 
         document.querySelector('.html5-main-video') || 
         document.querySelector('video');
}

export function formatSpeedText(rate) {
  if (typeof rate !== 'number' || isNaN(rate)) rate = 1.0;
  const rounded = parseFloat(rate.toFixed(2));
  return `${rounded}x`;
}

export function getEffectivePlaybackRate(settings) {
  const cfg = settings || currentSettings;
  const saved = parseFloat(cfg.persistentPlaybackRate);
  if (!isNaN(saved) && saved > 0) return saved;
  const speedA = parseFloat(cfg.speedValueA);
  if (!isNaN(speedA) && speedA > 0) return speedA;
  return 1.0;
}

export function updateSpeedButtonText(rate) {
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

export function enforcePersistedPlaybackRate(video) {
  if (currentSettings.showSpeedBtn !== true || currentSettings.extensionEnabled === false) return;
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

export function attachVideoRateListener(video) {
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
    if (currentSettings.showSpeedBtn !== true || currentSettings.extensionEnabled === false) return;
    
    // If the user changed the rate manually via YouTube menu or keyboard shortcuts during playback
    if (video.readyState >= 1) {
      const newRate = Math.round(video.playbackRate * 100) / 100;
      currentSettings.persistentPlaybackRate = newRate;
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ persistentPlaybackRate: newRate });
        }
      } catch (e) {}
      updateSpeedButtonText(newRate);
    }
  });
}

export function cycleSpeed() {
  const video = getActiveVideoElement();
  if (!video) return;

  const speedA = parseFloat(currentSettings.speedValueA) || 1.0;
  const speedB = parseFloat(currentSettings.speedValueB) || 1.5;
  const speedC = parseFloat(currentSettings.speedValueC) || 2.0;
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

  currentSettings.persistentPlaybackRate = targetSpeed;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ persistentPlaybackRate: targetSpeed });
    }
  } catch (e) {}

  updateSpeedButtonText(targetSpeed);
}

export function injectSpeedButton() {
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
    cycleSpeed();
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

export function removeSpeedButton() {
  const btn = document.querySelector('.ytp-speed-button');
  if (btn) btn.remove();
}

export function initSpeedController(settings) {
  currentSettings = settings || {};
  if (currentSettings.showSpeedBtn === true) {
    injectSpeedButton();
  }
}

export function onSettingsUpdate(newSettings) {
  currentSettings = newSettings || {};
  if (currentSettings.showSpeedBtn === true) {
    injectSpeedButton();
  } else {
    removeSpeedButton();
  }
}
