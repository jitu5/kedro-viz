/**
 * requestAnimationFrame / cancelAnimationFrame wrappers with a setTimeout
 * fallback for environments where requestAnimationFrame is unavailable. Both
 * helpers gate on the same capability check, so a frame scheduled via one
 * mechanism is always cancelled via the matching one.
 */

const canUseAnimationFrame = () =>
  Boolean(window.requestAnimationFrame && window.cancelAnimationFrame);

/**
 * Schedules a callback on the next animation frame (or via setTimeout fallback).
 * @param {Function} callback The callback to run on the next frame.
 * @returns {number} A handle that can be passed to cancelFrame.
 */
export const requestFrame = (callback) =>
  canUseAnimationFrame()
    ? window.requestAnimationFrame(callback)
    : window.setTimeout(callback, 16);

/**
 * Cancels a frame previously scheduled with requestFrame.
 * @param {number} frame The handle returned by requestFrame.
 */
export const cancelFrame = (frame) => {
  if (canUseAnimationFrame()) {
    window.cancelAnimationFrame(frame);
  } else {
    window.clearTimeout(frame);
  }
};
