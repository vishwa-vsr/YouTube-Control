# <img src="assets/logo.png" width="38" height="38" valign="middle"> YouTube Control: Shorts Blocker & Detox

A beautiful, premium, and distraction-free browser extension that helps you reclaim your focus on YouTube. Tailor your learning environment by toggling visual elements off or blurring bait thumbnails.

---

## Features

- **Calm Meter**: A signature visual progress ring that tracks how calm and focus-friendly your setup is.
- **Custom Hiding**: Selectively hide individual distracting features:
  - Home Page Video Feed
  - Left Navigation Sidebar (Subscriptions, Explore, Trending)
  - Shorts & Playables (Games)
  - Recommended Videos Sidebar on watch page
  - Comments Section and Live Chat
  - Action Buttons (Likes count, views count, subscribe button)
  - Top Navigation Header and Search Box
- **Black & White Mode**: Make the entire YouTube page (including the video player) grayscale to lower visual stimulation.
- **Blur Thumbnails**: Soften thumbnail images until hovered to block clickbait.
- **Video Screenshot Button**: Save a clean frame capture as a PNG directly named after the video title, with a white visual shutter flash feedback.
- **Mini Fullscreen Mode**: Expand the video player to fill the viewport while keeping the browser tabs, search, and bookmarks active.
- **Sticky Video Player (Split Pane Layout)**: lock the browser scrolling, locking the video player on the top-left while recommended sidebars and comments scroll independently.

---

## Folder Structure

```
youtube control/
├── CHANGELOG.md      # History of version updates
├── build.py          # Script to minify code and create Firefox/Chrome packages
├── src/              # Source code directory (where you make edits)
│   ├── manifest.json # Extension configuration blueprint
│   ├── popup.html    # Settings panel interface
│   ├── popup.css     # Settings panel visual styling (Calm Obsidian dark theme)
│   ├── popup.js      # Settings panel controller logic & Calm Meter animation
│   ├── content.js    # Script injecting class tags into YouTube
│   └── content.css   # Hiding styles injected into YouTube
├── dist/             # Minified, ready-to-load Chrome/Edge build (Generated)
└── firefox/          # Minified, ready-to-load Firefox build (Generated)
```

---

## Getting Started

### 1. Build the Extension
To compile and minify the source code into optimized browser packages, run this command in your command line:
```bash
python build.py -y
```

### 2. Loading the Extension

#### Google Chrome / Chromium (Edge, Brave, Opera)
1. Go to `chrome://extensions/` in your browser.
2. Turn on **Developer mode** (top right toggle).
3. Click **Load unpacked** (top left button).
4. Select the **`dist`** folder inside this directory.

#### Mozilla Firefox
1. Go to `about:debugging#/runtime/this-firefox` in your browser.
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file inside the **`firefox`** folder inside this directory.

---

## Previews & Screenshots

### Settings Menu (Popup)
![Settings Menu](assets/Comp%201%20.jpg)

### Split Pane Independent Scrolling
![Split Scroll Pane Layout](assets/Comp%203%20.jpg)

### Mini Fullscreen Layout
![Mini Fullscreen](assets/Comp%202%20.jpg)
