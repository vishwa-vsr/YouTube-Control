<p align="center">
  <img src="assets/logo.png" width="96" height="96" alt="YouTube Control Logo">
</p>

<h1 align="center">YouTube Control</h1>
<p align="center"><b>Block Shorts, hide recommendation feeds, and detox your YouTube experience.</b></p>

<p align="center">
  <a href="https://github.com/vishwa-vsr/YouTube-Control/blob/master/LICENSE"><img src="https://img.shields.io/github/license/vishwa-vsr/YouTube-Control?color=blue" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/manifest-v3-blue" alt="Manifest V3">
  <a href="https://github.com/vishwa-vsr/YouTube-Control/issues"><img src="https://img.shields.io/github/issues/vishwa-vsr/YouTube-Control" alt="Open Issues"></a>
  <a href="https://github.com/vishwa-vsr/YouTube-Control/pulls"><img src="https://img.shields.io/github/issues-pr/vishwa-vsr/YouTube-Control" alt="Pull Requests"></a>
</p>

---

## Overview

**YouTube Control** is a lightweight, privacy-focused browser extension that strips away distractions, blocks algorithmic rabbit holes, and gives you complete control over YouTube's layout.

* **100% Local & Private**: No analytics, telemetry, or external API calls. All settings stay in your browser's local storage.
* **Fast & Lightweight**: Built with modular vanilla JavaScript, hardware-accelerated CSS, and compiled into zero-overhead bundles via `esbuild`.
* **Manifest V3 Native**: Fully compliant with modern Chrome, Microsoft Edge, Brave, Opera, and Mozilla Firefox standards.

---

## 📥 Store Downloads

| Store | Version | Rating | Users |
| :--- | :---: | :---: | :---: |
| [Chrome Web Store](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/v/ljinlboeiainceejndpicabkmheecnfj?color=blue&label=latest)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/rating/ljinlboeiainceejndpicabkmheecnfj?color=blue)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/users/ljinlboeiainceejndpicabkmheecnfj?color=blue&label=users)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) |
| [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/v/youtube-control?color=orange&label=latest)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/rating/youtube-control?color=orange)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/users/youtube-control?color=orange)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) |
| [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=latest&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=rating&suffix=/5&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) |

---

## Visual Tour

<p align="center">
  <b>Minimal Settings Popup</b><br>
  <i>Toggle distraction blockers, video layouts, and styling options instantly.</i><br><br>
  <img src="assets/Comp%205.png" width="80%" alt="Settings Popup Menu">
</p>

<p align="center">
  <b>Block YouTube Shorts</b><br>
  <i>Eliminate Shorts shelves, navigation buttons, reels, and sidebar links.</i><br><br>
  <img src="assets/Comp%204%20(0-00-00-00).png" width="80%" alt="Block YouTube Shorts">
</p>

<p align="center">
  <b>Dock Comments to Sidebar</b><br>
  <i>Read and post comments beside the player without losing your place in the video.</i><br><br>
  <img src="assets/Comp%202%20.jpg" width="80%" alt="Dock Comments to Sidebar">
</p>

<p align="center">
  <b>Sticky Player & Dual Scrolling</b><br>
  <i>Pins the video to the top and lets recommendations and comments scroll independently.</i><br><br>
  <img src="assets/Comp%201%20.jpg" width="80%" alt="Sticky Player & Dual Scrolling">
</p>

<p align="center">
  <b>Mini Fullscreen Mode</b><br>
  <i>Fills the browser viewport with the video while keeping your address bar and tabs accessible.</i><br><br>
  <img src="assets/Comp%203%20.jpg" width="80%" alt="Mini Fullscreen Mode">
</p>

---

## Features

| Category | Feature | What It Does |
| :--- | :--- | :--- |
| 🚫 **Shorts & Feeds** | **Hide Shorts** | Removes Shorts shelves, navigation buttons, channel reels, and sidebar links. |
| 🚫 **Shorts & Feeds** | **Hide Home Feed** | Removes the video recommendation grid on the YouTube home page. |
| 🚫 **Shorts & Feeds** | **Hide Mix Playlists** | Hides auto-generated YouTube Mixes on Home feeds and watch pages. |
| 🚫 **Shorts & Feeds** | **Hide Category Bar** | Hides topic filter pills on Home feeds, Channel sorting pills, and Watch page chips. |
| 🚫 **Shorts & Feeds** | **Hide More From YouTube** | Hides YouTube Premium, Music, and Kids links from the sidebar menu. |
| 🚫 **Shorts & Feeds** | **Hide Sidebar Footer** | Hides policy and copyright footer text from the left navigation drawer. |
| 📐 **Layouts** | **Custom Grid Columns** | Choose between 2, 3, 4, 5, or 6 video cards per row on Home and Subscriptions. |
| 📐 **Layouts** | **Sticky Player & Dual Scroll** | Pins the video player at the top and enables independent, hardware-accelerated column scrolling. |
| 💬 **Comments** | **Dock Comments to Sidebar** | Moves the comments section into the right sidebar next to the video player. |
| 💬 **Comments** | **1-Click Refresh Comments** | Silently reloads comments in the background without refreshing the page or interrupting audio. |
| 📸 **Comments** | **Comment & Thread Screenshot** | 1-click camera button that copies high-resolution comment cards or full discussion threads to the clipboard. |
| 💬 **Comments** | **Hide Comments & Chat** | Removes video comments and live chat replay entirely. |
| 👁️ **Visual Detox** | **Blur Thumbnails** | Blurs video thumbnails until you hover your mouse over them. |
| 🎨 **Styling** | **Grayscale Mode** | Converts the entire YouTube interface to distraction-free black & white. |
| 🎨 **Styling** | **Block Ambient Mode** | Removes the glowing background halo lighting behind the video player. |
| 🎨 **Styling** | **Hide Scrollbars** | Hides scrollbars across Home feeds, Sidebar, Watch page, or Panels while keeping smooth scrolling intact. |
| 📺 **Watch Page** | **Hide Recommended Videos** | Removes the recommended video sidebar on watch pages. |
| 📺 **Watch Page** | **Hide Buttons & Stats** | Hides Subscribe buttons, view counts, and like counts. |
| 📺 **Watch Page** | **Hide Top Header** | Hides the top search bar and header navigation. |
| 🎛️ **Player Tools** | **Playback Speed Button** | Adds an in-player button to cycle between 3 custom speeds (e.g., 1.0x, 1.5x, 2.0x) and remembers your speed across videos. |
| 📸 **Player Tools** | **Video Screenshot** | Captures a high-resolution PNG frame directly from the video stream to your clipboard/downloads. |
| 🔲 **Player Tools** | **Mini Fullscreen** | Expands the player to fill the window while keeping your tabs and bookmarks bar visible. |

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Condition |
| :---: | :--- | :--- |
| `Esc` | Exit Mini Fullscreen | When Mini Fullscreen is active |
| `T` | Exit Mini Fullscreen | When toggling Cinema / Theater Mode |

