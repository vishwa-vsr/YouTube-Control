# Contributing to YouTube Control

Thanks for your interest in improving YouTube Control! This guide covers everything you need to get started.

## Code of Conduct

Be respectful and constructive. We follow the spirit of the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/):

- **Be kind** — assume good intent, give helpful feedback, accept it gracefully.
- **Be inclusive** — welcome newcomers, avoid exclusionary language.
- **Be constructive** — if you disagree, explain why and suggest alternatives.

Harassment, trolling, or personal attacks will not be tolerated.

---

## How to Contribute

### 1. Find or Create a GitHub Issue

Every pull request **must** be linked to a [GitHub Issue](https://github.com/vishwa-vsr/YouTube-Control/issues).

- **Found a bug?** [Open a Bug Report](https://github.com/vishwa-vsr/YouTube-Control/issues/new?labels=bug).
- **Have a feature idea?** [Open a Feature Request](https://github.com/vishwa-vsr/YouTube-Control/issues/new?labels=enhancement).
- **Want to work on an existing issue?** Comment on the issue to let us know.

> [!IMPORTANT]
> Please wait for confirmation before starting work on large features. This prevents duplicate effort and ensures the feature fits the project direction.

### 2. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/YouTube-Control.git
cd YouTube-Control
```

### 3. Create a Branch

```bash
git checkout -b your-branch-name
```

Name your branch however you like — just keep it descriptive.

### 4. Make Your Changes

> [!CAUTION]
> **Only edit files inside `src/`.** Never modify files in `dist/`, `releases/`, or build artifacts. Those are generated automatically by the build script and will be overwritten.

Your working files:

| File | What It Does |
|:---|:---|
| `src/manifest.json` | Extension configuration (permissions, content scripts, version) |
| `src/content.css` | CSS styles injected into YouTube pages |
| `src/content.js` | JavaScript injected into YouTube pages |
| `src/popup.html` | Settings panel HTML structure |
| `src/popup.css` | Settings panel styling |
| `src/popup.js` | Settings panel logic |

### 5. Build & Test Locally

Compile the source into browser-ready packages:

```bash
python build.py -y
```

Then load the extension in your browser for testing (see the Testing Checklist below).

### 6. Commit & Push

Write clear, descriptive commit messages. No strict format required — just make it easy to understand what changed and why.

```bash
git add .
git commit -m "fix sidebar not hiding in theater mode"
git push origin your-branch-name
```

### 7. Open a Pull Request

- Go to your fork on GitHub and click **"Compare & pull request"**.
- Reference the related issue (e.g., `Fixes #10` or `Closes #7`).
- Describe what you changed and why.
- Include before/after screenshots if you changed anything visual.

---

## Code Style Guidelines

### CSS (`content.css`)

- **Follow the section numbering system.** The CSS is organized into numbered sections (e.g., `/* 14. WEB FULLSCREEN (MINI-FULLSCREEN) FEATURE */`). Place your styles in the correct section, or create a new numbered section if adding a new feature.
- **Use `!important` sparingly.** Only use it when overriding YouTube's inline styles or specificity conflicts. Don't blanket every property with it.
- **Use the `.yt-` class prefix** for classes added by the extension (e.g., `.yt-web-fullscreen-active`, `.yt-hide-header`).
- **Keep selectors specific.** Prefer `.yt-web-fullscreen-active #player` over broad element selectors that could clash with YouTube's own styles.

### JavaScript (`content.js`)

- **Use `cachedSettings`** for reading extension settings. Don't call `chrome.storage` directly in hot paths.
- **Use `dispatchResize()`** when toggling layout changes that affect YouTube's player dimensions.
- **Follow the existing listener patterns** — `document.addEventListener` with capture phase (`true`) for keyboard/click handlers that need priority.
- **Keep functions small and focused.** One function per feature action (e.g., `toggleMiniFullscreen()`, `captureScreenshot()`).

### General

- Use **2-space indentation** consistently.
- Add comments for non-obvious logic.
- Don't remove existing comments that you didn't write, unless they're about code you're replacing.

---

## Testing Checklist

Before submitting your PR, manually verify your changes work correctly:

- [ ] **Build succeeds** — `python build.py -y` runs without errors.
- [ ] **Load unpacked** — Load `dist/chrome` (or `dist/firefox`, `dist/edge`) as an unpacked extension in your browser.
- [ ] **Default View** — Test your change on a YouTube video page in the default (non-theater) layout.
- [ ] **Cinema / Theater Mode** — Press `T` on a video page to switch to Cinema Mode and verify your change still works.
- [ ] **Mini Fullscreen** — Click the Mini Fullscreen button and verify nothing breaks.
- [ ] **Toggle ON/OFF** — If your change relates to a popup setting, toggle it ON and OFF from the extension popup and verify it applies/removes correctly without a page refresh.
- [ ] **Console clean** — Open the browser DevTools console (`F12` → Console tab) and check there are no new JavaScript errors.
- [ ] **Other features intact** — Make sure your change doesn't break unrelated features. Quick-check a few toggles in the popup.

---

## Questions?

Open a [Discussion](https://github.com/vishwa-vsr/YouTube-Control/issues) or comment on the relevant issue. We're happy to help!
