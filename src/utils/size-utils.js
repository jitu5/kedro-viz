/**
 * Determines whether a freshly measured element size is effectively unchanged
 * from the previous measurement, within a sub-pixel tolerance. Used to detect
 * when an (often embedded) chart container has settled to its final size before
 * applying the initial zoom-to-fit.
 * @param {Object} current The latest measured size ({ width, height }).
 * @param {Object} previous The previously measured size ({ width, height }).
 * @param {number} tolerance The allowed per-axis difference in pixels.
 * @returns {boolean} True if both dimensions are non-zero and within tolerance.
 */
export const isSizeStable = (current, previous, tolerance) =>
  current.width > 0 &&
  current.height > 0 &&
  Math.abs(current.width - previous.width) <= tolerance &&
  Math.abs(current.height - previous.height) <= tolerance;
