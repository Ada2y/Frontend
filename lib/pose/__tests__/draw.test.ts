/**
 * The skeleton drawing geometry.
 *
 * Two failure modes matter and both produce a picture that looks fine at a
 * glance: a non-uniform fit, which shows joint angles the athlete never
 * produced, and drawing a bone to a keypoint that was never detected, which
 * sends a limb into the corner of the canvas. Everything here is aimed at
 * those two.
 */
import {describe, expect, it, vi} from 'vitest';

import {
  COCO_SKELETON,
  boneSide,
  boundsOf,
  drawFloor,
  drawHead,
  drawPose,
  fitTransform,
  project,
  type Point
} from '@/lib/pose/draw';

/** Records the calls a real CanvasRenderingContext2D would have received. */
function fakeContext() {
  const lines: {from: [number, number]; to: [number, number]; color: string; width: number}[] = [];
  const arcs: {x: number; y: number; r: number; color: string}[] = [];
  let current: [number, number] = [0, 0];

  const ctx = {
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    globalAlpha: 1,
    _pendingArc: null as null | {x: number; y: number; r: number},
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    beginPath: vi.fn(() => {
      ctx._pendingArc = null;
    }),
    moveTo: vi.fn((x: number, y: number) => {
      current = [x, y];
    }),
    lineTo: vi.fn((x: number, y: number) => {
      lines.push({
        from: current,
        to: [x, y],
        color: String(ctx.strokeStyle),
        width: ctx.lineWidth
      });
    }),
    arc: vi.fn((x: number, y: number, r: number) => {
      ctx._pendingArc = {x, y, r};
    }),
    fill: vi.fn(() => {
      if (ctx._pendingArc) arcs.push({...ctx._pendingArc, color: String(ctx.fillStyle)});
    }),
    stroke: vi.fn(() => {
      if (ctx._pendingArc) arcs.push({...ctx._pendingArc, color: String(ctx.strokeStyle)});
    })
  };

  return {ctx: ctx as unknown as CanvasRenderingContext2D, lines, arcs, raw: ctx};
}

const IDENTITY = {scale: 1, offsetX: 0, offsetY: 0};

function poseMap(entries: Record<string, [number, number]>): Map<string, Point> {
  return new Map(Object.entries(entries).map(([k, [x, y]]) => [k, {x, y}]));
}

const UPRIGHT = poseMap({
  left_shoulder: [100, 100],
  right_shoulder: [140, 100],
  left_hip: [105, 200],
  right_hip: [135, 200],
  left_knee: [105, 300],
  right_knee: [135, 300],
  left_ankle: [105, 400],
  right_ankle: [135, 400]
});

// --- boundsOf --------------------------------------------------------------

describe('boundsOf', () => {
  it('spans every valid point across every frame', () => {
    const bounds = boundsOf([
      [
        {x: 10, y: 20},
        {x: 30, y: 40}
      ],
      [
        {x: 5, y: 50},
        {x: 25, y: 15}
      ]
    ]);
    expect(bounds).toEqual({minX: 5, minY: 15, maxX: 30, maxY: 50});
  });

  it('ignores missing keypoints rather than treating them as the origin', () => {
    const bounds = boundsOf([[null, {x: 10, y: 10}, null, {x: 20, y: 20}]]);
    expect(bounds).toEqual({minX: 10, minY: 10, maxX: 20, maxY: 20});
  });

  it('ignores NaN and Infinity, which would poison every later computation', () => {
    const bounds = boundsOf([
      [
        {x: NaN, y: 5},
        {x: 10, y: 10},
        {x: Infinity, y: 1},
        {x: 20, y: 20}
      ]
    ]);
    expect(bounds).toEqual({minX: 10, minY: 10, maxX: 20, maxY: 20});
  });

  it('returns null when there is nothing to draw', () => {
    expect(boundsOf([])).toBeNull();
    expect(boundsOf([[null, null]])).toBeNull();
  });
});

// --- fitTransform ----------------------------------------------------------

