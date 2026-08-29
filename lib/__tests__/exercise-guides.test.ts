/**
 * The filming-guide catalogue.
 *
 * The failure that matters here is silent: a movement added to the exercise
 * catalogue but not to a category would simply not appear in the Help library,
 * and nothing would look broken - the page would just quietly be missing a
 * movement Ada2y can analyse.
 */
import {describe, expect, it} from 'vitest';

import {FOOTBALL_EXERCISES, GYM_EXERCISES} from '@/lib/api';
import {
  ANGLE_CONFIG,
  ANGLE_STEPS,
  EXERCISE_GUIDES,
  guideCategories,
  guideFor
} from '@/lib/exercise-guides';

describe('exercise guides', () => {
  it('covers every exercise in the catalogue', () => {
    const catalogued = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES].map((e) => e.value);
    const guided = EXERCISE_GUIDES.map((g) => g.value);
    expect(new Set(guided)).toEqual(new Set(catalogued));
  });

  it('keeps the backend view instruction verbatim', () => {
    // This string mirrors the backend's VIEW_GUIDANCE word for word. Rewording
    // it here would tell the athlete to film differently than the analyser
    // expects.
    for (const entry of GYM_EXERCISES) {
      expect(guideFor(entry.value)?.view).toBe(entry.view);
    }
  });

  it('gives every guide steps and a style for its angle', () => {
    for (const guide of EXERCISE_GUIDES) {
      expect(guide.steps).toBe(ANGLE_STEPS[guide.angle]);
      expect(guide.style).toBe(ANGLE_CONFIG[guide.angle]);
      expect(guide.steps.length).toBeGreaterThan(0);
    }
  });

  it('gives every gym exercise a demo clip and a form GIF', () => {
    for (const guide of EXERCISE_GUIDES.filter((g) => g.sport === 'gym')) {
      expect(guide.clip).not.toBeNull();
      expect(guide.gif).not.toBeNull();
    }
  });

  it('returns null for an unknown exercise rather than throwing', () => {
    expect(guideFor(null)).toBeNull();
    expect(guideFor(undefined)).toBeNull();
  });
});

describe('guide categories', () => {
  it('places every guide in exactly one category', () => {
    const placed = guideCategories().flatMap((c) => c.guides.map((g) => g.value));
    expect(placed).toHaveLength(EXERCISE_GUIDES.length);
    expect(new Set(placed).size).toBe(EXERCISE_GUIDES.length);
  });

  it('never produces an empty category', () => {
    for (const category of guideCategories()) {
      expect(category.guides.length).toBeGreaterThan(0);
      expect(category.label).toBeTruthy();
      expect(category.description).toBeTruthy();
    }
  });

  it('separates gym patterns from football movement tasks', () => {
    const categories = guideCategories();
    const football = categories.find((c) => c.key === 'football');
    expect(football?.guides.every((g) => g.sport === 'football')).toBe(true);

    const lower = categories.find((c) => c.key === 'lower_body');
    expect(lower?.guides.map((g) => g.value)).toEqual(['squat', 'deadlift']);
  });

  it('has stable, unique category keys', () => {
    const keys = guideCategories().map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
