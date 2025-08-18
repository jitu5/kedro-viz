// eslint-disable-next-line import/no-webpack-loader-syntax
import GraphWorker from './graph-worker.js'; // processed by worker-loader rule

// src/utils/worker.blob.js
const isTest = typeof jest !== 'undefined';

const createWorker = () => new GraphWorker(); // options are set via loader `worker:{…}`

const createMockWorker = (factory) => {
  if (!isTest) {
    return factory;
  }
  return () => {
    const mockWorker = {
      terminate: () => {},
      onmessage: null,
      postMessage: async (payload) => {
        const impl = require('./graph-worker.js');
        const fn = impl.graph || impl.default || (() => undefined);
        const result = await fn(payload);
        setTimeout(() => mockWorker.onmessage?.({ data: result }), 0);
      },
    };
    return mockWorker;
  };
};

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
