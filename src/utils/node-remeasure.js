/**
 * Node label widths are measured once, synchronously, via getBBox() when the
 * graph layout input is first derived. That measurement returns 0 when the
 * chart isn't actually rendered (for example inside a display:none container or
 * a hidden iframe), which collapses node boxes to icon-only width. Because the
 * measuring selector is memoized, the boxes are never re-measured on their own.
 *
 * createNodeRemeasurer arms itself only when the chart was mounted while it
 * wasn't rendered, and then triggers a single re-measure via `onReady` once the
 * container becomes visible. A normal, already-visible load does nothing, so
 * its first render and zoom-to-fit animation are left exactly as they were.
 *
 * @param {Function} getContainer Returns the chart container element, or null.
 * @param {Function} onReady Called once when a reliable re-measure should run.
 * @returns {{ start: Function, check: Function }} start: call on mount.
 *   check: call whenever the container size may have changed (e.g. on resize).
 */
export const createNodeRemeasurer = (getContainer, onReady) => {
  let armed = false;
  let done = false;

  const isRendered = () => {
    const element = getContainer();
    return Boolean(element && element.getBoundingClientRect().width > 0);
  };

  const check = () => {
    if (!armed || done || !isRendered()) {
      return;
    }
    done = true;
    onReady();
  };

  const start = () => {
    // Only re-measure if the chart was mounted while not rendered (hidden tab,
    // display:none container, or a not-yet-visible iframe). A visible load was
    // measured correctly, so we leave it untouched to keep its default
    // first-render animation.
    armed = !isRendered();
    if (armed) {
      check();
    }
  };

  return { start, check };
};
