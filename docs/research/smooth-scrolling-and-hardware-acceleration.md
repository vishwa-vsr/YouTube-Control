# Research Report: Smooth Scrolling, Hardware Layering, and the Containing Block Trap

## 1. Executive Summary

Applying transform: translateZ(0) to ancestor layout containers causes severe regressions in fullscreen overlays like Theater Max / Web Fullscreen.

According to official W3C specifications, any non-none value for CSS transform forces that element to become the containing block and establish a new stacking context for all descendants, completely overriding the browser viewport for position: fixed elements. Consequently, elements intended to stretch across the viewport are confined to the bounding box of the transformed ancestor.

Furthermore, in modern Chromium (RenderingNG / CompositeAfterPaint), forcing layer promotion via translateZ(0) is an anti-pattern. Modern browsers already composite scrollable overflow containers (overflow-y: auto) on dedicated compositor threads. This report documents the exact specification root causes, Chromium compositor mechanics, and modern platform solutions (overscroll-behavior, will-change: scroll-position, sub-tree containment) that achieve smooth dual-column scrolling with zero visual regressions.

## 2. Root Cause Analysis: The Containing Block and Stacking Context Trap

### 2.1 The W3C Specification Mandate
In standard CSS layout, an element with position: fixed is positioned relative to the initial containing block (the viewport).
However, the W3C CSS Transforms Module Level 1 explicitly mandates that any transform value other than none establishes a containing block for all descendants, including position: fixed descendants, and creates a new stacking context.

### 2.2 What Happened to Theater Max
When Theater Max or Web Fullscreen activates, the player requires position: fixed to fill 100vw and 100vh.
When an ancestor container (such as #primary or #columns) has transform: translateZ(0), the player is trapped inside the bounds of that column, cannot expand, and is visually covered by YouTube background containers.

## 3. Chromium Compositor Architecture: How Modern Scrolling Actually Works
In modern Chromium (RenderingNG), scrolling is decoupled from the main thread and handled by the Compositor Thread. Adding translateZ(0) does not improve performance on modern browsers; instead, it can cause subpixel antialiasing blur on text and unnecessary VRAM consumption.

## 4. Modern Web Platform Alternatives for Dual-Column Scrolling

1. **Native Dual-Pane Layout + overscroll-behavior: contain (Recommended)**
   Prevents scroll chaining without establishing a containing block for position: fixed elements.
2. **Declarative Hardware Hinting via will-change: scroll-position**
   Unlike will-change: transform, will-change: scroll-position does NOT create a containing block for fixed elements.
3. **Subtree Virtualization with content-visibility: auto (Leaf Elements Only)**
   Applied to individual comment cards (ytd-comment-thread-renderer) and video cards (ytd-compact-video-renderer) to skip rendering off-screen elements without affecting container hierarchy.
4. **Passive Event Listeners**
   Marking all wheel and touch listeners as passive: true allows the browser to fast-track scrolling gestures directly on the compositor thread.
5. **Clarifying scroll-behavior: smooth**
   Applies only to programmatic scrolling (element.scrollTo), not physical mouse wheel ticks.

## 5. Primary Source Citations
- W3C CSS Transforms Module Level 1: https://www.w3.org/TR/css-transforms-1/#transform-rendering
- W3C CSS Transforms Module Level 2: https://www.w3.org/TR/css-transforms-2/
- W3C CSS Overscroll Behavior Module Level 1: https://www.w3.org/TR/css-overscroll-1/
- W3C CSS Will Change Module Level 1: https://www.w3.org/TR/css-will-change-1/#will-change
- Chromium RenderingNG: https://developer.chrome.com/docs/chromium/renderingng
