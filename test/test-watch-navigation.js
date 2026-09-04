const assert = require('assert');
const path = require('path');

console.log('Running test: Watch Navigation unit tests...');

async function runTests() {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', 'watch-navigation.js');
  const fileUrl = 'file:///' + modulePath.replace(/\\/g, '/');
  const navMod = await import(fileUrl);

  // 1. Verify exports
  const expectedExports = [
    'getVideoId',
    'resetPaneScrolls',
    'robustResetPaneScrolls',
    'cancelScrollResetTimers',
    'initWatchNavigation'
  ];
  for (const exp of expectedExports) {
    assert.strictEqual(typeof navMod[exp], 'function', `Must export ${exp} as a function`);
  }

  // 2. Test getVideoId URL parsing
  assert.strictEqual(navMod.getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.strictEqual(navMod.getVideoId('https://www.youtube.com/watch?v=abc&t=42s'), 'abc');
  assert.strictEqual(navMod.getVideoId('https://www.youtube.com/shorts/shortsId123'), 'shortsId123');
  assert.strictEqual(navMod.getVideoId('https://www.youtube.com/live/liveStreamId'), 'liveStreamId');
  assert.strictEqual(navMod.getVideoId('https://youtu.be/shortUrlId12'), 'shortUrlId12');
  assert.strictEqual(navMod.getVideoId('/watch?v=relativeVideoId'), 'relativeVideoId');
  assert.strictEqual(navMod.getVideoId('https://www.youtube.com/'), null);
  assert.strictEqual(navMod.getVideoId(null), null);
  assert.strictEqual(navMod.getVideoId(''), null);

  // 3. Test initWatchNavigation lifecycle
  const events = [];
  global.window = {
    location: {
      href: 'https://www.youtube.com/watch?v=video1',
      origin: 'https://www.youtube.com'
    },
    addEventListener: () => {},
    requestAnimationFrame: (fn) => fn()
  };
  global.document = {
    querySelector: () => null,
    addEventListener: () => {}
  };

  const navInstance = navMod.initWatchNavigation({
    isTopWindow: true,
    onVideoChange: (newId, oldId) => {
      events.push({ type: 'videoChange', newId, oldId });
    }
  });

  assert.strictEqual(navInstance.getCurrentVideoId(), 'video1');

  // Change to video2
  const changed = navInstance.handleVideoChange('https://www.youtube.com/watch?v=video2');
  assert.strictEqual(changed, true);
  assert.strictEqual(navInstance.getCurrentVideoId(), 'video2');
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].newId, 'video2');
  assert.strictEqual(events[0].oldId, 'video1');

  // Same video navigation should NOT trigger change
  const changedAgain = navInstance.handleVideoChange('https://www.youtube.com/watch?v=video2');
  assert.strictEqual(changedAgain, false);
  assert.strictEqual(events.length, 1);

  // 4. Test YouTube DOM event integration (click -> yt-navigate-start -> yt-navigate-finish)
  let clickListener, navStartListener, navFinishListener;
  global.window = {
    location: {
      href: 'https://www.youtube.com/watch?v=videoA',
      origin: 'https://www.youtube.com'
    },
    addEventListener: (evt, fn) => {
      if (evt === 'yt-navigate-start') navStartListener = fn;
      if (evt === 'yt-navigate-finish') navFinishListener = fn;
    },
    requestAnimationFrame: (fn) => fn()
  };

  const mockSecondary = { contains: () => true };
  global.document = {
    querySelector: (sel) => {
      if (sel.includes('#secondary')) return mockSecondary;
      return null;
    },
    addEventListener: (evt, fn) => {
      if (evt === 'click') clickListener = fn;
    }
  };

  const startLog = [];
  const finishLog = [];
  navMod.initWatchNavigation({
    isTopWindow: true,
    onNavigateStart: (data) => startLog.push(data),
    onNavigateFinish: (data) => finishLog.push(data)
  });

  // Step 4a: User clicks sidebar link to videoB
  const mockLink = { href: 'https://www.youtube.com/watch?v=videoB' };
  const mockClickEvent = {
    button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: {
      closest: (sel) => {
        if (sel.includes('chapter')) return null;
        if (sel.includes('watch?v=')) return mockLink;
        return null;
      }
    }
  };
  clickListener(mockClickEvent);

  // Step 4b: YouTube fires yt-navigate-start
  navStartListener({ detail: { url: 'https://www.youtube.com/watch?v=videoB' } });
  assert.strictEqual(startLog.length, 1);
  assert.strictEqual(startLog[0].isDifferentVideo, true, 'isDifferentVideo must be TRUE on navigate-start after sidebar click');
  assert.strictEqual(startLog[0].videoId, 'videoB');

  // Step 4c: YouTube fires yt-navigate-finish
  navFinishListener({
    detail: {
      response: {
        endpoint: {
          commandMetadata: {
            webCommandMetadata: { url: 'https://www.youtube.com/watch?v=videoB' }
          }
        }
      }
    }
  });
  assert.strictEqual(finishLog.length, 1);
  assert.strictEqual(finishLog[0].isDifferent, true, 'isDifferent must be TRUE on navigate-finish after sidebar navigation');
  assert.strictEqual(finishLog[0].videoId, 'videoB');

  // Step 4d: In-page navigation without video change (e.g. chapters or hash change)
  navStartListener({ detail: { url: 'https://www.youtube.com/watch?v=videoB&t=30s' } });
  assert.strictEqual(startLog.length, 2);
  assert.strictEqual(startLog[1].isDifferentVideo, false, 'Same video must NOT be marked different on navigate-start');

  navFinishListener({
    detail: {
      response: {
        endpoint: {
          commandMetadata: {
            webCommandMetadata: { url: 'https://www.youtube.com/watch?v=videoB&t=30s' }
          }
        }
      }
    }
  });
  assert.strictEqual(finishLog.length, 2);
  assert.strictEqual(finishLog[1].isDifferent, false, 'Same video must NOT be marked different on navigate-finish');

  console.log('PASS: All watch navigation assertions passed successfully!');
}

runTests().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
