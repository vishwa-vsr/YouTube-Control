# Contributing to YouTube Control

Thank you for your interest in improving YouTube Control! This guide walks you through setting up your development environment, our architectural principles, and submitting a pull request.

---

## Code of Conduct

* Be respectful, collaborative, and constructive.
* Keep discussions focused on concrete problems and verified solutions.
* Harassment or hostile language will not be tolerated.

---

## Development Prerequisites

* **[Git](https://git-scm.com/)**
* **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
* **[Python](https://www.python.org/)** (v3.8 or higher)

---

## Local Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR-USERNAME/YouTube-Control.git
cd YouTube-Control
npm install
```

### 2. Create a Topic Branch
Use standard branch prefixes:
```bash
# For bug fixes:
git checkout -b fix/issue-description

# For new features:
git checkout -b feat/feature-name
```

### 3. Build & Watch
All source code lives in `src/`. Never manually edit files in `dist/` or `releases/` (these are automatically generated).

```bash
# Compile and bundle code to dist/
python build.py -y

# Run the automated test suite
npm test
```

Load the unpacked extension from **`dist/chrome`** in your browser's extension manager (`chrome://extensions`).

---

## Architecture & Code Organization

YouTube Control uses an encapsulated, modular architecture:

| Path | Responsibility |
| :--- | :--- |
| `src/modules/settings-schema.js` | **Single Source of Truth** for settings keys, default values, master/child switch rules, and CSS class mappings. |
| `src/modules/comment-canvas.js` | Text wrapping, coordinate calculations, avatar fetching, threadline geometry, and clipboard export. |
| `src/modules/speed-controller.js` | Video rate cycling, speed memory persistence, and player event listener isolation. |
| `src/modules/watch-navigation.js` | YouTube Polymer navigation events (`yt-navigate-*`, `popstate`), video ID tracking, and staggered scroll resets. |
| `src/content.js` | Main entry script. Injects buttons and coordinates modules. |
| `src/content.css` | Injected CSS rules hiding elements, fixing layouts, and accelerating scroll panes. |
| `src/popup.js` | Popup menu controller. Automatically binds UI rows via `settings-schema.js`. |
| `test/*.js` | Unit tests and regression suites runnable offline via `npm test`. |

---

## Critical Project Guardrails

When modifying code, you **must** adhere to these strict invariants:

1. **DOM Element Hiding**:
   * **Never replace JavaScript DOM manipulation functions (such as `hideSidebarElements()`) with pure CSS `:has()` selectors.**
   * *Why*: YouTube dynamically inserts custom Polymer components. Elements like Shorts buttons often lack anchor tags at initial render, making pure CSS `:has()` unreliable.
2. **Dropdown Automation**:
   * Always simulate the full user interaction sequence (open dropdown ➔ click menu item ➔ close dropdown). Browsers ignore `.click()` dispatched on hidden dropdown items.
3. **Sub-Toggle Consistency**:
   * When adding master/sub switch options, always register sub-toggle keys in `defaultTrueKeys` in `src/modules/settings-schema.js`.
4. **Typography & Aesthetics**:
   * Preserve the project font pairing: **`Outfit`** for headings and titles; **`Plus Jakarta Sans`** for options and descriptions.
5. **Changelog Integrity**:
   * Keep `CHANGELOG.md` strictly user-facing. Never overwrite feature release notes with internal developer notes or refactor logs.

---

## Testing Checklist

Before opening a pull request, verify that every item passes:

- [ ] **Automated Tests Pass**: `npm test` runs with 0 errors across all 6 test suites.
- [ ] **Clean Build**: `python build.py -y` compiles cleanly with zero bundler errors.
- [ ] **Standard Video View**: Video pages render and play normally without layout clipping.
- [ ] **Theater / Cinema Mode (`T`)**: Switching modes does not cause black screens or container traps.
- [ ] **Mini Fullscreen (`Esc` / `T`)**: Expands and restores without layout distortion.
- [ ] **Setting Toggles**: Toggling your feature ON and OFF in the popup applies and reverts changes immediately without needing a full page refresh.
- [ ] **Console Inspection**: No uncaught JavaScript errors or unhandled promise rejections appear in the DevTools console (`F12`).

---

## Submitting a Pull Request

1. Commit changes using clear, conventional commit messages:
   ```bash
   git add src/ test/
   git commit -m "fix(comments): resolve emoji picker width in narrow sidebars"
   ```
2. Push your topic branch to your fork:
   ```bash
   git push origin fix/your-fix-name
   ```
3. Open a Pull Request against the `master` branch on GitHub.
4. Include a concise summary of the change, linking the relevant issue (e.g., `Fixes #14`).
5. Include a screenshot or short screen recording for any user-facing visual changes.
