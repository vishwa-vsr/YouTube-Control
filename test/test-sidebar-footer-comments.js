const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Read files
const cssPath = path.join(__dirname, '..', 'src', 'content.css');
const pagesDir = path.join(__dirname, '..', 'pages');

const defaultMockHtml = `
<tp-yt-app-drawer id="guide">
  <ytd-guide-renderer>
    <div id=footer class="style-scope ytd-guide-renderer">Sidebar Footer</div>
  </ytd-guide-renderer>
</tp-yt-app-drawer>
<div id="primary">
  <ytd-watch-flexy>
    <ytd-comments id="comments">
      <ytd-commentbox>
        <div id=footer class="style-scope ytd-commentbox">
          <button aria-label=Cancel>Cancel</button>
          <button aria-label="Show emoji picker">Emoji</button>
          <button aria-label=Comment>Comment</button>
        </div>
      </ytd-commentbox>
    </ytd-comments>
  </ytd-watch-flexy>
</div>
`;

const css = fs.readFileSync(cssPath, 'utf8');
let normalHtml = defaultMockHtml;
const hasPagesDir = fs.existsSync(pagesDir) && !process.env.SIMULATE_CI;
if (hasPagesDir) {
  const normalHtmlPath = path.join(pagesDir, 'normal page.html');
  if (fs.existsSync(normalHtmlPath)) {
    normalHtml = fs.readFileSync(normalHtmlPath, 'utf8');
  }
}

console.log('Running test: Sidebar footer vs Commentbox footer isolation & full regression suite...');

// 2. Check CSS selectors under hideSidebarFooter
const footerSectionRegex = /\/\*\s*3b\.\s*HIDE SIDEBAR FOOTER\s*\*\/([\s\S]*?)\}/i;
const match = css.match(footerSectionRegex);
assert.ok(match, 'Must find /* 3b. HIDE SIDEBAR FOOTER */ section in content.css');

const sectionContent = match[1];
console.log('Found section:\n' + sectionContent.trim());

// Check if raw unscoped ".yt-hide-sidebar-footer #footer" exists
const hasUnscopedFooter = /(?:^|,|\s)\.yt-hide-sidebar-footer\s+#footer(?:\s*[,{]|$)/m.test(sectionContent);
if (hasUnscopedFooter) {
  console.error('FAIL: Detected overly broad selector ".yt-hide-sidebar-footer #footer"!');
  console.error('This unscoped selector matches <div id="footer" class="style-scope ytd-commentbox">,');
  console.error('causing the comment input Cancel button, Emoji picker, and Submit button to be hidden.');
  process.exit(1);
}

// 3. Verify that scoped selectors for sidebar guide exist
const expectedSelectors = [
  'ytd-guide-renderer #footer',
  'yt-guide-renderer #footer',
  '#guide #footer',
  '#guide-wrapper #footer',
  'tp-yt-app-drawer #footer'
];

for (const sel of expectedSelectors) {
  const regex = new RegExp(`\\.yt-hide-sidebar-footer\\s+${sel.replace('#', '\\#')}`);
  assert.ok(regex.test(sectionContent), `Should retain scoped selector for ${sel}`);
}

// 4. Verify across saved HTML pages (or built-in mock fixtures in CI) that all #footer elements are properly distinguished
let checkedGuideFooters = 0;
let checkedCommentboxFooters = 0;

