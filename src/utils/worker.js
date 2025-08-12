// This file contains any web-workers used in the app, which are inlined by
// webpack + workerize-loader, so that they can be used in the exported library
// without needing any special configuration on the part of the consumer.
// Web workers don't work in Jest, so in a test environment we directly import
// them instead, and then mock up a faux-worker function

/**
 * Resolve the worker file path for both ES modules and CommonJS builds.
 * In modern bundlers (Vite/Webpack 5) `import.meta.url` is defined, and Rollup
 * rewrites the `new URL()` call to point at the emitted worker chunk.
 * When building a CommonJS bundle, `import.meta` is undefined, so fall back to
 * resolving the worker relative to `__dirname`. This ensures that consumers using
 * CommonJS can still load the worker correctly.
 */
const workerPath =
  typeof import.meta !== 'undefined' && import.meta.url
    ? new URL('./graph-worker.js', import.meta.url).href
    : new URL('graph-worker.js', new URL('file:' + __dirname + '/')).href;

/**
 * Emulate a web worker for testing purposes
 */
const createMockWorker = () => {
  const graphModule = require('./graph');
  const mockWorker = {
    terminate: () => {},
  };
  
  Object.keys(graphModule).forEach((name) => {
    mockWorker[name] = (payload) =>
      new Promise((resolve) => resolve(graphModule[name](payload)));
  });
  
  return mockWorker;
};

export const graph = () => {
  // During tests we stub out the Worker API via createMockWorker
  if (process.env.NODE_ENV === 'test') {
    return createMockWorker();
  }
  return new Worker(workerPath, { type: 'module' });
};

/**
 * Manage the worker, avoiding race conditions by terminating running
 * processes when a new request is made, and reinitialising the instance.
 * Example getJob: (instance, payload) => instance.job(payload)
 * @param {Function} worker Init worker and return job functions
 * @param {Function} getJob Callback to select correct job function
 * @return {Function} Function which returns a promise
 */
export function preventWorkerQueues(worker, getJob) {
  let instance = worker();
  let running = false;

  return (payload) => {
    if (running) {
      // If worker is already processing a job, cancel it and restart
      instance.terminate();
      instance = worker();
    }
    running = true;

    return getJob(instance, payload).then((response) => {
      running = false;
      return response;
    });
  };
}
