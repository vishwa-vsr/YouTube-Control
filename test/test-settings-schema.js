const assert = require('assert');
const path = require('path');

console.log('Running test: Settings Schema unit tests...');

async function runTests() {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', 'settings-schema.js');
  const fileUrl = 'file:///' + modulePath.replace(/\\/g, '/');
  const schema = await import(fileUrl);

  // 1. Verify exports
  assert.ok(Array.isArray(schema.CONFIG_KEYS), 'CONFIG_KEYS must be an array');
  assert.ok(Array.isArray(schema.DEFAULT_TRUE_KEYS), 'DEFAULT_TRUE_KEYS must be an array');
  assert.strictEqual(typeof schema.CLASS_MAP, 'object', 'CLASS_MAP must be an object');
  assert.ok(Array.isArray(schema.SUB_TOGGLE_RELATIONS), 'SUB_TOGGLE_RELATIONS must be an array');
  assert.strictEqual(typeof schema.getDefaultSettings, 'function', 'getDefaultSettings must be a function');
  assert.strictEqual(typeof schema.resolveActiveClasses, 'function', 'resolveActiveClasses must be a function');

  // 2. Verify key count
  assert.strictEqual(schema.CONFIG_KEYS.length, 42, 'CONFIG_KEYS must contain exactly 42 configuration keys');
  assert.strictEqual(schema.DEFAULT_TRUE_KEYS.length, 26, 'DEFAULT_TRUE_KEYS must contain exactly 26 keys');

  // Guardrail 5: Sub-Toggle Default Consistency (defaultTrueKeys)
  // Sub-toggles like hideShortsSidebar, hideCategoryBarFeeds, hideMixPlaylistsFeeds must be in DEFAULT_TRUE_KEYS
  const requiredSubDefaults = [
    'hideCategoryBarFeeds',
    'hideCategoryBarChannels',
    'hideCategoryBarWatch',
    'hideMixPlaylistsFeeds',
    'hideMixPlaylistsWatch',
    'hideShortsSidebar',
    'hideShortsFeeds',
    'hideShortsChannel',
    'hideShortsWatch',
    'dockCommentsHideScrollbar',
    'hideScrollbarsFeeds',
    'hideScrollbarsSidebar',
    'hideScrollbarsWatch',
    'hideScrollbarsPanels'
  ];
  for (const subKey of requiredSubDefaults) {
    assert.ok(schema.DEFAULT_TRUE_KEYS.includes(subKey), `CRITICAL (Guardrail 5): Sub-toggle key '${subKey}' must be registered in DEFAULT_TRUE_KEYS`);
  }

  // 3. Verify getDefaultSettings
  const defaults = schema.getDefaultSettings();
  assert.strictEqual(defaults.extensionEnabled, true);
  assert.strictEqual(defaults.videosPerRow, 4);
  assert.strictEqual(defaults.speedValueA, 1.0);
  assert.strictEqual(defaults.speedValueB, 1.5);
  assert.strictEqual(defaults.speedValueC, 2.0);

  // Check that defaultTrueKeys are true and others are false
  for (const key of schema.DEFAULT_TRUE_KEYS) {
    assert.strictEqual(defaults[key], true, `Key ${key} must default to true`);
  }
  assert.strictEqual(defaults.hideHomeFeed, false, 'hideHomeFeed must default to false');
  assert.strictEqual(defaults.hideComments, false, 'hideComments must default to false');

  // 4. Verify resolveActiveClasses when extension is disabled
  const disabledClasses = schema.resolveActiveClasses(defaults, false);
  assert.strictEqual(disabledClasses.classesToAdd.length, 0, 'No classes should be added when extension is disabled');
  assert.ok(disabledClasses.classesToRemove.length > 0, 'All classes should be marked for removal when disabled');
  assert.ok(disabledClasses.classesToRemove.includes('yt-no-hover-unblur'), 'yt-no-hover-unblur must be marked for removal when disabled');

  // 5. Verify resolveActiveClasses hierarchical sub-toggle behavior
  // Case A: hideShorts master is ON, all sub-toggles default true
  const resShortsOn = schema.resolveActiveClasses({ hideShorts: true }, true);
  assert.ok(resShortsOn.classesToAdd.includes('yt-hide-shorts-sidebar'), 'Shorts sidebar class must be added');
  assert.ok(resShortsOn.classesToAdd.includes('yt-hide-shorts-feeds'), 'Shorts feeds class must be added');

  // Case B: hideShorts master is ON, but hideShortsSidebar is explicitly FALSE
  const resShortsPartial = schema.resolveActiveClasses({ hideShorts: true, hideShortsSidebar: false }, true);
  assert.ok(resShortsPartial.classesToRemove.includes('yt-hide-shorts-sidebar'), 'Shorts sidebar class must be removed');
  assert.ok(resShortsPartial.classesToAdd.includes('yt-hide-shorts-feeds'), 'Shorts feeds class must still be added');

  // Case C: hideShorts master is OFF
  const resShortsOff = schema.resolveActiveClasses({ hideShorts: false }, true);
  assert.ok(resShortsOff.classesToRemove.includes('yt-hide-shorts'), 'Master shorts class must be removed');
  assert.ok(resShortsOff.classesToRemove.includes('yt-hide-shorts-sidebar'), 'Shorts sidebar sub-class must be removed');
  assert.ok(resShortsOff.classesToRemove.includes('yt-hide-shorts-feeds'), 'Shorts feeds sub-class must be removed');

  // Case D: Hover unblur
  const resHoverDefault = schema.resolveActiveClasses({ unblurOnHover: true }, true);
  assert.ok(resHoverDefault.classesToRemove.includes('yt-no-hover-unblur'), 'Should not have no-hover-unblur when enabled');

  const resHoverDisabled = schema.resolveActiveClasses({ unblurOnHover: false }, true);
  assert.ok(resHoverDisabled.classesToAdd.includes('yt-no-hover-unblur'), 'Should add no-hover-unblur when false');

  console.log('PASS: All settings schema assertions passed successfully!');
}

runTests().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
