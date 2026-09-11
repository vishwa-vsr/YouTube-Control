const assert = require('assert');
const path = require('path');

console.log('Running test: Scroll Distance Tracker unit tests...');

async function runTests() {
  const modulePath = path.join(__dirname, '..', 'src', 'modules', 'scroll-tracker.js');
  const fileUrl = 'file:///' + modulePath.replace(/\\/g, '/');
  const tracker = await import(fileUrl);

  // 1. Verify exports
  assert.strictEqual(typeof tracker.calculateMeters, 'function', 'calculateMeters must be a function');
  assert.strictEqual(typeof tracker.getTodayDateString, 'function', 'getTodayDateString must be a function');
  assert.strictEqual(typeof tracker.isNewDay, 'function', 'isNewDay must be a function');
  assert.strictEqual(typeof tracker.formatDistance, 'function', 'formatDistance must be a function');
  assert.strictEqual(typeof tracker.initScrollTracker, 'function', 'initScrollTracker must be a function');
  assert.strictEqual(typeof tracker.updateScrollTrackerSettings, 'function', 'updateScrollTrackerSettings must be a function');
  assert.strictEqual(typeof tracker.flushDistance, 'function', 'flushDistance must be a function');
  assert.strictEqual(typeof tracker.rebindScrollTargets, 'function', 'rebindScrollTargets must be a function');
  assert.strictEqual(tracker.MIN_JITTER_THRESHOLD, 5, 'MIN_JITTER_THRESHOLD must be 5');

  // 2. Test calculateMeters
  assert.strictEqual(tracker.calculateMeters(0), 0);
  assert.strictEqual(tracker.calculateMeters(-10), 0);
  assert.strictEqual(tracker.calculateMeters(NaN), 0);
  assert.strictEqual(tracker.calculateMeters(null), 0);
  assert.strictEqual(tracker.calculateMeters('abc'), 0);
  const m10k = tracker.calculateMeters(10000);
  assert.ok(Math.abs(m10k - 2.64583) < 0.001, `Expected ~2.64583m for 10,000px, got ${m10k}`);

  // 3. Test getTodayDateString and isNewDay
  const testDate = new Date(2026, 8, 11); // Sept 11, 2026
  assert.strictEqual(tracker.getTodayDateString(testDate), '2026-09-11');

  assert.strictEqual(tracker.isNewDay(null, '2026-09-11'), true);
  assert.strictEqual(tracker.isNewDay(undefined, '2026-09-11'), true);
  assert.strictEqual(tracker.isNewDay('', '2026-09-11'), true);
  assert.strictEqual(tracker.isNewDay('2026-09-10', '2026-09-11'), true);
  assert.strictEqual(tracker.isNewDay('2026-09-11', '2026-09-11'), false);

  // 4. Test formatDistance
  assert.strictEqual(tracker.formatDistance(0), '0m');
  assert.strictEqual(tracker.formatDistance(-50), '0m');
  assert.strictEqual(tracker.formatDistance(NaN), '0m');
  assert.strictEqual(tracker.formatDistance(null), '0m');
  assert.strictEqual(tracker.formatDistance(45), '45m');
  assert.strictEqual(tracker.formatDistance(45.4), '45m');
  assert.strictEqual(tracker.formatDistance(45.7), '46m');
  assert.strictEqual(tracker.formatDistance(999), '999m');
  assert.strictEqual(tracker.formatDistance(1000), '1.0km');
  assert.strictEqual(tracker.formatDistance(1250), '1.3km');
  assert.strictEqual(tracker.formatDistance(14800), '14.8km');
  assert.strictEqual(tracker.formatDistance(105400), '105km');

  // 5. Test formatHeaderText & getScrolledTodaySuffix
  assert.strictEqual(typeof tracker.formatHeaderText, 'function', 'formatHeaderText must be a function');
  assert.strictEqual(typeof tracker.getScrolledTodaySuffix, 'function', 'getScrolledTodaySuffix must be a function');
  assert.strictEqual(tracker.formatHeaderText(0), '0m scrolled today');
  assert.strictEqual(tracker.formatHeaderText(45), '45m scrolled today');
  assert.strictEqual(tracker.formatHeaderText(1250), '1.3km scrolled today');

  // 6. Test parseStoredDistance
  assert.strictEqual(typeof tracker.parseStoredDistance, 'function', 'parseStoredDistance must be a function');
  const freshStats = tracker.parseStoredDistance(null, '2026-09-11');
  assert.strictEqual(freshStats.todayMeters, 0);
  assert.strictEqual(freshStats.allTimeMeters, 0);
  assert.strictEqual(freshStats.isRollover, true);

  const sameDayStats = tracker.parseStoredDistance({
    scrollDate: '2026-09-11',
    scrollMetersToday: 150.5,
    scrollMetersAllTime: 500
  }, '2026-09-11');
  assert.strictEqual(sameDayStats.todayMeters, 150.5);
  assert.strictEqual(sameDayStats.allTimeMeters, 500);
  assert.strictEqual(sameDayStats.isRollover, false);

  const nextDayStats = tracker.parseStoredDistance({
    scrollDate: '2026-09-10',
    scrollMetersToday: 150.5,
    scrollMetersAllTime: 500
  }, '2026-09-11');
  assert.strictEqual(nextDayStats.todayMeters, 0);
  assert.strictEqual(nextDayStats.allTimeMeters, 500);
  assert.strictEqual(nextDayStats.isRollover, true);

  // 7. Test isAllowedTrackingPage
  assert.strictEqual(typeof tracker.isAllowedTrackingPage, 'function', 'isAllowedTrackingPage must be a function');
  assert.strictEqual(tracker.isAllowedTrackingPage('/'), true, 'Home feed must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/results'), true, 'Search results must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/feed/subscriptions'), true, 'Subscriptions must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/@MKBHD'), true, 'Channel handle must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/channel/UC123'), true, 'Channel ID must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/watch'), true, 'Watch page must be allowed');
  assert.strictEqual(tracker.isAllowedTrackingPage('/feed/history'), false, 'History must NOT be tracked');
  assert.strictEqual(tracker.isAllowedTrackingPage('/playlist?list=123'), false, 'Playlists must NOT be tracked');
  assert.strictEqual(tracker.isAllowedTrackingPage('/feed/you'), false, 'Library/You must NOT be tracked');

  // 8. Test getDistanceStats fallback without chrome
  assert.strictEqual(typeof tracker.getDistanceStats, 'function', 'getDistanceStats must be a function');
  tracker.getDistanceStats((stats) => {
    assert.strictEqual(stats.todayMeters, 0);
    assert.strictEqual(stats.allTimeMeters, 0);
    assert.strictEqual(stats.isEnabled, false);
  });

  console.log('PASS: All Scroll Distance Tracker assertions passed successfully!');
}

runTests().catch(err => {
  console.error('FAIL: Scroll Distance Tracker tests failed:', err);
  process.exit(1);
});
