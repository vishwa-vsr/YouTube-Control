# Changelog

All notable changes to the **YouTube Control: Shorts Blocker & Detox** extension will be documented in this file.

## [1.0.2] - 2026-07-24

### Added
- **Uninstall Feedback Survey**: Integrated a Google Form uninstall link that automatically opens in the browser when a user uninstalls or removes the extension to collect user feedback.

---

## [1.0.1] - 2026-07-18

### Fixed
- **Comments Docking**: Fixed a layout bug on live streams where enabling "Dock Comments to Sidebar" would place an empty, styled black box in the sidebar next to the live chat. The extension now automatically detects live streams and active chats to prevent docking, ensuring a clean sidebar layout.
- **Navigation Scroll**: Fixed an issue in "Sticky Player" mode where the left (player) and right (recommended videos) columns would remain scrolled down when loading a new video. The columns now automatically reset to the top upon page navigation.

---

## [1.0.0] - 2026-07-15

This is the initial public release of the **YouTube Control: Shorts Blocker & Detox** extension. It introduces a complete suite of focus-enhancing options, clean layouts, and styling controls to create a distraction-free experience on YouTube.

### Added
- **Navigation & Feeds Controls**:
  - Hides home feed recommended videos to prevent click-traps.
  - Hides the subscriptions section and explore menu from the sidebar.
  - Removes the distracting Shorts and Playables feeds entirely.
  - Hides sidebar footer links for a cleaner look.
- **Watch Experience Options**:
  - Hides recommended video list on video watch pages.
  - Disables comments feed and live chat boxes.
  - Hides video details like channel stats, likes count, and action buttons.
  - Hides the top navigation header bar (search and user menu).
- **Visual Styling & Detox**:
  - Adds **Black & White Mode** to render YouTube elements in calm grayscale.
  - Adds **Blur Thumbnails** with optional hover reveal to disable clickbait visual traps.
  - Blocks YouTube's ambient glowing background mode to save CPU/battery.
- **Premium Layouts & Utilities**:
  - Adds **Sticky Player** that holds the video player at the top while scrolling comments.
  - Adds **Dock Comments to Sidebar** to move comments next to the video.
  - Adds **Screenshot Button** to capture clean, full-resolution video frames instantly.
  - Adds **Mini Fullscreen Mode** to fill the browser viewport.
- **Dashboard Interface**:
  - Features the **Calm Obsidian Dark Theme** panel for managing settings.
  - Includes a visual "Calm Meter" progress ring indicating how clean your current layout is.
- **Automated Tooling**:
  - Included a developer build script (`build.py`) to minify code and package ready-to-load extension folders for Chrome, Firefox, and Edge.
