'use client';

/**
 * Which way the athlete wants to see a correction: redrawn as a skeleton on a
 * neutral canvas, or drawn over the original video frame.
 *
 * Both are real views of the same solved geometry, and neither is right for
 * everyone. The skeleton is far easier to read - it removes the gym background,
 * the other people in shot, and whatever a camera burned into the corner. The
 * video frame is harder to read and much easier to *believe*: it is you, in the
 * room, at the moment being judged, so the correction lands on a body rather
 * than on a diagram.
 *
 * The preference is shared rather than per-check. A report can carry a dozen
 * failed checks, and making someone flip each one individually would turn a
 * preference into a chore.
 *
 * Implemented as a tiny external store instead of React context so any
 * component can read it without the page having to thread a provider through -
 * `useSyncExternalStore` keeps every mounted toggle in step, including ones in
 * separate subtrees.
 */

import {useSyncExternalStore} from 'react';

export type CorrectionView = 'skeleton' | 'frame';

const STORAGE_KEY = 'ada2y:correction-view';
const DEFAULT: CorrectionView = 'skeleton';

function isView(value: unknown): value is CorrectionView {
  return value === 'skeleton' || value === 'frame';
}

let current: CorrectionView = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

/** Reads localStorage once, lazily. Wrapped because Safari's private mode and
 * cookie-blocking settings throw on access rather than returning null. */
function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isView(stored)) current = stored;
  } catch {
    // No stored preference available - the default is a perfectly good answer.
  }
}

/** Exported because `useSyncExternalStore` needs exactly these two, and
 * because they are what makes the store testable without a renderer. */
export function subscribeCorrectionView(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCorrectionView(): CorrectionView {
  hydrate();
  return current;
}

/** The server has no localStorage, so it must render the default. Returning the
 * hydrated value here instead would produce markup the client immediately
 * contradicts, which React reports as a hydration mismatch. */
function getServerSnapshot(): CorrectionView {
  return DEFAULT;
}

export function setCorrectionView(next: CorrectionView): void {
  hydrate();
  if (current === next) return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Preference just won't survive a reload. Not worth telling anyone about.
  }
  for (const listener of listeners) listener();
}

export function useCorrectionView(): [CorrectionView, (next: CorrectionView) => void] {
  const view = useSyncExternalStore(subscribeCorrectionView, getCorrectionView, getServerSnapshot);
  return [view, setCorrectionView];
}

/** Test seam - resets the module state between cases. */
export function __resetCorrectionView(): void {
  current = DEFAULT;
  hydrated = false;
  listeners.clear();
}
