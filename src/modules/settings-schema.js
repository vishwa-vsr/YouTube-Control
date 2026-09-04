/**
 * YouTube Control - Settings Schema & State Machine
 * Single source of truth for configuration keys, default values,
 * parent/sub-toggle relationships, and CSS class mappings.
 */

export const CONFIG_KEYS = [
  'hideHomeFeed',
  'hideCategoryBar',
  'hideCategoryBarFeeds',
  'hideCategoryBarChannels',
  'hideCategoryBarWatch',
  'customGridEnabled',
  'hideMixPlaylists',
  'hideMixPlaylistsFeeds',
  'hideMixPlaylistsWatch',
  'hideSubscriptions',
  'hideYou',
  'hideExplore',
  'hideMoreFromYoutube',
  'hideShorts',
  'hideShortsSidebar',
  'hideShortsFeeds',
  'hideShortsChannel',
  'hideShortsWatch',
  'hideRecommended',
  'hideComments',
  'hideButtonsStats',
  'hideHeader',
  'grayscaleMode',
  'blurThumbnails',
  'unblurOnHover',
  'showSpeedBtn',
  'showScreenshotBtn',
  'showMiniFullscreenBtn',
  'miniFullscreenFill',
  'stickyPlayer',
  'stickyHideScrollbars',
  'dockCommentsSidebar',
  'dockCommentsHideScrollbar',
  'showRefreshCommentsBtn',
  'showCommentScreenshotBtn',
  'hideAmbientMode',
  'hideSidebarFooter',
  'hideScrollbars',
  'hideScrollbarsFeeds',
  'hideScrollbarsSidebar',
  'hideScrollbarsWatch',
  'hideScrollbarsPanels'
];

export const DEFAULT_TRUE_KEYS = [
  'unblurOnHover',
  'dockCommentsSidebar',
  'dockCommentsHideScrollbar',
  'showRefreshCommentsBtn',
  'showCommentScreenshotBtn',
  'stickyPlayer',
  'showMiniFullscreenBtn',
  'showSpeedBtn',
  'hideCategoryBarFeeds',
  'hideCategoryBarChannels',
  'hideCategoryBarWatch',
  'hideMixPlaylistsFeeds',
  'hideMixPlaylistsWatch',
  'hideShorts',
  'hideShortsSidebar',
  'hideShortsFeeds',
  'hideShortsChannel',
  'hideShortsWatch',
  'hideMoreFromYoutube',
  'hideSidebarFooter',
  'hideAmbientMode',
  'hideScrollbars',
  'hideScrollbarsFeeds',
  'hideScrollbarsSidebar',
  'hideScrollbarsWatch',
  'hideScrollbarsPanels'
];

export const CLASS_MAP = {
  hideHomeFeed: 'yt-hide-home-feed',
  hideCategoryBar: 'yt-hide-category-bar',
  hideCategoryBarFeeds: 'yt-hide-category-bar-feeds',
  hideCategoryBarChannels: 'yt-hide-category-bar-channels',
  hideCategoryBarWatch: 'yt-hide-category-bar-watch',
  hideMixPlaylists: 'yt-hide-mix-playlists',
  hideMixPlaylistsFeeds: 'yt-hide-mix-playlists-feeds',
  hideMixPlaylistsWatch: 'yt-hide-mix-playlists-watch',
  hideSubscriptions: 'yt-hide-subscriptions',
  hideYou: 'yt-hide-you',
  hideExplore: 'yt-hide-explore',
  hideMoreFromYoutube: 'yt-hide-more-from-youtube',
  hideShorts: 'yt-hide-shorts',
  hideShortsSidebar: 'yt-hide-shorts-sidebar',
  hideShortsFeeds: 'yt-hide-shorts-feeds',
  hideShortsChannel: 'yt-hide-shorts-channel',
  hideShortsWatch: 'yt-hide-shorts-watch',
  hideRecommended: 'yt-hide-recommended',
  hideComments: 'yt-hide-comments',
  hideButtonsStats: 'yt-hide-buttons-stats',
  hideHeader: 'yt-hide-header',
  grayscaleMode: 'yt-grayscale-mode',
  blurThumbnails: 'yt-blur-thumbnails',
  showSpeedBtn: 'yt-show-speed-btn',
  showScreenshotBtn: 'yt-show-screenshot-btn',
  showMiniFullscreenBtn: 'yt-show-mini-fullscreen-btn',
  miniFullscreenFill: 'yt-web-fullscreen-fill',
  stickyPlayer: 'yt-sticky-player',
  stickyHideScrollbars: 'yt-sticky-hide-scrollbars',
  dockCommentsSidebar: 'yt-enable-comments-dock',
  dockCommentsHideScrollbar: 'yt-dock-comments-hide-scrollbar',
  showRefreshCommentsBtn: 'yt-enable-comments-refresh',
  showCommentScreenshotBtn: 'yt-show-comment-screenshot-btn',
  hideAmbientMode: 'yt-hide-ambient-mode',
  hideSidebarFooter: 'yt-hide-sidebar-footer',
  hideScrollbars: 'yt-hide-scrollbars',
  hideScrollbarsFeeds: 'yt-hide-scrollbars-feeds',
  hideScrollbarsSidebar: 'yt-hide-scrollbars-sidebar',
  hideScrollbarsWatch: 'yt-hide-scrollbars-watch',
  hideScrollbarsPanels: 'yt-hide-scrollbars-panels'
};

