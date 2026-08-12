<p align="center">
  <img src="assets/logo.png" width="96" height="96" alt="YouTube Control Logo">
</p>

<h1 align="center">YouTube Control</h1>
<p align="center"><b>Shorts Blocker & Detox</b></p>
<p align="center"><i>Block Shorts, remove video clutter, and customize YouTube for pure focus.</i></p>

---

## 📥 Store Details & Downloads

| Browser Store | Version | Rating | Active Users |
| :--- | :---: | :---: | :---: |
| [Chrome Web Store](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/v/ljinlboeiainceejndpicabkmheecnfj?color=blue&label=latest)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/rating/ljinlboeiainceejndpicabkmheecnfj?color=blue)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) | [![](https://img.shields.io/chrome-web-store/users/ljinlboeiainceejndpicabkmheecnfj?color=blue&label=users)](https://chromewebstore.google.com/detail/youtube-control-shorts-bl/ljinlboeiainceejndpicabkmheecnfj?hl=en-GB&authuser=0) |
| [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/v/youtube-control?color=orange&label=latest)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/rating/youtube-control?color=orange)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) | [![](https://img.shields.io/amo/users/youtube-control?color=orange)](https://addons.mozilla.org/en-US/firefox/addon/youtube-control/) |
| [Microsoft Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=latest&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=rating&suffix=/5&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) | [![](https://img.shields.io/badge/dynamic/json?label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Ffnimgjdbnocikpjnokpoepgajbaagfki)](https://microsoftedge.microsoft.com/addons/detail/youtube-control-shorts-b/fnimgjdbnocikpjnokpoepgajbaagfki) |


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

## 🛠️ Local Installation & Development

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
