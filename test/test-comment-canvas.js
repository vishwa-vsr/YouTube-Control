const assert = require('assert');
const path = require('path');

console.log('Running test: Comment Canvas unit tests...');

// Note: comment-canvas.js is an ES module. We can import it dynamically in Node 24.
async function runTests() {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', 'comment-canvas.js');
  const fileUrl = 'file:///' + modulePath.replace(/\\/g, '/');
  const canvasMod = await import(fileUrl);

  // 1. Verify all exports exist and are functions
  const expectedExports = [
    'wrapCanvasText',
    'drawRoundedCard',
    'drawCommentThumbIcon',
    'drawCreatorHeartBadge',
    'loadAvatarImage',
    'extractSingleCommentData',
    'drawAvatarCircle',
    'setCommentCameraIcon',
    'setCommentCheckmarkIcon',
    'captureCommentToClipboard'
  ];

  for (const exp of expectedExports) {
    assert.strictEqual(typeof canvasMod[exp], 'function', `Must export ${exp} as a function`);
  }

  // 2. Unit test wrapCanvasText with mock canvas context
  const mockCtx = {
    measureText: (str) => ({ width: str.length * 10 }) // 10px per character
  };

  // Test empty text
  assert.deepStrictEqual(canvasMod.wrapCanvasText(mockCtx, '', 100), []);
  assert.deepStrictEqual(canvasMod.wrapCanvasText(mockCtx, null, 100), []);

  // Test short text (no wrap needed)
  const shortText = 'Hello world'; // 110px width > 100px? wait: 11 chars * 10 = 110px. If maxWidth = 200px:
  const shortRes = canvasMod.wrapCanvasText(mockCtx, shortText, 200);
  assert.strictEqual(shortRes.length, 1);
  assert.strictEqual(shortRes[0], 'Hello world');

  // Test long text (wraps properly)
  const longText = 'The quick brown fox jumps over the lazy dog';
  // maxWidth = 150px (allows ~15 chars per line)
  const longRes = canvasMod.wrapCanvasText(mockCtx, longText, 150);
  assert.ok(longRes.length > 1, `Expected multiple lines, got ${longRes.length}: ${JSON.stringify(longRes)}`);
  assert.strictEqual(longRes.join(' '), longText);

  // Test multi-paragraph text
  const multiParaText = 'First paragraph\n\nSecond paragraph';
  const multiRes = canvasMod.wrapCanvasText(mockCtx, multiParaText, 500);
  assert.strictEqual(multiRes.length, 3);
  assert.strictEqual(multiRes[0], 'First paragraph');
  assert.strictEqual(multiRes[1], '');
  assert.strictEqual(multiRes[2], 'Second paragraph');

  // 3. Test drawRoundedCard path construction
  const pathOps = [];
  const mockPathCtx = {
    beginPath: () => pathOps.push('beginPath'),
    moveTo: (x, y) => pathOps.push(`moveTo(${x},${y})`),
    lineTo: (x, y) => pathOps.push(`lineTo(${x},${y})`),
    quadraticCurveTo: (cpx, cpy, x, y) => pathOps.push(`quad(${cpx},${cpy},${x},${y})`),
    closePath: () => pathOps.push('closePath')
  };

  canvasMod.drawRoundedCard(mockPathCtx, 0, 0, 100, 100, 10);
  assert.strictEqual(pathOps[0], 'beginPath');
  assert.strictEqual(pathOps[pathOps.length - 1], 'closePath');
  assert.ok(pathOps.includes('moveTo(10,0)'));

  // 4. Test extractSingleCommentData with mock comment element
  const mockCommentEl = {
    querySelector: (sel) => {
      if (sel.includes('author-text')) return { textContent: ' TestAuthor ' };
      if (sel.includes('published-time')) return { textContent: ' 2 hours ago ' };
      if (sel.includes('content-text')) return { textContent: ' Great video! ', innerText: ' Great video! ' };
      if (sel.includes('vote-count')) return { textContent: ' 42 ' };
      if (sel.includes('author-thumbnail') || sel.includes('yt-img-shadow')) return { src: 'https://example.com/avatar.jpg' };
      return null;
    },
    closest: () => null
  };

  const data = canvasMod.extractSingleCommentData(mockCommentEl);
  assert.strictEqual(data.author, 'TestAuthor');
  assert.strictEqual(data.time, '2 hours ago');
  assert.strictEqual(data.text, 'Great video!');
  assert.strictEqual(data.likes, '42');
  assert.strictEqual(data.avatarSrc, 'https://example.com/avatar.jpg');

  // 5. Test captureCommentToClipboard parameter permutations & null handling
  const nullResult = await canvasMod.captureCommentToClipboard(null);
  assert.strictEqual(nullResult, false, 'Should return false when passed null element');

  const mockCreatedCanvas = {
    getContext: () => ({
      measureText: (str) => ({ width: str.length * 10 }),
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      translate: () => {},
      arc: () => {},
      clip: () => {},
      drawImage: () => {},
      fillText: () => {}
    }),
    toBlob: (cb) => cb({ size: 100 })
  };

  global.document = {
    createElement: (tag) => {
      if (tag === 'canvas') return mockCreatedCanvas;
      if (tag === 'a') return { click: () => {}, remove: () => {} };
      return {};
    },
    documentElement: { hasAttribute: () => false, classList: { contains: () => false } },
    body: { appendChild: () => {}, removeChild: () => {} }
  };
  global.URL = { createObjectURL: () => 'blob://mock', revokeObjectURL: () => {} };
  global.navigator = { clipboard: { write: async () => {} } };
  global.window = { ClipboardItem: class {} };
  global.Image = class {
    constructor() {
      setTimeout(() => { if (this.onload) this.onload(); }, 5);
    }
  };

  // Test single comment mode (isThreadMode = false)
  const singleResult = await canvasMod.captureCommentToClipboard(mockCommentEl, false);
  assert.strictEqual(singleResult, true, 'captureCommentToClipboard should succeed with isThreadMode = false');

  // Test with button element
  const mockBtn = { classList: { add: () => {}, remove: () => {} }, innerHTML: '', nodeType: 1 };
  const btnResult = await canvasMod.captureCommentToClipboard(mockCommentEl, mockBtn);
  assert.strictEqual(btnResult, true, 'captureCommentToClipboard should succeed with button element');

  // Test with options object { isThread: false, button: mockBtn }
  const optResult = await canvasMod.captureCommentToClipboard(mockCommentEl, { isThread: false, button: mockBtn });
  assert.strictEqual(optResult, true, 'captureCommentToClipboard should succeed with options object');

  // Test with 3 arguments (mockCommentEl, false, mockBtn)
  const threeArgResult = await canvasMod.captureCommentToClipboard(mockCommentEl, false, mockBtn);
  assert.strictEqual(threeArgResult, true, 'captureCommentToClipboard should succeed with 3 arguments');

  console.log('PASS: All comment canvas assertions passed successfully!');
}

runTests().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