describe('fitTransform', () => {
  it('uses one scale for both axes, so joint angles survive the fit', () => {
    // A tall, narrow box in a wide canvas: a per-axis fit would stretch it
    // horizontally and change every angle in the skeleton.
    const t = fitTransform({minX: 0, minY: 0, maxX: 100, maxY: 400}, 800, 400, 0);

    const a = project({x: 0, y: 0}, t);
    const b = project({x: 100, y: 0}, t);
    const c = project({x: 0, y: 400}, t);
    expect((b.x - a.x) / 100).toBeCloseTo((c.y - a.y) / 400, 10);
  });

  it('keeps the whole pose inside the canvas including its padding', () => {
    const bounds = {minX: 0, minY: 0, maxX: 100, maxY: 200};
    const t = fitTransform(bounds, 300, 300, 24);

    for (const p of [
      {x: bounds.minX, y: bounds.minY},
      {x: bounds.maxX, y: bounds.maxY}
    ]) {
      const q = project(p, t);
      expect(q.x).toBeGreaterThanOrEqual(24 - 1e-6);
      expect(q.x).toBeLessThanOrEqual(300 - 24 + 1e-6);
      expect(q.y).toBeGreaterThanOrEqual(24 - 1e-6);
      expect(q.y).toBeLessThanOrEqual(300 - 24 + 1e-6);
    }
  });

  it('centres the pose in the canvas', () => {
    const t = fitTransform({minX: 0, minY: 0, maxX: 100, maxY: 100}, 400, 200, 0);
    const centre = project({x: 50, y: 50}, t);
    expect(centre.x).toBeCloseTo(200);
    expect(centre.y).toBeCloseTo(100);
  });

  it('survives a degenerate zero-size box without dividing by zero', () => {
    const t = fitTransform({minX: 50, minY: 50, maxX: 50, maxY: 50}, 200, 200, 10);
    expect(Number.isFinite(t.scale)).toBe(true);
    const q = project({x: 50, y: 50}, t);
    expect(Number.isFinite(q.x)).toBe(true);
    expect(Number.isFinite(q.y)).toBe(true);
  });

  it('shrinks a pose larger than the canvas rather than cropping it', () => {
    const t = fitTransform({minX: 0, minY: 0, maxX: 4000, maxY: 4000}, 200, 200, 0);
    expect(t.scale).toBeLessThan(1);
  });
});

// --- drawPose --------------------------------------------------------------

describe('drawPose', () => {
  it('draws every bone when the whole skeleton is present', () => {
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {color: '#fff'});

    const drawable = COCO_SKELETON.filter(([a, b]) => UPRIGHT.has(a) && UPRIGHT.has(b));
    expect(lines).toHaveLength(drawable.length);
  });

  it('skips a bone whose endpoint was never detected', () => {
    // The bug this guards: a missing keypoint drawn at (0,0) sends the limb
    // shooting into the corner of the canvas.
    const partial = new Map(UPRIGHT);
    partial.delete('left_ankle');

    const {ctx, lines} = fakeContext();
    drawPose(ctx, partial, IDENTITY, {color: '#fff'});

    const shank = lines.find(
      (l) =>
        (l.from[0] === 105 && l.from[1] === 300 && l.to[1] === 400) ||
        (l.to[0] === 105 && l.to[1] === 300 && l.from[1] === 400)
    );
    expect(shank).toBeUndefined();
    expect(lines.every((l) => l.to[0] !== 0 || l.to[1] !== 0)).toBe(true);
  });

  it('draws nothing at all for an empty pose', () => {
    const {ctx, lines, arcs} = fakeContext();
    drawPose(ctx, new Map(), IDENTITY, {color: '#fff'});
    expect(lines).toHaveLength(0);
    expect(arcs).toHaveLength(0);
  });

  it('emphasises the joints a check actually judged', () => {
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {
      color: '#aaa',
      highlight: new Set(['left_knee']),
      highlightColor: '#f00',
      lineWidth: 4
    });

    const hot = lines.filter((l) => l.color === '#f00');
    expect(hot.length).toBeGreaterThan(0);
    for (const line of hot) expect(line.width).toBeGreaterThan(4);
  });

  it('leaves bones the check did not judge in the base colour', () => {
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {
      color: '#aaa',
      highlight: new Set(['left_knee']),
      highlightColor: '#f00'
    });
    expect(lines.some((l) => l.color === '#aaa')).toBe(true);
  });

  it('applies the transform to what it draws', () => {
    const {ctx, lines} = fakeContext();
    drawPose(
      ctx,
      poseMap({left_hip: [10, 20], left_knee: [10, 30]}),
      {scale: 2, offsetX: 5, offsetY: 7},
      {color: '#fff'}
    );

    expect(lines).toHaveLength(1);
    expect(lines[0].from).toEqual([25, 47]);
    expect(lines[0].to).toEqual([25, 67]);
  });

  it('dashes the target pose so it cannot be mistaken for something that happened', () => {
    const {ctx, raw} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {color: '#0af', dashed: true});
    expect(raw.setLineDash).toHaveBeenCalledWith([8, 6]);
  });

  it('restores the context so alpha and dashes never leak into the next pose', () => {
    const {ctx, raw} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {color: '#fff', alpha: 0.5, dashed: true});
    expect(raw.save).toHaveBeenCalled();
    expect(raw.restore).toHaveBeenCalled();
  });
});

