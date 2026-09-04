const assert = require('assert');
const path = require('path');

console.log('Running test: Speed Controller unit tests...');

async function runTests() {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', 'speed-controller.js');
  const fileUrl = 'file:///' + modulePath.replace(/\\/g, '/');
  const speedMod = await import(fileUrl);

  // 1. Verify exports
  const expectedExports = [
    'getActiveVideoElement',
    'formatSpeedText',
    'getEffectivePlaybackRate',
    'updateSpeedButtonText',
    'enforcePersistedPlaybackRate',
    'attachVideoRateListener',
    'cycleSpeed',
    'injectSpeedButton',
    'removeSpeedButton',
    'initSpeedController',
    'onSettingsUpdate'
  ];
  for (const exp of expectedExports) {
    assert.strictEqual(typeof speedMod[exp], 'function', `Must export ${exp} as a function`);
  }

  // 2. Test formatSpeedText
  assert.strictEqual(speedMod.formatSpeedText(1.0), '1x');
  assert.strictEqual(speedMod.formatSpeedText(1.5), '1.5x');
  assert.strictEqual(speedMod.formatSpeedText(2), '2x');
  assert.strictEqual(speedMod.formatSpeedText(1.25), '1.25x');
  assert.strictEqual(speedMod.formatSpeedText(NaN), '1x');
  assert.strictEqual(speedMod.formatSpeedText(null), '1x');

  // 3. Test getEffectivePlaybackRate
  assert.strictEqual(speedMod.getEffectivePlaybackRate({}), 1.0);
  assert.strictEqual(speedMod.getEffectivePlaybackRate({ speedValueA: '1.25' }), 1.25);
  assert.strictEqual(speedMod.getEffectivePlaybackRate({ speedValueA: '1.25', persistentPlaybackRate: 1.75 }), 1.75);

  // 4. Test triplet cycle logic using mock video element
  const mockVideo = {
    playbackRate: 1.0,
    addEventListener: () => {}
  };
  global.document = {
    querySelector: (sel) => {
      if (sel.includes('video')) return mockVideo;
      return null;
    }
  };
  global.chrome = {
    storage: {
      local: {
        set: () => {}
      }
    }
  };

  speedMod.initSpeedController({
    showSpeedBtn: true,
    extensionEnabled: true,
    speedValueA: 1.0,
    speedValueB: 1.5,
    speedValueC: 2.0
  });

  // Start at 1.0 -> cycle to 1.5
  mockVideo.playbackRate = 1.0;
  speedMod.cycleSpeed();
  assert.strictEqual(mockVideo.playbackRate, 1.5, 'From 1.0x should cycle to 1.5x');

  // At 1.5 -> cycle to 2.0
  speedMod.cycleSpeed();
  assert.strictEqual(mockVideo.playbackRate, 2.0, 'From 1.5x should cycle to 2.0x');

  // At 2.0 -> cycle back to 1.0
  speedMod.cycleSpeed();
  assert.strictEqual(mockVideo.playbackRate, 1.0, 'From 2.0x should cycle back to 1.0x');

  // Off-preset jump: at 1.25x -> jumps to next higher preset (1.5x)
  mockVideo.playbackRate = 1.25;
  speedMod.cycleSpeed();
  assert.strictEqual(mockVideo.playbackRate, 1.5, 'From 1.25x off-preset should jump to next preset (1.5x)');

  // Off-preset above max: at 3.0x -> jumps back to preset A (1.0x)
  mockVideo.playbackRate = 3.0;
  speedMod.cycleSpeed();
  assert.strictEqual(mockVideo.playbackRate, 1.0, 'From 3.0x off-preset should jump back to preset A (1.0x)');

  console.log('PASS: All speed controller assertions passed successfully!');
}

runTests().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