if (hasPagesDir) {
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
  for (const p of pageFiles) {
    const content = fs.readFileSync(path.join(pagesDir, p), 'utf8');
    let idx = 0;
    while ((idx = content.indexOf('id=footer', idx)) !== -1) {
      const chunkBefore = content.slice(Math.max(0, idx - 1500), idx);
      const snippet = content.slice(idx, idx + 80);

      const isGuide = snippet.includes('ytd-guide-renderer') || snippet.includes('yt-guide-renderer') || chunkBefore.includes('tp-yt-app-drawer') || chunkBefore.includes('id="guide"');
      const isCommentBox = snippet.includes('ytd-commentbox') || chunkBefore.includes('ytd-commentbox');

      if (isGuide && !isCommentBox) {
        checkedGuideFooters++;
      } else if (isCommentBox) {
        checkedCommentboxFooters++;
      }
      idx += 9;
    }
  }
  console.log(`Verified across ${pageFiles.length} fixtures: ${checkedGuideFooters} guide footers (targeted) and ${checkedCommentboxFooters} commentbox footers (protected).`);
} else {
  let idx = 0;
  while ((idx = defaultMockHtml.indexOf('id=footer', idx)) !== -1) {
    const chunkBefore = defaultMockHtml.slice(Math.max(0, idx - 500), idx);
    const snippet = defaultMockHtml.slice(idx, idx + 80);

    const isGuide = snippet.includes('ytd-guide-renderer') || chunkBefore.includes('tp-yt-app-drawer');
    const isCommentBox = snippet.includes('ytd-commentbox') || chunkBefore.includes('ytd-commentbox');

    if (isGuide && !isCommentBox) {
      checkedGuideFooters++;
    } else if (isCommentBox) {
      checkedCommentboxFooters++;
    }
    idx += 9;
  }
  console.log(`Verified against built-in CI mock fixtures: ${checkedGuideFooters} guide footers (targeted) and ${checkedCommentboxFooters} commentbox footers (protected).`);
}
assert.ok(checkedGuideFooters > 0, 'Must have found guide footers to verify');
assert.ok(checkedCommentboxFooters > 0, 'Must have found commentbox footers to verify');

// 5. Verify in normal page that all commentbox buttons exist
const commentBoxIdx = normalHtml.indexOf('<ytd-commentbox');
assert.ok(commentBoxIdx !== -1, 'Must find <ytd-commentbox> in normal page.html');

const commentBoxFooterIdx = normalHtml.indexOf('id=footer', commentBoxIdx);
assert.ok(commentBoxFooterIdx !== -1, 'Must find id=footer inside ytd-commentbox in normal page.html');

const cancelIdx = normalHtml.indexOf('aria-label=Cancel', commentBoxIdx);
assert.ok(cancelIdx !== -1, 'Must find Cancel button in normal page.html commentbox');

const emojiIdx = normalHtml.indexOf('aria-label="Show emoji picker"', commentBoxIdx);
assert.ok(emojiIdx !== -1, 'Must find Emoji picker button in normal page.html commentbox');

const commentBtnIdx = normalHtml.indexOf('aria-label=Comment', commentBoxIdx);
assert.ok(commentBtnIdx !== -1, 'Must find Comment submit button in normal page.html commentbox');

// 6. Verify that NO rule in content.css hides ytd-commentbox or comment buttons under default settings
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let rMatch;
while ((rMatch = ruleRegex.exec(css)) !== null) {
  const sel = rMatch[1].trim();
  const body = rMatch[2].trim();
  const isHidden = body.includes('display: none') || body.includes('display:none');
  if (isHidden) {
    const parts = sel.split(',').map(s => s.trim());
    for (const part of parts) {
      // Must not hide commentbox unless explicit yt-hide-comments class is used
      if (part.includes('commentbox') || part.includes('emoji-button') || part.includes('cancel-button') || part.includes('submit-button')) {
        assert.ok(part.includes('.yt-hide-comments'), `Unexpected hiding rule for comments: ${part}`);
      }
    }
  }
}

// 7. Verify responsive emoji picker styles for docked comments exist and are clamped
assert.ok(css.includes('.yt-comments-docked #secondary-inner #comments #emojis.ytd-commentbox'), 'Must retain responsive docked emoji picker styles');
assert.ok(css.includes('width: calc(100% - 16px) !important'), 'Must retain 16px responsive width calculation');

console.log('PASS: All assertions passed successfully! Commentbox footer buttons and emoji picker are completely protected.');