// --- drawHead --------------------------------------------------------------

describe('drawHead', () => {
  it('draws nothing when no face keypoint was detected', () => {
    const {ctx, arcs} = fakeContext();
    drawHead(ctx, UPRIGHT, IDENTITY, '#fff');
    expect(arcs).toHaveLength(0);
  });

  it('centres the head on the face centroid, which is stabler than any one point', () => {
    const withFace = new Map(UPRIGHT);
    withFace.set('left_eye', {x: 110, y: 60});
    withFace.set('right_eye', {x: 130, y: 60});

    const {ctx, arcs} = fakeContext();
    drawHead(ctx, withFace, IDENTITY, '#fff');

    expect(arcs).toHaveLength(1);
    expect(arcs[0].x).toBeCloseTo(120);
    expect(arcs[0].y).toBeCloseTo(60);
  });

  it('scales the head with the athlete rather than fixing it in pixels', () => {
    const withFace = new Map(UPRIGHT);
    withFace.set('nose', {x: 120, y: 60});

    const small = fakeContext();
    drawHead(small.ctx, withFace, IDENTITY, '#fff');
    const large = fakeContext();
    drawHead(large.ctx, withFace, {scale: 3, offsetX: 0, offsetY: 0}, '#fff');

    expect(large.arcs[0].r).toBeGreaterThan(small.arcs[0].r);
  });
});

// --- drawFloor -------------------------------------------------------------

describe('drawFloor', () => {
  it('puts the ground at the lowest ankle seen anywhere in the clip', () => {
    // y grows downwards, so "lowest" is the largest y - and it must come from
    // the whole sequence, or the floor would jump about during playback.
    const frames = [
      [
        {x: 0, y: 300},
        {x: 0, y: 310}
      ],
      [
        {x: 0, y: 380},
        {x: 0, y: 350}
      ]
    ];
    const {ctx, lines} = fakeContext();
    drawFloor(ctx, frames, [0, 1], IDENTITY, 500, '#888');

    expect(lines).toHaveLength(1);
    expect(lines[0].from[1]).toBe(380);
    expect(lines[0].to).toEqual([500, 380]);
  });

  it('draws no floor when no ankle was ever detected', () => {
    const {ctx, lines} = fakeContext();
    drawFloor(ctx, [[null, null]], [0, 1], IDENTITY, 500, '#888');
    expect(lines).toHaveLength(0);
  });
});

// --- left/right distinction ------------------------------------------------

describe('per-side colouring', () => {
  it('draws left and right limbs in different colours', () => {
    // In a side view the limbs overlap; one colour turns a readable pose into
    // a tangle of crossing lines.
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {
      color: '#fff',
      leftColor: '#0af',
      rightColor: '#fa0'
    });

    expect(lines.some((l) => l.color === '#0af')).toBe(true);
    expect(lines.some((l) => l.color === '#fa0')).toBe(true);
  });

  it('puts a bone spanning the body in the neutral colour', () => {
    // shoulder-to-shoulder and hip-to-hip belong to neither side.
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {color: '#fff', leftColor: '#0af', rightColor: '#fa0'});

    expect(lines.some((l) => l.color === '#fff')).toBe(true);
  });

  it('falls back to one colour when no sides are given', () => {
    // The target-pose ghost is one object, not two limbs.
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {color: '#0af'});

    expect(lines.every((l) => l.color === '#0af')).toBe(true);
  });

  it('classifies bones by side', () => {
    expect(boneSide('left_hip', 'left_knee')).toBe('left');
    expect(boneSide('right_knee', 'right_ankle')).toBe('right');
    // spans the body - the pelvis line belongs to neither side
    expect(boneSide('left_hip', 'right_hip')).toBe('centre');
    expect(boneSide('left_shoulder', 'right_shoulder')).toBe('centre');
    expect(boneSide('nose', 'nose')).toBe('centre');
  });

  it('still lets a failing check override the side colours', () => {
    const {ctx, lines} = fakeContext();
    drawPose(ctx, UPRIGHT, IDENTITY, {
      color: '#fff',
      leftColor: '#0af',
      rightColor: '#fa0',
      highlight: new Set(['left_knee']),
      highlightColor: '#f00'
    });

    expect(lines.some((l) => l.color === '#f00')).toBe(true);
  });
});
