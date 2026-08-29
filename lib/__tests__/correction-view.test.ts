/**
 * The shared correction-view preference.
 *
 * The failure modes worth guarding are all about surviving a hostile
 * environment: a localStorage that throws rather than returning null (Safari
 * private mode, blocked cookies), a stored value written by a different build,
 * and server rendering where there is no localStorage at all.
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  __resetCorrectionView,
  getCorrectionView,
  setCorrectionView,
  subscribeCorrectionView
} from '@/lib/correction-view';

const STORAGE_KEY = 'ada2y:correction-view';

function installStorage(impl: Partial<Storage>) {
  vi.stubGlobal('window', {localStorage: impl});
}

describe('correction view preference', () => {
  beforeEach(() => {
    __resetCorrectionView();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    __resetCorrectionView();
  });

  it('defaults to the skeleton view', () => {
    installStorage({getItem: () => null, setItem: vi.fn()});
    expect(getCorrectionView()).toBe('skeleton');
  });

  it('restores a previously stored view', () => {
    installStorage({getItem: () => 'frame', setItem: vi.fn()});
    expect(getCorrectionView()).toBe('frame');
  });

  it('writes the chosen view to storage', () => {
    const setItem = vi.fn();
    installStorage({getItem: () => null, setItem});

    setCorrectionView('frame');

    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, 'frame');
    expect(getCorrectionView()).toBe('frame');
  });

  it('does not write or notify when the value has not changed', () => {
    const setItem = vi.fn();
    installStorage({getItem: () => null, setItem});
    const listener = vi.fn();
    subscribeCorrectionView(listener);

    setCorrectionView('skeleton'); // already the default

    expect(setItem).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies every subscriber on a change, so all toggles stay in step', () => {
    installStorage({getItem: () => null, setItem: vi.fn()});
    const first = vi.fn();
    const second = vi.fn();
    subscribeCorrectionView(first);
    subscribeCorrectionView(second);

    setCorrectionView('frame');

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    installStorage({getItem: () => null, setItem: vi.fn()});
    const listener = vi.fn();
    const unsubscribe = subscribeCorrectionView(listener);

    unsubscribe();
    setCorrectionView('frame');

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores a stored value that is not a known view', () => {
    // Written by an older or newer build. Handing the renderer a view it cannot
    // draw is worse than falling back to the default.
    installStorage({getItem: () => 'wireframe', setItem: vi.fn()});
    expect(getCorrectionView()).toBe('skeleton');
  });

  it('survives a localStorage that throws on read', () => {
    installStorage({
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: vi.fn()
    });

    // A blocked-storage browser still gets a working toggle - it just forgets
    // the choice between visits.
    expect(() => getCorrectionView()).not.toThrow();
    expect(getCorrectionView()).toBe('skeleton');
  });

  it('survives a localStorage that throws on write, and still updates in memory', () => {
    installStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      }
    });

    expect(() => setCorrectionView('frame')).not.toThrow();
    expect(getCorrectionView()).toBe('frame');
  });

  it('reads storage only once', () => {
    const getItem = vi.fn(() => 'frame');
    installStorage({getItem, setItem: vi.fn()});

    getCorrectionView();
    getCorrectionView();
    getCorrectionView();

    // getSnapshot runs on every render; re-reading storage each time would make
    // it a synchronous disk hit in the render path.
    expect(getItem).toHaveBeenCalledTimes(1);
  });
});
