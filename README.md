<p align="center">
  <img src="assets/logo.png" width="96" height="96" alt="YouTube Control Logo">
</p>

<h1 align="center">YouTube Control</h1>
<p align="center"><b>Shorts Blocker & Detox</b></p>
<p align="center"><i>Block Shorts, remove video clutter, and customize YouTube for pure focus.</i></p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0">
    <img src="https://img.shields.io/badge/Chrome_Web_Store-Get_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Web Store">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/youtube-control/">
    <img src="https://img.shields.io/badge/Firefox_Add--ons-Get_Extension-FF7139?style=for-the-badge&logo=firefox&logoColor=white" alt="Firefox Add-ons">
  </a>
  <a href="https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki">
    <img src="https://img.shields.io/badge/Edge_Add--ons-Get_Extension-0078D7?style=for-the-badge&logo=microsoftedge&logoColor=white" alt="Edge Add-ons">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/chrome-web-store/users/ljinlboeiainceejndpicabkmheecnfj?style=flat-square&logo=googlechrome&label=Chrome%20Users&color=4285F4" alt="Chrome Users">
  <img src="https://img.shields.io/amo/users/youtube-control?style=flat-square&logo=firefox&label=Firefox%20Users&color=FF7139" alt="Firefox Users">
  <img src="https://img.shields.io/badge/dynamic/json?label=Edge%20Users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki&style=flat-square&logo=microsoftedge&color=0078D7" alt="Edge Users">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License">
</p>

---

## Official Store Downloads & Community Stats

| Browser Store | Direct Link | Live Active Users | User Rating | Rating Count |
| :--- | :--- | :---: | :---: | :---: |
| 🌐 **Google Chrome** | [Install from Chrome Web Store](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | <img src="https://img.shields.io/chrome-web-store/users/ljinlboeiainceejndpicabkmheecnfj?color=blue&label=users" alt="Chrome Users"> | ⭐ New Listing | 0 ratings *(Be the first!)* |
| 🦊 **Mozilla Firefox** | [Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | <img src="https://img.shields.io/amo/users/youtube-control?color=orange&label=users" alt="Firefox Users"> | <img src="https://img.shields.io/amo/rating/youtube-control?color=orange" alt="Firefox Rating"> | **3 ratings** |
| 🌊 **Microsoft Edge** | [Install from Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | <img src="https://img.shields.io/badge/dynamic/json?label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki&color=blue" alt="Edge Users"> | ⭐ New Listing | 0 ratings *(Be the first!)* |


---

## Key Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| 📐 **Layouts** | **Custom Grid Layout** | Customize Home Feed to display **2, 3, 4, 5, or 6 videos per row** for optimal layout. |
| 📐 **Layouts** | **Sticky Video Player** | Lock video player scrolling while keeping comments independently scrollable. |
| 💬 **Comments** | **Dock Comments to Sidebar** | Moves video comments directly into the right sidebar next to the video for distraction-free reading. |
| 💬 **Comments** | **Hide Comments & Chat** | Completely removes the video comments section and live chat frame. |
| 👁️ **Visual Detox** | **Blur Thumbnails** | Blurs thumbnail images until hovered to prevent clickbait distraction traps. |
| 👁️ **Visual Detox** | **Reveal on Hover** | Temporarily unblurs thumbnail images when mouse hovers over them. |
| 🎨 **Styling** | **Black & White Mode** | Converts the entire YouTube interface to clean grayscale to reduce visual stimulation. |
| 🎨 **Styling** | **Block Ambient Mode** | Disables the glowing video player background light (reduces distractions & saves battery). |
| ⚙️ **Clutter Control** | **Hide Home Feed** | Removes the main video recommendation feed from the YouTube home page. |
| ⚙️ **Clutter Control** | **Hide Shorts** | Removes Shorts sections, navigation tabs, reels, and sidebar links. |
| ⚙️ **Clutter Control** | **Hide Recommended Videos** | Removes sidebar video suggestions on the watch page. |
| ⚙️ **Clutter Control** | **Hide Endscreen Cards** | Removes pop-up video cards, channel overlays, and annotations at video end. |
| ⚙️ **Clutter Control** | **Sidebar Detox** | Custom hide options for Subscriptions list, 'You' section, Explore, and 'More from YouTube'. |
| 📸 **Utilities** | **Video Screenshot** | Capture clean, high-resolution PNG video frames instantly with one click on player controls. |
| 📺 **Utilities** | **Mini Fullscreen** | Expand video to fill the browser viewport while keeping tabs, search, and bookmarks visible. |
| ⭐ **Community** | **Store Rating & GitHub** | Direct 1-click browser store rating (Chrome, Firefox, Edge) and open source repository access. |

---

## Folder Structure

```text
youtube control/
├── CHANGELOG.md      # History of version updates
├── build.py          # Script to package extensions for all browsers
├── src/              # Source code directory (where you make edits)
│   ├── manifest.json # Extension configuration blueprint
│   ├── popup.html    # Settings panel interface
│   ├── popup.css     # Settings panel visual styling (Calm Obsidian dark theme)
│   ├── popup.js      # Settings panel controller logic
│   ├── content.js    # Script injecting class tags into YouTube
│   └── content.css   # Hiding styles injected into YouTube
└── dist/             # Generated browser-ready packages (Ignored in Git)
    ├── chrome/       # Ready-to-load Chrome build
    ├── firefox/      # Ready-to-load Firefox build
    └── edge/         # Ready-to-load Edge build
```

---

## Getting Started

### 1. Build the Extension

To compile and compress the source code into optimized browser folders, run this command in your command terminal:

```bash
python build.py -y
```

### 2. Loading the Extension

> [!TIP]
> **Loading in Google Chrome (or Chromium-based browsers like Brave, Opera):**
> 1. Open `chrome://extensions/` in your browser.
> 2. Turn on the **Developer mode** toggle in the top-right corner.
> 3. Click the **Load unpacked** button in the top-left corner.
> 4. Select the **`dist/chrome`** folder.

> [!IMPORTANT]
> **Loading in Microsoft Edge:**
> 1. Open `edge://extensions/` in your browser.
> 2. Turn on the **Developer mode** toggle in the bottom-left corner.
> 3. Click the **Load unpacked** button in the top-right section.
> 4. Select the **`dist/edge`** folder.

> [!NOTE]
> **Loading in Mozilla Firefox:**
> 1. Open `about:debugging#/runtime/this-firefox` in your browser.
> 2. Click the **Load Temporary Add-on...** button.
> 3. Select the `manifest.json` file inside the **`dist/firefox`** folder.

---

## Previews & Screenshots

<p align="center">
  <b>Settings Menu (Popup Interface)</b><br>
  <img src="assets/Comp%201%20.jpg" width="80%" alt="Settings Menu Popup">
</p>

<br>

<p align="center">
  <b>Split Scroll Pane Layout</b><br>
  <img src="assets/Comp%203%20.jpg" width="80%" alt="Split Scroll Pane Layout">
</p>

<br>

<p align="center">
  <b>Mini Fullscreen Layout</b><br>
  <img src="assets/Comp%202%20.jpg" width="80%" alt="Mini Fullscreen Layout">
</p>
