import { mockState } from '../utils/state.mock';
import reducer from '../reducers';

import { FILTER_NODES } from '../actions/filters';
import { getFilteredPipeline } from './filtered-pipeline';

describe('Selectors', () => {
  it('return a filteredPipeline array with any node in between', () => {
    const fromNode = '47b81aa6';
    const toNode = '23c94afb';

    const expected = ['23c94afb', '47b81aa6', 'data_processing'];
    const newState = reducer(mockState.spaceflights, {
      type: FILTER_NODES,
      filters: { from: fromNode, to: toNode },
    });

    const res = getFilteredPipeline(newState);
    expect(res).toEqual(expected);
  });

  it('return onky fromNode and toNode if they are not connected', () => {
    const fromNode = '47b81aa6';
    const toNode = 'f1f1425b';

    const newState = reducer(mockState.spaceflights, {
      type: FILTER_NODES,
      filters: { from: fromNode, to: toNode },
    });

    const res = getFilteredPipeline(newState);
    expect(res).toEqual([fromNode, toNode]);
  });
});