export const SUB_TOGGLE_RELATIONS = [
  {
    parentKey: 'blurThumbnails',
    subRows: [
      { rowId: 'sub-row-unblur', inputId: 'unblurOnHover' }
    ]
  },
  {
    parentKey: 'stickyPlayer',
    subRows: [
      { rowId: 'sub-row-sticky-scrollbars', inputId: 'stickyHideScrollbars' }
    ]
  },
  {
    parentKey: 'dockCommentsSidebar',
    subRows: [
      { rowId: 'sub-row-dock-comments-scroll', inputId: 'dockCommentsHideScrollbar' }
    ]
  },
  {
    parentKey: 'hideScrollbars',
    subRows: [
      { rowId: 'sub-row-scrollbars-feeds', inputId: 'hideScrollbarsFeeds' },
      { rowId: 'sub-row-scrollbars-sidebar', inputId: 'hideScrollbarsSidebar' },
      { rowId: 'sub-row-scrollbars-watch', inputId: 'hideScrollbarsWatch' },
      { rowId: 'sub-row-scrollbars-panels', inputId: 'hideScrollbarsPanels' }
    ]
  },
  {
    parentKey: 'customGridEnabled',
    subRows: [
      { rowId: 'sub-row-grid-cols' }
    ]
  },
  {
    parentKey: 'hideMixPlaylists',
    subRows: [
      { rowId: 'sub-row-mix-feeds', inputId: 'hideMixPlaylistsFeeds' },
      { rowId: 'sub-row-mix-watch', inputId: 'hideMixPlaylistsWatch' }
    ]
  },
  {
    parentKey: 'hideShorts',
    subRows: [
      { rowId: 'sub-row-shorts-sidebar', inputId: 'hideShortsSidebar' },
      { rowId: 'sub-row-shorts-feeds', inputId: 'hideShortsFeeds' },
      { rowId: 'sub-row-shorts-channel', inputId: 'hideShortsChannel' },
      { rowId: 'sub-row-shorts-watch', inputId: 'hideShortsWatch' }
    ]
  },
  {
    parentKey: 'hideCategoryBar',
    subRows: [
      { rowId: 'sub-row-category-feeds', inputId: 'hideCategoryBarFeeds' },
      { rowId: 'sub-row-category-channels', inputId: 'hideCategoryBarChannels' },
      { rowId: 'sub-row-category-watch', inputId: 'hideCategoryBarWatch' }
    ]
  },
  {
    parentKey: 'showMiniFullscreenBtn',
    subRows: [
      { rowId: 'sub-row-mini-fullscreen-fill', inputId: 'miniFullscreenFill' }
    ]
  },
  {
    parentKey: 'showSpeedBtn',
    subRows: [
      { rowId: 'sub-row-speed-inputs', inputIds: ['speedValueA', 'speedValueB', 'speedValueC'] }
    ]
  }
];

export function getDefaultSettings(raw = {}) {
  const settings = { ...raw };
  if (settings.extensionEnabled === undefined) {
    settings.extensionEnabled = true;
  }
  if (settings.videosPerRow === undefined) {
    settings.videosPerRow = 4;
  }
  if (settings.speedValueA === undefined) settings.speedValueA = 1.0;
  if (settings.speedValueB === undefined) settings.speedValueB = 1.5;
  if (settings.speedValueC === undefined) settings.speedValueC = 2.0;

  DEFAULT_TRUE_KEYS.forEach(key => {
    if (settings[key] === undefined) {
      settings[key] = true;
    }
  });

  CONFIG_KEYS.forEach(key => {
    if (settings[key] === undefined) {
      settings[key] = false;
    }
  });

  return settings;
}

