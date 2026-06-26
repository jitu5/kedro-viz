/**
 * Node label widths are measured once, synchronously, via getBBox() when the
 * graph layout input is first derived. That measurement is only correct if the
 * chart is actually rendered (not inside a display:none container or a hidden
 * iframe) AND the web font has finished loading. When it isn't, node boxes are
 * mis-sized — and because the measuring selector is memoized, they are never
 * re-measured on their own.
 *
 * createNodeRemeasurer arms itself only when that first measurement was taken
 * under unreliable conditions (container hidden, or web font still loading), and
 * then triggers a single re-measure via `onReady` once BOTH the container is
 * rendered and the font is ready. A normal, visible, font-loaded load does no
 * extra work.
 *
 * @param {Function} getContainer Returns the chart container element, or null.
 * @param {Function} onReady Called once when a reliable re-measure should run.
 * @returns {{ start: Function, check: Function }} start: call on mount.
 *   check: call whenever the container size may have changed (e.g. on resize).
 */
export const createNodeRemeasurer = (getContainer, onReady) => {
  let armed = false;
  let fontsReady = false;
  let done = false;

  const isRendered = () => {
    const element = getContainer();
    return Boolean(element && element.getBoundingClientRect().width > 0);
  };

  const check = () => {
    if (!armed || done || !fontsReady || !isRendered()) {
      return;
    }
    done = true;
    onReady();
  };

  const start = () => {
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    const fontsLoading = Boolean(fonts && fonts.status === 'loading');

    // Only arm if the initial measurement was unreliable: the container was
    // hidden, or the web font had not finished loading.
    armed = !isRendered() || fontsLoading;
    if (!armed) {
      return;
    }

    if (fontsLoading && fonts && fonts.ready) {
      fonts.ready.then(() => {
        fontsReady = true;
        check();
      });
    } else {
      fontsReady = true;
    }

    check();
  };

  return { start, check };
};
