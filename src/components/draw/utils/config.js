export const DURATION = 700;
export const LAYER_NAME_DURATION = 0.05;
export const MARGIN = 500;
export const MIN_SCALE = 0.8;
export const MAX_SCALE = 2;

// The chart container can mount before its (often embedded) host has settled
// its final size. These tune the requestAnimationFrame poll in FlowChart that
// waits for a stable, non-zero size before applying the initial zoom-to-fit.
export const STABLE_SIZE_FRAME_COUNT = 2; // consecutive stable frames required
export const MAX_STABLE_SIZE_ATTEMPTS = 60; // ~1s safety cap at ~60fps
export const SIZE_STABILITY_TOLERANCE = 0.5; // px tolerance for sub-pixel jitter