export function resolveActiveClasses(settings, isEnabled = true) {
  const classesToAdd = new Set();
  const classesToRemove = new Set();

  if (!isEnabled) {
    Object.values(CLASS_MAP).forEach(cls => classesToRemove.add(cls));
    classesToRemove.add('yt-no-hover-unblur');
    return { classesToAdd: Array.from(classesToAdd), classesToRemove: Array.from(classesToRemove) };
  }

  // Base switches
  Object.keys(CLASS_MAP).forEach(key => {
    const cls = CLASS_MAP[key];
    if (settings[key] === true) {
      classesToAdd.add(cls);
    } else {
      classesToRemove.add(cls);
    }
  });

  // Master & sub-switch hierarchical rules
  const masterRules = [
    {
      masterKey: 'hideShorts',
      masterClass: 'yt-hide-shorts',
      subKeys: [
        { key: 'hideShortsSidebar', cls: 'yt-hide-shorts-sidebar' },
        { key: 'hideShortsFeeds', cls: 'yt-hide-shorts-feeds' },
        { key: 'hideShortsChannel', cls: 'yt-hide-shorts-channel' },
        { key: 'hideShortsWatch', cls: 'yt-hide-shorts-watch' }
      ]
    },
    {
      masterKey: 'hideCategoryBar',
      masterClass: 'yt-hide-category-bar',
      subKeys: [
        { key: 'hideCategoryBarFeeds', cls: 'yt-hide-category-bar-feeds' },
        { key: 'hideCategoryBarChannels', cls: 'yt-hide-category-bar-channels' },
        { key: 'hideCategoryBarWatch', cls: 'yt-hide-category-bar-watch' }
      ]
    },
    {
      masterKey: 'hideMixPlaylists',
      masterClass: 'yt-hide-mix-playlists',
      subKeys: [
        { key: 'hideMixPlaylistsFeeds', cls: 'yt-hide-mix-playlists-feeds' },
        { key: 'hideMixPlaylistsWatch', cls: 'yt-hide-mix-playlists-watch' }
      ]
    },
    {
      masterKey: 'stickyPlayer',
      masterClass: 'yt-sticky-player',
      subKeys: [
        { key: 'stickyHideScrollbars', cls: 'yt-sticky-hide-scrollbars' }
      ]
    },
    {
      masterKey: 'dockCommentsSidebar',
      masterClass: 'yt-enable-comments-dock',
      subKeys: [
        { key: 'dockCommentsHideScrollbar', cls: 'yt-dock-comments-hide-scrollbar' }
      ]
    },
    {
      masterKey: 'hideScrollbars',
      masterClass: 'yt-hide-scrollbars',
      subKeys: [
        { key: 'hideScrollbarsFeeds', cls: 'yt-hide-scrollbars-feeds' },
        { key: 'hideScrollbarsSidebar', cls: 'yt-hide-scrollbars-sidebar' },
        { key: 'hideScrollbarsWatch', cls: 'yt-hide-scrollbars-watch' },
        { key: 'hideScrollbarsPanels', cls: 'yt-hide-scrollbars-panels' }
      ]
    }
  ];

  masterRules.forEach(rule => {
    const isMasterActive = settings[rule.masterKey] === true;
    if (isMasterActive) {
      rule.subKeys.forEach(({ key, cls }) => {
        if (settings[key] !== false) {
          classesToAdd.add(cls);
          classesToRemove.delete(cls);
        } else {
          classesToRemove.add(cls);
          classesToAdd.delete(cls);
        }
      });
    } else {
      classesToRemove.add(rule.masterClass);
      classesToAdd.delete(rule.masterClass);
      rule.subKeys.forEach(({ cls }) => {
        classesToRemove.add(cls);
        classesToAdd.delete(cls);
      });
    }
  });

  if (settings.unblurOnHover === false) {
    classesToAdd.add('yt-no-hover-unblur');
    classesToRemove.delete('yt-no-hover-unblur');
  } else {
    classesToRemove.add('yt-no-hover-unblur');
    classesToAdd.delete('yt-no-hover-unblur');
  }

  return {
    classesToAdd: Array.from(classesToAdd),
    classesToRemove: Array.from(classesToRemove)
  };
}
