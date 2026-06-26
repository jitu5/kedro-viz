import { createNodeRemeasurer } from './node-remeasure';

// A minimal element stub whose measured width we can control.
const makeEl = (width) => ({ getBoundingClientRect: () => ({ width }) });

describe('createNodeRemeasurer', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

  const setDocumentFonts = (fonts) => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      writable: true,
      value: fonts,
    });
  };

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(document, 'fonts', originalDescriptor);
    } else {
      delete document.fonts;
    }
  });

  it('does not re-measure when the container is rendered and fonts are loaded', () => {
    setDocumentFonts({ status: 'loaded' });
    const onReady = jest.fn();
    const remeasurer = createNodeRemeasurer(() => makeEl(800), onReady);
    remeasurer.start();
    remeasurer.check();
    expect(onReady).not.toHaveBeenCalled();
  });

  it('re-measures exactly once when a hidden container later becomes rendered', () => {
    setDocumentFonts({ status: 'loaded' });
    const onReady = jest.fn();
    let width = 0; // mounted hidden
    const remeasurer = createNodeRemeasurer(() => makeEl(width), onReady);
    remeasurer.start();
    remeasurer.check();
    expect(onReady).not.toHaveBeenCalled();
    width = 800; // becomes visible
    remeasurer.check();
    remeasurer.check(); // idempotent
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('re-measures exactly once after the web font finishes loading', async () => {
    let resolveReady;
    const ready = new Promise((resolve) => {
      resolveReady = resolve;
    });
    setDocumentFonts({ status: 'loading', ready });
    const onReady = jest.fn();
    const remeasurer = createNodeRemeasurer(() => makeEl(800), onReady);
    remeasurer.start();
    expect(onReady).not.toHaveBeenCalled();
    resolveReady();
    await ready;
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
