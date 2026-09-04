const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Running test: Scrolling performance & hardware hints verification...');

const cssPath = path.join(__dirname, '..', 'src', 'content.css');
const css = fs.readFileSync(cssPath, 'utf8');

// 1. Verify that transform: translateZ(0) is NOT present on layout columns
const hasTranslateZ = /#columns[\s\S]*?translateZ\(0\)/i.test(css) ||
                      /#primary[\s\S]*?translateZ\(0\)/i.test(css) ||
                      /#secondary[\s\S]*?translateZ\(0\)/i.test(css);
assert.strictEqual(hasTranslateZ, false, 'CRITICAL: transform: translateZ(0) must NEVER be applied to columns or primary/secondary (causes Theater Max black screen)');

// 2. Verify that scroll-behavior: smooth is NOT applied to mouse wheel scrollers
const primaryMatch = css.match(/\.yt-sticky-player[\s\S]*?#columns\s+#primary\s*\{([^}]+)\}/);
assert.ok(primaryMatch, 'Must find sticky player #columns #primary rule in content.css');
assert.strictEqual(primaryMatch[1].includes('scroll-behavior: smooth'), false, 'scroll-behavior: smooth must NOT be applied to #primary (causes artificial sluggish mouse wheel lag)');

const secondaryMatch = css.match(/\.yt-sticky-player[\s\S]*?#columns\s+#secondary\s*\{([^}]+)\}/);
assert.ok(secondaryMatch, 'Must find sticky player #columns #secondary rule in content.css');
assert.strictEqual(secondaryMatch[1].includes('scroll-behavior: smooth'), false, 'scroll-behavior: smooth must NOT be applied to #secondary (causes artificial sluggish mouse wheel lag)');

// 3. Verify hardware scrolling hints on #primary
assert.ok(primaryMatch[1].includes('overscroll-behavior-y: contain'), '#primary must have overscroll-behavior-y: contain to eliminate scroll-chaining lag');
assert.ok(primaryMatch[1].includes('will-change: scroll-position'), '#primary must have will-change: scroll-position to ensure dedicated composited scrolling');

// 4. Verify hardware scrolling hints on #secondary
assert.ok(secondaryMatch[1].includes('overscroll-behavior-y: contain'), '#secondary must have overscroll-behavior-y: contain to eliminate scroll-chaining lag');
assert.ok(secondaryMatch[1].includes('will-change: scroll-position'), '#secondary must have will-change: scroll-position to ensure dedicated composited scrolling');

// 5. Verify hardware scrolling hints on docked comments #sections
const dockedCommentsSections = css.match(/\.yt-comments-docked\s+#secondary-inner\s+#comments\s+#sections\s*\{([^}]+)\}/);
assert.ok(dockedCommentsSections, 'Must find docked comments #sections rule in content.css');
assert.ok(dockedCommentsSections[1].includes('overscroll-behavior-y: contain'), 'Docked comments #sections must have overscroll-behavior-y: contain');
assert.ok(dockedCommentsSections[1].includes('will-change: scroll-position'), 'Docked comments #sections must have will-change: scroll-position');

console.log('PASS: All scrolling performance assertions passed successfully!');
