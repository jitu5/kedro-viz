import { createSelector } from 'reselect';

const getEdgeIDs = (state) => state.edge.ids;
const getEdgeSources = (state) => state.edge.sources;
const getEdgeTargets = (state) => state.edge.targets;
const getFromNodes = (state) => state.slice.from;
const getToNodes = (state) => state.slice.to;

/**
 * Selector to get all edges formatted as an array of objects with id, source, and target properties.
 * @param {Object} state - The global state object.
 * @returns {Array} An array of edge objects.
 */
const getEdges = createSelector(
  [getEdgeIDs, getEdgeSources, getEdgeTargets],
  (edgeIDs, edgeSources, edgeTargets) =>
    edgeIDs.map((id) => ({
      id,
      source: edgeSources[id],
      target: edgeTargets[id],
    }))
);

/**
 * Selector to organize edges by their source and target nodes.
 * @param {Array} edges - Array of edge objects.
 * @returns {Object} An object containing edges mapped by source and target nodes.
 */

export const getEdgesByNode = createSelector([getEdges], (edges) => {
  const sourceEdges = {};
  const targetEdges = {};

  for (const edge of edges) {
    if (!sourceEdges[edge.target]) {
      sourceEdges[edge.target] = [];
    }

    sourceEdges[edge.target].push(edge.source);

    if (!targetEdges[edge.source]) {
      targetEdges[edge.source] = [];
    }

    targetEdges[edge.source].push(edge.target);
  }

  return { sourceEdges, targetEdges };
});

/**
 * Recursive function to find all linked nodes starting from a given node ID.
 * @param {string} nodeID - The starting node ID.
 * @param {Object} edgesByNode - A map of node IDs to their connected node IDs.
 * @param {Object} visited - A map to keep track of visited nodes.
 * @returns {Object} A map of visited nodes.
 */

const findLinkedNodes = (nodeID, edgesByNode, visited) => {
  if (!visited[nodeID]) {
    visited[nodeID] = true;
    if (edgesByNode[nodeID]) {
      edgesByNode[nodeID].forEach((nodeID) =>
        findLinkedNodes(nodeID, edgesByNode, visited)
      );
    }
  }

  return visited;
};

const findNodesInBetween = (sourceEdges, startID, endID) => {
  if (!startID || !endID) {
    return [startID, endID].filter(Boolean);
  }

  const linkedNodesBeforeEnd = {};
  findLinkedNodes(endID, sourceEdges, linkedNodesBeforeEnd);

  const linkedNodeBeforeStart = {};
  findLinkedNodes(startID, sourceEdges, linkedNodeBeforeStart);

  let filteredNodeIDs = Object.keys(linkedNodesBeforeEnd);

  if (filteredNodeIDs.includes(startID) && filteredNodeIDs.includes(endID)) {
    // Remove any nodes before startID not including startID itself
    Object.keys(linkedNodeBeforeStart).forEach((node) => {
      if (node !== startID) {
        const index = filteredNodeIDs.indexOf(node);
        if (index > -1) {
          filteredNodeIDs.splice(index, 1);
        }
      }
    });
  } else {
    // If startID and endID are not connected, return only them
    filteredNodeIDs = [startID, endID];
  }

  return filteredNodeIDs;
};

/**
 * Selector to filter nodes that are connected between two specified node IDs.
 * @param {Object} edgesByNode - Edges organized by node IDs.
 * @param {string} startID - Starting node ID.
 * @param {string} endID - Ending node ID.
 * @returns {Array} Array of node IDs that are connected from startID to endID.
 */

export const getSlicedPipeline = createSelector(
  [getEdgesByNode, getFromNodes, getToNodes],
  ({ sourceEdges, targetEdges }, startID, endID) => {
    return findNodesInBetween(sourceEdges, startID, endID);
  }
);