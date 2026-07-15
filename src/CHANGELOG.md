# Changelog

All notable changes to the **YouTube Control: Shorts Blocker & Detox** extension will be documented in this file.

---

## [1.0.0] - 2026-06-28

### Added
- **Phase 1 Elements**:
  - Hides home feed, sidebar links, comments, playables, and recommended videos using clean stylesheet filters.
  - Hides subscribe button, action buttons, likes count, and views count.
  - Hides top navigation header and search box.
  - Adds grayscale mode (keeps video player in full color to preserve video quality).
  - Adds hover-to-reveal thumbnail blurring.
- **Calm Meter**: Custom settings menu signature element showing a progress ring that calculates how clean your setup is.
- **Chrome & Firefox build scripts**: Automated code compiler script (`build.py`) that minifies files (reducing file size by 20%+) and outputs custom Chrome (`dist`) and Firefox (`firefox`) bundles.
- **Documentation**: Initial project `README.md` and `CHANGELOG.md` files.

### Changed
- Organized the project layout:
  - Moved original script files into a central `/source` folder.
  - Redirected build outputs into local `/dist` and `/firefox` directories.
