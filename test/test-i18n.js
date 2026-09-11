const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Running test: i18n & Localization unit tests...');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const LOCALES_DIR = path.join(SRC_DIR, '_locales');

// 1. Verify manifest.json configuration
const manifestPath = path.join(SRC_DIR, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.strictEqual(manifest.default_locale, 'en', 'manifest.json must specify "default_locale": "en"');
assert.strictEqual(manifest.name, '__MSG_appName__', 'manifest.json name must use "__MSG_appName__"');
assert.strictEqual(manifest.description, '__MSG_appDesc__', 'manifest.json description must use "__MSG_appDesc__"');
console.log('PASS: manifest.json i18n configuration is valid.');

// 2. Verify all 8 target locales exist
const TARGET_LOCALES = ['en', 'ja', 'pt_BR', 'es', 'de', 'fr', 'ko', 'ru'];
for (const loc of TARGET_LOCALES) {
  const locDir = path.join(LOCALES_DIR, loc);
  const locFile = path.join(locDir, 'messages.json');
  assert.ok(fs.existsSync(locDir), `Locale directory missing: ${loc}`);
  assert.ok(fs.existsSync(locFile), `messages.json missing for locale: ${loc}`);
}
console.log(`PASS: All ${TARGET_LOCALES.length} target locale directories and messages.json files exist.`);

// 3. Verify key naming compliance & key parity across all 8 locales
const enMessages = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en', 'messages.json'), 'utf8'));
const enKeys = Object.keys(enMessages).sort();
assert.ok(enKeys.length >= 65, `Expected at least 65 keys in en, got ${enKeys.length}`);

for (const loc of TARGET_LOCALES) {
  const locMessages = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, loc, 'messages.json'), 'utf8'));
  const locKeys = Object.keys(locMessages).sort();

  assert.strictEqual(
    locKeys.length,
    enKeys.length,
    `Locale ${loc} key count mismatch: expected ${enKeys.length}, got ${locKeys.length}`
  );

  for (const k of enKeys) {
    // Chrome Web Store i18n key requirement: only alphanumeric characters and underscores
    assert.ok(
      /^[a-zA-Z0-9_]+$/.test(k),
      `Invalid Chrome i18n key name "${k}" in locale "${loc}". Keys must only contain letters, numbers, and underscores.`
    );
    assert.ok(locMessages[k], `Missing key "${k}" in locale "${loc}"`);
    assert.ok(
      typeof locMessages[k].message === 'string' && locMessages[k].message.trim().length > 0,
      `Message for key "${k}" in locale "${loc}" must be a non-empty string`
    );
  }
}
console.log(`PASS: Key parity & Chrome naming compliance verified across all ${TARGET_LOCALES.length} locales (${enKeys.length} keys each).`);

