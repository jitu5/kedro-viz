import getInitialState, {
  createInitialState,
  mergeLocalStorage,
  preparePipelineState,
  prepareNonPipelineState,
} from './initial-state';
import { saveLocalStorage } from './helpers';
import { localStorageName } from '../config';
import spaceflights from '../utils/data/spaceflights.mock.json';

describe('createInitialState', () => {
  it('returns an object', () => {
    expect(createInitialState()).toEqual(expect.any(Object));
  });
});

describe('mergeLocalStorage', () => {
  it('overrides state values with localstorage values if provided', () => {
    const localStorageValues = {
      textLabels: false,
      theme: 'light',
      tag: { enabled: 'medium' },
      expandAllPipelines: true,
    };
    saveLocalStorage(localStorageName, localStorageValues);
    expect(
      mergeLocalStorage({
        textLabels: true,
        theme: 'dark',
        tag: { enabled: 'large' },
        expandAllPipelines: false,
      })
    ).toMatchObject(localStorageValues);
    window.localStorage.clear();
  });

  it('does not add values if localStorage keys do not match state values', () => {
    const extraValues = {
      additional: 1,
      props: '2',
    };
    expect(mergeLocalStorage(extraValues)).toMatchObject(extraValues);
  });

  it('deep-merges nested objects', () => {
    saveLocalStorage(localStorageName, { foo: { bar: 1, baz: 2 } });
    expect(
      mergeLocalStorage({ quz: 'quux', foo: { bar: 30, foo: 'foo' } })
    ).toMatchObject({ quz: 'quux', foo: { bar: 1, baz: 2, foo: 'foo' } });
  });
});

describe('preparePipelineState', () => {
  const localStorageState = {
    node: { disabled: { abc123: true } },
    pipeline: { active: 'unknown pipeline id' },
  };

  it('applies localStorage values on top of normalised pipeline data', () => {
    saveLocalStorage(localStorageName, localStorageState);
    expect(preparePipelineState(spaceflights)).toMatchObject(localStorageState);
    window.localStorage.clear();
  });

  it('if applyFixes is true and stored active pipeline from localStorage is not one of the pipelines in the current list, uses default pipeline value instead', () => {
    saveLocalStorage(localStorageName, localStorageState);
    const { active } = preparePipelineState(spaceflights, true).pipeline;
    expect(active).toBe(spaceflights.selected_pipeline);
    window.localStorage.clear();
  });
});

describe('prepareNonPipelineState', () => {
  it('applies localStorage values on top of initial state', () => {
    const localStorageState = { theme: 'foo', expandAllPipelines: true };
    saveLocalStorage(localStorageName, localStorageState);
    const state = prepareNonPipelineState({});
    expect(state.theme).toEqual(localStorageState.theme);
    expect(state.expandAllPipelines).toEqual(
      localStorageState.expandAllPipelines
    );
    window.localStorage.clear();
  });

  it('overrides flags with values from URL', () => {
    // In this case, location.href is not provided
    expect(prepareNonPipelineState({ data: spaceflights })).toMatchObject({
      flags: {
        sizewarning: expect.any(Boolean),
      },
    });
  });

  it('overrides expandAllPipelines with values from URL', () => {
    // In this case, location.href is not provided
    expect(prepareNonPipelineState({ data: spaceflights })).toMatchObject({
      expandAllPipelines: expect.any(Boolean),
    });
  });
});

describe('getInitialState', () => {
  const props = { data: spaceflights };

  it('throws an error when data prop is empty', () => {
    expect(() => getInitialState({})).toThrow();
  });

  it('returns an object', () => {
    expect(getInitialState(props)).toEqual(expect.any(Object));
  });

  it('returns full initial state', () => {
    expect(getInitialState(props)).toMatchObject({
      chartSize: {},
      textLabels: true,
      theme: 'dark',
      expandAllPipelines: false,
      display: {
        exportBtn: true,
        labelBtn: true,
        layerBtn: true,
        expandPipelinesBtn: true,
      },
    });
  });

  it('uses prop values instead of defaults if provided', () => {
    expect(
      getInitialState({
        ...props,
        options: { visible: { labelBtn: true }, theme: 'light' },
      })
    ).toMatchObject({
      theme: 'light',
      display: { labelBtn: true },
    });
  });

  it('uses localstorage values instead of defaults if provided', () => {
    const storeValues = {
      textLabels: false,
      theme: 'light',
    };
    saveLocalStorage(localStorageName, storeValues);
    expect(getInitialState(props)).toMatchObject(storeValues);
    window.localStorage.clear();
  });

  it('uses prop values instead of localstorage if provided', () => {
    saveLocalStorage(localStorageName, { theme: 'light' });
    expect(
      getInitialState({ ...props, options: { theme: 'dark' } })
    ).toMatchObject({
      theme: 'dark',
    });
    window.localStorage.clear();
  });
});
