# Pull Request: Fullscreen Photo Lightbox with Pinch-to-Zoom & Pan (Mobile UX)

## Summary of Changes
Implements an interactive fullscreen photo lightbox to solve photo visibility and zoom difficulties reported by mobile users:

- **Fullscreen Photo Lightbox Component (`src/components/PhotoLightboxModal.tsx`):**
  - Dark, focused fullscreen backdrop (`bg-black/95 backdrop-blur-xl`) giving 100% viewport space to photos.
  - **Multi-Touch Gestures (Mobile):**
    - Pinch-to-zoom: smooth scaling from 1x to 4x.
    - Double-tap: toggles between 1x and 2.5x zoom, centered near the tapped position.
    - Pan / Drag: smoothly move around zoomed-in photos to inspect wheels, rust, dashboard details, and condition.
    - Swipe navigation: swipe left/right when at 1x scale to advance between car photos.
  - **Desktop Controls & Accessibility:**
    - Floating control bar with Zoom In (`+`), Zoom Out (`-`), and Reset (`1x`) buttons.
    - Left/Right chevron navigation buttons.
    - Keyboard shortcuts: `Escape` to close, `ArrowLeft` / `ArrowRight` to change photos, double click to zoom.
    - Prevents background body scroll while open.
- **Card Integration (`src/components/ClueViewer.tsx`):**
  - Tapping or clicking the vehicle photo directly opens the Lightbox.
  - Added dedicated "Ampliar" (`Maximize2`) badge button on the top-right corner of the photo.
  - Cursor changes to `cursor-zoom-in` with subtle hover zoom effect on desktop.
  - Keeps active photo index synchronized between card gallery and lightbox.
- **Unit Tests (`src/components/__tests__/PhotoLightboxModal.test.tsx`):**
  - 3 comprehensive tests verifying rendering, counter, controls, and close behaviors.

## Verification
- Unit Tests: 39 passing in Vitest (`npm test`).
- Production Build: Clean TypeScript compilation and Vite build with 0 errors (`npm run build`).

## Manual Testing Instructions
1. Open http://localhost:5173/ (or inspect with Chrome DevTools Device Mode set to iPhone/Pixel).
2. Tap the vehicle image (or click the "Ampliar" button in the top right of the photo).
3. Verify the fullscreen lightbox opens.
4. Try:
   - Double tapping / double clicking on a detail (wheels, badge) to zoom 2.5x.
   - Dragging the image while zoomed in.
   - Using the Zoom In / Zoom Out / 1x buttons at the bottom.
   - Swiping left/right when at 1x to view other photos.
   - Closing via the `✕` button or `Escape` key.
