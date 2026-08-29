/**
 * Everything the app knows about how to film a movement, in one place.
 *
 * This used to live inside the upload page, which was fine while the upload
 * page was the only screen that taught anyone how to film. The Help centre
 * teaches the same thing outside the upload flow, and two copies of "stand your
 * phone 2-3 steps away" drift the moment one of them is edited.
 *
 * The camera angle and the one-line view instruction still come from
 * `lib/api.ts`'s exercise catalogue, which mirrors the backend's own view
 * contract word for word. Only the presentation around them lives here.
 */

import {
  cameraGuideClip,
  exerciseGifUrl,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type CameraAngle,
  type VideoExercise,
  type VideoSport
} from '@/lib/api';

export interface AngleStyle {
  label: string;
  /** An arrow, not an icon component: it points, which is the entire job. */
  icon: string;
  color: string;
  tip: string;
}

export const ANGLE_CONFIG: Record<CameraAngle, AngleStyle> = {
  side: {
    label: 'Side View',
    icon: '→',
    color: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
    tip: 'Stand perpendicular to the athlete. The camera should capture the full range of motion from the side.'
  },
  diagonal: {
    label: '45° Diagonal',
    icon: '↗',
    color: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
    tip: 'Position the camera at roughly a 45-degree angle. This captures both side and front details.'
  },
  front: {
    label: 'Front View',
    icon: '↑',
    color: 'bg-green-500/10 text-green-600 ring-green-500/20',
    tip: 'Face the athlete directly. Ensure the camera captures the full body from head to toe.'
  }
};

/** Placement instructions the demo clip cannot convey on its own (how far, how
 * high, how many reps). Written as ordered steps because users follow a
 * numbered list; an unordered tip grid left them guessing at distances. */
export const ANGLE_STEPS: Record<CameraAngle, string[]> = {
  side: [
    'Stand your phone 2-3 steps to your left or right, facing you straight on.',
    'Put it at hip height - on a bench, a bag or a tripod, not in someone’s hand.',
    'Hold it landscape (sideways) so your head and feet both stay in frame.',
    'Record 3-5 clean reps, then stop.'
  ],
  diagonal: [
    'Stand your phone 2-3 steps away, halfway between your side and your front.',
    'Put it at hip height - on a bench, a bag or a tripod, not in someone’s hand.',
    'Hold it landscape (sideways) so your head and feet both stay in frame.',
    'Record 3-5 clean reps, then stop.'
  ],
  front: [
    'Stand your phone 2-3 steps directly in front of you, facing you.',
    'Put it at hip height - on a bench, a bag or a tripod, not in someone’s hand.',
    'Hold it landscape (sideways) so your head and feet both stay in frame.',
    'Record 3-5 clean reps, then stop.'
  ]
};

export const FILMING_DOS = ['Whole body in frame, head to feet', 'Bright, even lighting'];
export const FILMING_DONTS = [
  'Phone held by hand (shaky)',
  'Zoomed in or filmed from another angle'
];

export interface ExerciseGuide {
  value: VideoExercise;
  label: string;
  sport: VideoSport;
  angle: CameraAngle;
  /** The backend's own one-line instruction for this movement. */
  view: string;
  steps: string[];
  style: AngleStyle;
  /** Demo clip filmed from the required angle, when one exists. */
  clip: {video: string; poster: string} | null;
  /** Looping GIF of the movement done well, when one exists. */
  gif: string | null;
}

function toGuide(
  entry: {value: VideoExercise; label: string; view: string; angle: CameraAngle},
  sport: VideoSport
): ExerciseGuide {
  return {
    ...entry,
    sport,
    steps: ANGLE_STEPS[entry.angle],
    style: ANGLE_CONFIG[entry.angle],
    clip: cameraGuideClip(entry.value),
    gif: exerciseGifUrl(entry.value)
  };
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  ...GYM_EXERCISES.map((e) => toGuide(e, 'gym')),
  ...FOOTBALL_EXERCISES.map((e) => toGuide(e, 'football'))
];

export function guideFor(exercise: VideoExercise | null | undefined): ExerciseGuide | null {
  if (!exercise) return null;
  return EXERCISE_GUIDES.find((g) => g.value === exercise) ?? null;
}

export interface GuideCategory {
  key: string;
  label: string;
  description: string;
  guides: ExerciseGuide[];
}

/**
 * The library, grouped the way someone looking for their movement would look
 * for it: by what they are doing, not by which camera angle it needs.
 *
 * Gym splits by pattern (push / pull / lower body) rather than staying one
 * six-item list, because "where is the bench press?" is answered faster by
 * three short labelled groups than by one alphabetical run.
 */
const GYM_PATTERNS: Record<string, {label: string; description: string; members: string[]}> = {
  lower_body: {
    label: 'Lower body',
    description: 'Squat and hinge patterns, filmed from the side.',
    members: ['squat', 'deadlift']
  },
  push: {
    label: 'Push',
    description: 'Pressing movements, horizontal and overhead.',
    members: ['bench_press', 'push_up', 'shoulder_press']
  },
  pull: {
    label: 'Pull',
    description: 'Pulling movements.',
    members: ['lat_pulldown']
  }
};

export function guideCategories(): GuideCategory[] {
  const categories: GuideCategory[] = [];

  for (const [key, pattern] of Object.entries(GYM_PATTERNS)) {
    const guides = pattern.members
      .map((m) => EXERCISE_GUIDES.find((g) => g.value === m))
      .filter((g): g is ExerciseGuide => Boolean(g));
    if (guides.length > 0) {
      categories.push({key, label: pattern.label, description: pattern.description, guides});
    }
  }

  const football = EXERCISE_GUIDES.filter((g) => g.sport === 'football');
  if (football.length > 0) {
    categories.push({
      key: 'football',
      label: 'Football movement',
      description: 'Movement-quality tasks rather than lifts.',
      guides: football
    });
  }

  // A movement added to the catalogue but not to a pattern above would
  // otherwise vanish from the library entirely - list it rather than lose it.
  const categorised = new Set(categories.flatMap((c) => c.guides.map((g) => g.value)));
  const rest = EXERCISE_GUIDES.filter((g) => !categorised.has(g.value));
  if (rest.length > 0) {
    categories.push({
      key: 'other',
      label: 'Other movements',
      description: 'Everything else Ada2y can analyse.',
      guides: rest
    });
  }

  return categories;
}
