/**
 * Web Worker file for graph layout calculations
 * This file exports the graph layout functions to be used in a Web Worker context
 */

import { graphNew } from './graph';

// Export the graph layout function for use in the worker
export { graphNew };