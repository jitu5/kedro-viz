// IMPORTANT: this import is resolved by Webpack at lib build time.
// It bundles the worker and returns a **Blob URL string** at runtime.
// eslint-disable-next-line import/no-webpack-loader-syntax
import workerURL from 'worker-loader?inline=no-fallback&esModule=true&type=module!./graph-worker.js';

// Check for test environment
const isTest = typeof jest !== 'undefined';
const createWorker = () => {
  // Blob URL (same-origin) – no import.meta.url, no external fetch
  return new Worker(workerURL, { type: 'module', name: 'graph-worker' });
};

/**
 * Emulate a worker for tests
 */
const createMockWorker = (workerModule) => {
  if (!isTest) {
    return workerModule;
  }

  return () => {
    const mockWorker = {
      terminate: () => {},
      postMessage: async (payload) => {
        const impl = require('./graph-worker.js');
        const fn = impl.graph || impl.default || (() => {});
        const result = await fn(payload);
        // Simulate async message
        setTimeout(() => {
          if (typeof mockWorker.onmessage === 'function') {
            mockWorker.onmessage({ data: result });
          }
        }, 0);
      },
      onmessage: null,
    };

    return mockWorker;
  };
};

// Export the worker
export const graph = createMockWorker(createWorker);

/**
 * Prevent worker queue conflicts by ensuring only one worker runs at a time
 */
export function preventWorkerQueues(worker) {
  let instance = worker();
  let running = false;

  return (payload) => {
    if (running) {
      instance.terminate(); // Kill the previous worker
      instance = worker(); // Create a new worker
    }
    running = true;

    return new Promise((resolve) => {
      instance.onmessage = (event) => {
        running = false;
        resolve(event.data);
      };
      instance.postMessage(payload);
    });
  };
}