---

## 📁 Repository Structure

```text
YouTube-Control/
├── src/                    # Source code (edit here)
│   ├── manifest.json       # Manifest V3 extension configuration
│   ├── background.js       # Lightweight background service worker
│   ├── popup.html          # Popup settings user interface
│   ├── popup.css           # Popup styling
│   ├── popup.js            # Popup controller logic
│   ├── content.js          # Main content script entry point
│   ├── content.css         # Injected layout, theme, and detox styles
│   ├── modules/            # Self-contained ES modules
│   │   ├── comment-canvas.js   # Canvas drawing, thread curves & screenshot export
│   │   ├── speed-controller.js # Video rate cycling, memory & event listeners
│   │   ├── watch-navigation.js # URL tracking, lifecycle hooks & scroll resets
│   │   └── settings-schema.js  # Unified settings definitions & parent/sub rules
│   └── icons/              # Extension icons (16px, 48px, 128px)
├── dist/                   # Bundled unpacked builds for browsers (generated)
│   ├── chrome/             # Ready-to-load Chrome/Edge build
│   └── firefox/            # Ready-to-load Firefox build
├── releases/               # Store upload zip archives (generated)
├── test/                   # Automated unit and regression test suites
│   ├── test-comment-canvas.js
│   ├── test-scrolling-performance.js
│   ├── test-settings-schema.js
│   ├── test-sidebar-footer-comments.js
│   ├── test-speed-controller.js
│   └── test-watch-navigation.js
├── build.py                # esbuild bundler, minifier, and packaging script
├── package.json            # Node development dependencies and test scripts
├── CHANGELOG.md            # Public user-facing version notes
├── CONTRIBUTING.md         # Developer setup and contribution guide
└── LICENSE                 # MIT License
```

---

## 🛠️ Local Development

### Prerequisites
* **[Node.js](https://nodejs.org/)** (v18 or higher)
* **[Python](https://www.python.org/)** (v3.8 or higher)
* **[Git](https://git-scm.com/)**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vishwa-vsr/YouTube-Control.git
cd YouTube-Control
npm install
```

### 2. Run Automated Tests
```bash
npm test
```

### 3. Build Extension Bundles
Run the build script to bundle `src/` into the `dist/` directory via `esbuild`:

```bash
# Build unpacked distribution folders for Chrome, Firefox, and Edge
python build.py -y

# Optional: Build unpacked distributions AND package store-ready zip archives in releases/
python build.py -y --zip
```

---

## 🔌 Loading in Your Browser

### Google Chrome, Edge, Brave, or Opera
1. Navigate to `chrome://extensions/` (or `edge://extensions/` in Edge).
2. Enable **Developer mode** using the toggle switch.
3. Click **Load unpacked**.
4. Select the **`dist/chrome`** directory inside this repository.

### Mozilla Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file inside **`dist/firefox`**.

> [!TIP]
> **Active Development Flow**: Edit files inside `src/` or `src/modules/`, run `python build.py -y`, and click the **Reload (↻)** icon on the extension card in your browser's extension manager.

---

## 🔍 Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `Cannot find module 'esbuild'` | Missing Node dependencies. | Run `npm install` in the project root. |
| Changes don't appear on YouTube | You edited `src/` but didn't recompile. | Run `python build.py -y` and click Reload in `chrome://extensions`. |
| Script error loading `src/` in Chrome | You loaded `src/` instead of `dist/chrome`. | Load the compiled `dist/chrome` folder (content scripts require bundling). |
| YouTube layout looks broken | YouTube changed Polymer DOM nodes. | Run `npm test` to verify selectors against fixtures. |

---

## 🔒 Privacy & Permissions

* **Permission requested**: `storage` only.
* **Why**: To save your toggle preferences locally via `chrome.storage.local`.
* **Zero network tracking**: No telemetry, tracking pixels, or remote servers. See our [Privacy Policy](PRIVACY.md).

---

## 🤝 Contributing

Bug reports, feature requests, and code contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
