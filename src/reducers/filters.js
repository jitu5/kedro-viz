import { FILTER_NODES, RESET_FILTER_NODES } from '../actions/filters';

// Reducer for filtering nodes
const filterNodesReducer = (filterState = {}, action) => {
  const updateState = (newState) => Object.assign({}, filterState, newState);

  switch (action.type) {
    case FILTER_NODES:
      return updateState({
        from: action.filters.from,
        to: action.filters.to,
      });
    case RESET_FILTER_NODES:
      return {};
    default:
      return filterState;
  }
};

export default filterNodesReducer;