import { isSizeStable } from './flowchart-utils';

describe('isSizeStable', () => {
  const tolerance = 0.5;

  it('returns false when either dimension is zero', () => {
    expect(
      isSizeStable(
        { width: 0, height: 600 },
        { width: 0, height: 600 },
        tolerance
      )
    ).toBe(false);
    expect(
      isSizeStable(
        { width: 800, height: 0 },
        { width: 800, height: 0 },
        tolerance
      )
    ).toBe(false);
  });

  it('returns false when a dimension changed beyond the tolerance', () => {
    expect(
      isSizeStable(
        { width: 800, height: 600 },
        { width: 790, height: 600 },
        tolerance
      )
    ).toBe(false);
    expect(
      isSizeStable(
        { width: 800, height: 600 },
        { width: 800, height: 590 },
        tolerance
      )
    ).toBe(false);
  });

  it('returns true when both dimensions are non-zero and within tolerance', () => {
    expect(
      isSizeStable(
        { width: 800, height: 600 },
        { width: 800, height: 600 },
        tolerance
      )
    ).toBe(true);
  });

  it('treats sub-pixel jitter within tolerance as stable', () => {
    expect(
      isSizeStable(
        { width: 800.3, height: 600.4 },
        { width: 800, height: 600 },
        tolerance
      )
    ).toBe(true);
  });

  it('treats the initial sentinel previous size as not stable', () => {
    expect(
      isSizeStable(
        { width: 800, height: 600 },
        { width: -1, height: -1 },
        tolerance
      )
    ).toBe(false);
  });
});