// 4. Verify popup.html attributes match messages.json keys with 100% two-way parity
const htmlPath = path.join(SRC_DIR, 'popup.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const i18nMatches = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
const i18nTitleMatches = [...html.matchAll(/data-i18n-title="([^"]+)"/g)].map(m => m[1]);
const i18nAriaMatches = [...html.matchAll(/data-i18n-aria-label="([^"]+)"/g)].map(m => m[1]);

const allHtmlKeys = new Set([...i18nMatches, ...i18nTitleMatches, ...i18nAriaMatches]);

for (const k of allHtmlKeys) {
  assert.ok(
    enMessages[k],
    `popup.html references data-i18n key "${k}" which does not exist in messages.json`
  );
}

// Ensure every key in messages.json is actively used (manifest.json, popup.html, or content scripts)
const nonHtmlKeys = new Set(['appName', 'appDesc', 'scrolledToday']);
const unreferencedKeys = enKeys.filter(k => !nonHtmlKeys.has(k) && !allHtmlKeys.has(k));
assert.strictEqual(
  unreferencedKeys.length,
  0,
  `Found orphaned/unreferenced keys in messages.json: ${unreferencedKeys.join(', ')}`
);

console.log(`PASS: All ${allHtmlKeys.size} HTML keys match messages.json with 0 orphaned keys (100% two-way coverage).`);

// 5. Verify CSS rules for layout, dimensions & responsive flex wrapping
const cssPath = path.join(SRC_DIR, 'popup.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert.ok(/width:\s*400px;/.test(css), 'popup.css body width must be 400px');
assert.ok(/word-break:\s*break-word;/.test(css), 'popup.css must specify word-break: break-word');
assert.ok(/--font-display:\s*'Outfit'/.test(css), 'popup.css must preserve Outfit font pairing');
assert.ok(/--font-body:\s*'Plus Jakarta Sans'/.test(css), 'popup.css must preserve Plus Jakarta Sans font pairing');
assert.ok(/\.toggle-control[\s\S]*?flex-shrink:\s*0;/.test(css), '.toggle-control must have flex-shrink: 0');
assert.ok(/\.header-actions[\s\S]*?flex-shrink:\s*0;/.test(css), '.header-actions must have flex-shrink: 0');
assert.ok(/\.tab-btn[\s\S]*?white-space:\s*nowrap;/.test(css), '.tab-btn must have white-space: nowrap');
assert.ok(/\.footer-action-btn[\s\S]*?white-space:\s*nowrap;/.test(css), '.footer-action-btn must have white-space: nowrap');
console.log('PASS: popup.css layout, 400px width, word-break, and typography verified.');

// 6. Verify initI18n runtime behavior with mock DOM across ALL 8 locales
async function testRuntimeI18n() {
  const { JSDOM } = (() => {
    try {
      return require('jsdom');
    } catch {
      return {
        JSDOM: class {
          constructor(content) {
            const elements = [];
            const tagRegex = /<([a-z0-9]+)\b([^>]*\bdata-i18n[^>]*)>(?:([^<]*))?/gi;
            let m;
            while ((m = tagRegex.exec(content)) !== null) {
              const tag = m[1];
              const attrsStr = m[2];
              let innerText = (m[3] || '').trim();

              const attrs = {};
              const attrRegex = /([a-z0-9_-]+)(?:="([^"]*)")?/gi;
              let am;
              while ((am = attrRegex.exec(attrsStr)) !== null) {
                attrs[am[1].toLowerCase()] = am[2] !== undefined ? am[2] : '';
              }

              elements.push({
                tagName: tag.toUpperCase(),
                tag,
                getAttribute: (a) => attrs[a.toLowerCase()] ?? null,
                setAttribute: (a, v) => { attrs[a.toLowerCase()] = v; },
                get textContent() { return innerText; },
                set textContent(v) { innerText = v; }
              });
            }

            this.window = {
              document: {
                title: '',
                querySelectorAll: (selector) => {
                  if (selector === '[data-i18n]') {
                    return elements.filter(e => e.getAttribute('data-i18n') !== null);
                  }
                  if (selector === '[data-i18n-title]') {
                    return elements.filter(e => e.getAttribute('data-i18n-title') !== null);
                  }
                  if (selector === '[data-i18n-aria-label]') {
                    return elements.filter(e => e.getAttribute('data-i18n-aria-label') !== null);
                  }
                  const valMatch = selector.match(/\[([a-z0-9\-_]+)="([^"]+)"\]/i);
                  if (valMatch) {
                    return elements.filter(e => e.getAttribute(valMatch[1]) === valMatch[2]);
                  }
                  return [];
                }
              }
            };
          }
        }
      };
    }
  })();

  const i18nModulePath = path.join(SRC_DIR, 'modules', 'i18n.js');
  const fileUrl = 'file:///' + i18nModulePath.replace(/\\/g, '/');
  const { initI18n } = await import(fileUrl);

  // Test all 8 locales dynamically at runtime
  for (const loc of TARGET_LOCALES) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const locMessages = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, loc, 'messages.json'), 'utf8'));

    global.document = doc;
    global.chrome = {
      i18n: {
        getMessage: (key) => locMessages[key]?.message || ''
      }
    };

    initI18n(doc);

    // Verify textContent translation
    const feedsEl = doc.querySelectorAll('[data-i18n="tabFeeds"]')[0];
    assert.ok(feedsEl, `data-i18n="tabFeeds" element must be found in locale ${loc}`);
    assert.strictEqual(feedsEl.textContent, locMessages.tabFeeds.message, `tabFeeds translation mismatch for locale ${loc}`);

    // Verify appTitle on header span
    const titleEl = doc.querySelectorAll('[data-i18n="appTitle"]')[0];
    assert.ok(titleEl, `data-i18n="appTitle" element must be found in locale ${loc}`);
    assert.strictEqual(titleEl.textContent, locMessages.appTitle.message, `appTitle translation mismatch for locale ${loc}`);

    // Verify data-i18n-title (tooltip)
    const githubBtn = doc.querySelectorAll('[data-i18n-title="headerGithubTitle"]')[0];
    assert.ok(githubBtn, `data-i18n-title="headerGithubTitle" element must be found in locale ${loc}`);
    assert.strictEqual(githubBtn.getAttribute('title'), locMessages.headerGithubTitle.message, `headerGithubTitle tooltip mismatch for locale ${loc}`);

    // Verify data-i18n-aria-label
    const speedAria1 = doc.querySelectorAll('[data-i18n-aria-label="speedAria1"]')[0];
    assert.ok(speedAria1, `data-i18n-aria-label="speedAria1" element must be found in locale ${loc}`);
    assert.strictEqual(speedAria1.getAttribute('aria-label'), locMessages.speedAria1.message, `speedAria1 aria-label mismatch for locale ${loc}`);
  }

  // Check fallback when key is not found
  const mockMissingEl = {
    getAttribute: (a) => a === 'data-i18n' ? 'nonExistentKey' : null,
    textContent: 'Original English'
  };
  global.document = {
    querySelectorAll: (s) => s === '[data-i18n]' ? [mockMissingEl] : []
  };
  global.chrome = {
    i18n: {
      getMessage: () => ''
    }
  };
  initI18n();
  assert.strictEqual(mockMissingEl.textContent, 'Original English', 'Unknown key must fall back to original text');

  // Check graceful fallback when chrome/browser is undefined
  delete global.chrome;
  delete global.browser;
  const mockFallbackEl = {
    getAttribute: (a) => a === 'data-i18n' ? 'tabFeeds' : null,
    textContent: 'Original English'
  };
  global.document = {
    querySelectorAll: (s) => s === '[data-i18n]' ? [mockFallbackEl] : []
  };
  initI18n();
  assert.strictEqual(mockFallbackEl.textContent, 'Original English', 'Missing chrome.i18n must gracefully leave original text unchanged');

  console.log(`PASS: initI18n runtime translation verified across all ${TARGET_LOCALES.length} locales with tooltips, aria-labels, and fallbacks.`);
}

testRuntimeI18n().then(() => {
  console.log('ALL i18n tests passed successfully!');
}).catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
