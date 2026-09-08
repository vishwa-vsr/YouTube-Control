/**
 * YouTube Control - Internationalization (i18n) Module
 * Automatically translates HTML elements with data-i18n attributes using chrome.i18n.getMessage.
 * Falls back gracefully to existing English text if a message is missing or chrome.i18n is unavailable.
 */

export function initI18n(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return;
  const i18nApi = (typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function')
    ? chrome.i18n
    : (typeof browser !== 'undefined' && browser.i18n && typeof browser.i18n.getMessage === 'function')
      ? browser.i18n
      : null;
  if (!i18nApi) return;

  // 1. Text content: data-i18n
  const textElements = doc.querySelectorAll('[data-i18n]');
  textElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    try {
      const msg = i18nApi.getMessage(key);
      if (msg && typeof msg === 'string' && msg.trim().length > 0) {
        el.textContent = msg;
        if (el.tagName === 'TITLE' && typeof doc.title !== 'undefined') {
          doc.title = msg;
        }
      }
    } catch {
      // Smooth fallback to existing text
    }
  });

  // 2. Title attribute (tooltips): data-i18n-title
  const titleElements = doc.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    try {
      const msg = i18nApi.getMessage(key);
      if (msg && typeof msg === 'string' && msg.trim().length > 0) {
        el.setAttribute('title', msg);
      }
    } catch {
      // Smooth fallback
    }
  });

  // 3. Aria-label attribute (accessibility): data-i18n-aria-label
  const ariaElements = doc.querySelectorAll('[data-i18n-aria-label]');
  ariaElements.forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (!key) return;
    try {
      const msg = i18nApi.getMessage(key);
      if (msg && typeof msg === 'string' && msg.trim().length > 0) {
        el.setAttribute('aria-label', msg);
      }
    } catch {
      // Smooth fallback
    }
  });
}
