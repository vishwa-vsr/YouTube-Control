# Changelog

All notable changes to the **YouTube Control: Shorts Blocker & Detox** extension will be documented in this file.

## [1.1.4] - 2026-08-29

### Added
- **Comment & Thread Screenshot (Issue #15)**: Added a 1-click camera button next to the Reply button on every YouTube comment.
  - **Save & Copy with 1 Click**: Instantly downloads a crisp image and copies it to your clipboard for easy pasting (`Ctrl + V`).
  - **Full Conversation Threads**: If a comment has open replies, clicking its camera captures the entire conversation with sleek connecting threadlines.
  - **Native Details**: Includes profile pictures, timestamps, like counts, dislike icons, and creator heart badges matching your YouTube theme.
  - **Popup Control**: Toggle on or off anytime in the popup under the **Watch** tab.
- **Category Bar Defaults**: Category Bar sub-options (Home, Channel pages, Watch page) are now ON by default when the feature is enabled.
- **Popup Polish**: Simplified and reorganized feature descriptions across Feeds, Watch, and Style tabs to be punchy and easy to understand.

---

## [1.1.3] - 2026-08-26

### Added
- **1-Click Refresh Comments Button (Issue #16)**: Added a 1-click **Refresh Comments** button directly in the YouTube comments header to reload new comments in the background without refreshing the webpage or interrupting video playback.
  - **Background Reload**: Refreshes comments silently and smoothly while preserving the active sort order ("Top comments" vs "Newest first").
  - **Visual Feedback**: The refresh icon smoothly spins during comment fetching and stops once loaded, with a built-in safety timeout.
  - **Extension Setting**: Added a toggle switch in the popup under **Watch Experience** (enabled by default).
- **Daily Review Prompt Schedule**: Updated the review prompt frequency from 7 days to once every 24 hours (1 day cooldown when snoozed with "Maybe Later").

### Fixed
- **Dock Comments Initial Cross Icon**: Resolved an issue where opening a video with docked comments enabled displayed the dock icon instead of the cross (`X`) restore icon on initial page load.
- **Clean Header Action Buttons & Motion Removal**: Removed background circular card bubbles and outline borders from comments header action buttons (Dock and Refresh) for a clean, transparent, native look across Light and Dark themes, and removed hover scaling/pop animations to keep buttons steady.

---

### Fixed
- **Custom Grid Shelf Layout Protection (Issue #14)**: Fixed a bug where enabling the Custom Grid Layout (setting 2, 3, 5, or 6 videos per row) distorted non-video shelves. Shorts shelves, Community Posts shelves, and Channel Membership panels now span the full row width cleanly with zero empty gaps or squished items.

### Added
- **Subscriptions Feed Custom Grid**: Extended the Custom Grid Layout feature to the Subscriptions feed (`/feed/subscriptions`) so your chosen video row count applies seamlessly across both Home and Subscriptions feeds.

---

## [1.1.3] - 2026-08-22

### Added
- **Review Prompt Popup**: Added a non-intrusive review prompt modal that appears inside the extension popup after 7 days of use, politely asking users to leave a review on the Chrome Web Store (or Firefox Add-ons / Edge Add-ons). Includes three response options:
  - **Leave a Review**: Opens the correct store review page based on the user's browser and permanently stops asking.
  - **Maybe Later**: Dismisses the prompt for 7 days before showing again.
  - **Don't Ask Again**: Permanently dismisses the review prompt.
- **Install Date Tracking**: The extension now records the install date via the `onInstalled` event to power time-based review prompt logic. Existing users are gracefully handled by treating their first popup open after the update as Day 1.

---

## [1.1.2] - 2026-08-21

### Added
- **Playback Speed Toggle Button (Issue #9)**: Added a quick-toggle playback speed button directly in the YouTube video player control bar to switch between two user-configured speeds with a single click.
- **Customizable Speed Inputs**: Added custom speed settings under the **Watch Experience** tab, supporting custom decimal speed presets (default: `1.0x` and `2.0x`).
- **Live Playback Rate Synchronization**: The speed button automatically reflects speed changes made via YouTube's native menu or keyboard shortcuts (`Shift + >` / `Shift + <`).

### Fixed
- **Home Feed & Shorts Scroll Preservation**: Fixed an issue where clicking video thumbnails or Shorts from the Home Feed, Subscriptions, or Search caused the feed to jump to the top. Dual scrolling reset is now strictly confined to video watch pages, preserving your exact feed scroll position.

---

## [1.1.1] - 2026-08-17

### Added
- **Hide Mix Playlists Controls (Issue #8)**: Added a new settings card under the **Feeds** tab with master and sub-toggles to hide YouTube's auto-generated Mix playlists (`list=RD...` / `start_radio=1`).
  - **Hide Mixes in Home & Feeds**: Removes Mix playlists from Home and Subscription feeds.
  - **Hide Mixes on Watch Page**: Removes Mix playlist recommendations from the video sidebar and related recommendations.

### Fixed
- **Sticky Player & Dual Scrolling Navigation Reset**: Fixed an issue where clicking a recommended video in the sidebar kept the sidebar scrolled down on the new page instead of resetting cleanly to the top.

---

## [1.1.0] - 2026-08-15

### Added
- **Mini Fullscreen Video Scaling Sub-Option**: Added a **Fill Screen (Cover Window)** sub-toggle under **Mini Fullscreen Button** allowing users to switch between standard aspect-ratio fitting and full-window zoom without black bars.

### Fixed
- **Cinema Mode Mini Fullscreen Letterboxing (Issue #10)**: Fixed a bug where activating Mini Fullscreen while YouTube is in Cinema (Theater) Mode caused the player to remain constrained in the theater container with black side pillars. The player now smoothly expands to 100% viewport width and height across all viewing modes.
- **Cinema Mode Shortcut & Toggle Sync**: Added seamless exit handling when toggling Cinema Mode ('T' shortcut or player button) or entering native full screen while Mini Fullscreen is active.

### Changed
- **Sticky Player & Dual Scrolling Clarification**: Renamed **Sticky Video Player** to **Sticky Player & Dual Scrolling** with description *"Pin video at the top and scroll comments & sidebar independently"* to highlight split-pane independent scrolling.
- **Default Category Bar Setting**: Configured **Hide Category Bar** to be OFF by default for new installs.

---

## [1.0.9] - 2026-08-12

### Added
- **Granular Shorts Hiding Controls**: Introduced 4 sub-options under **Hide Shorts & Playables** allowing users to selectively hide Shorts in the **Sidebar Menu**, **Home & Subscriptions Feeds**, **YouTuber Channel Pages**, and **Watch Page Recommendations**.
- **Granular Category Bar Controls**: Introduced 3 sub-options under **Hide Category Bar** allowing users to selectively hide topic/filter pills on **Home & Feeds**, **Channel Video Sorting Pills** (`Latest`, `Popular`, `Oldest`), and **Watch Page Sidebar Filters**.
- **Modern Option B Card Layout**: Restructured the extension popup into clean, translucent dark glassmorphism cards with rounded corners (`12px`), elegant divider lines, and subtle hover glow effects.
- **Enhanced Popup Dimensions & Readability**: Expanded popup height to `560px` for reduced scrolling, widened cards (`12px` side margins), and boosted disabled text contrast (`0.65` opacity, `11px` description font) for crystal-clear readability.

### Fixed
- **Channel Page Shorts Tab Removal**: Fixed an issue where YouTuber channel Shorts tabs and channel Shorts grids (`youtube.com/@username/shorts`) were not hidden when Shorts blocking was enabled.
- **Independent Sub-Toggle Uncoupling**: Fixed a CSS selector collision where master classes prevented individual sub-toggles (like **Hide Shorts on Channel Pages**) from turning OFF independently.
- **Watch Page Recommended Videos Gap Collapse**: Fixed empty vertical height gaps when recommendation filter pills are hidden on video watch pages by collapsing container margins and shifting recommended video cards flush to the top.

---

## [1.0.8] - 2026-08-11

### Added
- **Uninstall Feedback Survey Integration**: Configured `chrome.runtime.setUninstallURL` in background service worker to open the official uninstall survey form when users remove the extension.
- **Top Header GitHub Link**: Relocated GitHub repository link to a clean, minimalist icon button in the top header next to the master toggle.
- **Popup Footer Feedback Button**: Replaced bottom GitHub link with a **Feedback 💬** button linking directly to the user feedback Google Form.

---

## [1.0.7] - 2026-08-06

### Added
- **Hide Category Bar Toggle**: Added a user setting in the **Feeds** tab (`Hide Category Bar`) to remove topic filter pills ("All", "Music", "Mixes", "AI", etc.) across YouTube feed pages with zero empty gaps and 100% full thumbnail visibility.
- **Popup Auto-Wake**: Added an interactive click handler to automatically flip the Master Extension switch back ON if options or tabs are clicked while the extension is disabled.

### Fixed
- **Cinema Mode Scroll Unlock**: Fixed an issue where enabling Sticky Video Player locked page scrolling in Cinema (Theater) Mode (`ytd-watch-flexy[theater]`), allowing users to scroll down past the theater player to view comments and related videos seamlessly.

---

## [1.0.6] - 2026-07-29

### Added
- **Custom Home Feed Grid Layout**: Added a user setting in the **Feeds** tab to customize videos per row on the YouTube home feed (select 2, 3, 4, 5, or 6 videos per row).
- **Popup Footer Action Capsule**: Added a fixed glassmorphism footer in the popup with **Rate Us 5★** (auto-detecting Chrome, Firefox, and Edge review store URLs) and **GitHub** project link.

### Fixed
- **Hide Comments & Chat Priority over Docked Comments**: Fixed a CSS rule collision where docking comments to the sidebar forced `display: flex !important;` and prevented the **Hide Comments & Chat** option from hiding docked comments.
- **Live Stream False Positive & Comment Docking**: Resolved an issue where hidden player template badges caused regular videos to be falsely detected as live streams, restoring auto-docking of comments to the sidebar.
- **Custom Grid Layout Alignment**: Refined card width calculations and grid flex wrapping to eliminate blank right-side gaps across 2, 3, 4, 5, and 6 column layouts.

### Updated
- **Documentation & Community Badges**: Updated project `README.md` with official browser store links (Firefox, Chrome, Edge), live dynamic active user badges, rating counts, and refreshed tagline.

---

## [1.0.5] - 2026-07-25

### Fixed
- **Dock Button Cross Icon Visibility**: Fixed an issue in Dark Mode where the docked comments close/restore toggle icon (X icon) rendered in dark black on a dark background, making it invisible. Updated icon fill colors and SVG styles to force bright solid white (`#ffffff`) in Dark Mode (`html[dark]`) and dark solid black (`#0f0f0f`) in Light Mode (`html:not([dark])`).

---

## [1.0.4] - 2026-07-25

### Fixed
- **Universal Light & Dark Theme Adaptation**: Resolved a theme inversion issue where docked comments displayed black boxes in Light Mode or white boxes in Dark Mode. Implemented native page background inheritance (`transparent` background) and neutral 20% grey borders, ensuring 100% theme compatibility across Light, Dark, and System modes.

---

## [1.0.3] - 2026-07-24

### Fixed
- **Light Theme Comments Docking**: Fixed an issue where docking comments to the sidebar on YouTube's Light Theme displayed a dark `#0f0f0f` container with low contrast. Updated container backgrounds, borders, scrollbars, and toggle button colors to dynamically adapt to both Light and Dark YouTube themes.
- **Live Stream Collapsed Chat & Empty Black Box**: Fixed an issue on live streams where closing live chat or viewing a stream left an empty 600px dark box in the right sidebar. Resolved by targeting both the chat frame and its parent container (`#chat-container`), and excluding hidden/disabled comments elements from sidebar docking styles.

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
