/**
 * Skeleton drawing primitives, kept out of the React components so the
 * geometry is unit-testable and shared between the replay player and the
 * correction comparison.
 *
 * Everything here works in *source pixel space* (the normalised video's
 * coordinates, which is what both `pose_frames` and `correction_pose` carry)
 * and projects into canvas space through a single fitted transform. Fitting
 * once over the whole sequence - rather than per frame - is what stops the
 * skeleton swimming around as limbs enter and leave the frame.
 */

export interface Point {
  x: number;
  y: number;
}

/** COCO-17 bone list. The backend sends its own in `skeleton`; this is the
 * fallback for correction poses, which carry names rather than an edge list. */
export const COCO_SKELETON: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle']
];

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Bounding box over every valid point in every frame. Returns null when
 * there is nothing to draw, so callers render an empty state rather than
 * dividing by a zero-sized box. */
export function boundsOf(frames: (Point | null)[][]): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const frame of frames) {
    for (const p of frame) {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (minX === Infinity) return null;
  return {minX, minY, maxX, maxY};
}

/** Uniform (aspect-preserving) fit of `bounds` into a width×height canvas.
 * Aspect must be preserved or the correction becomes a lie - a stretched
 * skeleton shows joint angles that nobody actually produced. */
export function fitTransform(
  bounds: Bounds,
  width: number,
  height: number,
  padding = 24
): Transform {
  const boxW = Math.max(bounds.maxX - bounds.minX, 1);
  const boxH = Math.max(bounds.maxY - bounds.minY, 1);
  const scale = Math.min((width - padding * 2) / boxW, (height - padding * 2) / boxH);
  return {
    scale,
    offsetX: (width - boxW * scale) / 2 - bounds.minX * scale,
    offsetY: (height - boxH * scale) / 2 - bounds.minY * scale
  };
}

export function project(p: Point, t: Transform): Point {
  return {x: p.x * t.scale + t.offsetX, y: p.y * t.scale + t.offsetY};
}

export interface DrawPoseOptions {
  color: string;
  /** Joints to emphasise (the ones a check actually judged). */
  highlight?: Set<string>;
  highlightColor?: string;
  lineWidth?: number;
  jointRadius?: number;
  alpha?: number;
  /** Dashed = "this is the target, not something you did". */
  dashed?: boolean;
}

/**
 * Draws one pose from a name->point map. Bones touching a missing keypoint are
 * skipped entirely: a null keypoint drawn as (0,0) would render a limb
 * shooting into the corner of the canvas.
 */
export function drawPose(
  ctx: CanvasRenderingContext2D,
  points: Map<string, Point>,
  t: Transform,
  opts: DrawPoseOptions
): void {
  const {
    color,
    highlight,
    highlightColor = color,
    lineWidth = 4,
    jointRadius = 4,
    alpha = 1,
    dashed = false
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dashed ? [8, 6] : []);

  for (const [a, b] of COCO_SKELETON) {
    const pa = points.get(a);
    const pb = points.get(b);
    if (!pa || !pb) continue;
    const isHot = !!highlight && (highlight.has(a) || highlight.has(b));
    const qa = project(pa, t);
    const qb = project(pb, t);
    ctx.beginPath();
    ctx.strokeStyle = isHot ? highlightColor : color;
    ctx.lineWidth = isHot ? lineWidth + 1.5 : lineWidth;
    ctx.moveTo(qa.x, qa.y);
    ctx.lineTo(qb.x, qb.y);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  for (const [name, p] of points) {
    const q = project(p, t);
    const isHot = !!highlight && highlight.has(name);
    ctx.beginPath();
    ctx.fillStyle = isHot ? highlightColor : color;
    ctx.arc(q.x, q.y, isHot ? jointRadius + 2.5 : jointRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Head marker. COCO's five face keypoints are noisy individually but their
 * centroid is stable, and a body with no head reads as a stick diagram rather
 * than a person. */
const FACE = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'];

export function drawHead(
  ctx: CanvasRenderingContext2D,
  points: Map<string, Point>,
  t: Transform,
  color: string,
  alpha = 1
): void {
  const face = FACE.map((n) => points.get(n)).filter((p): p is Point => !!p);
  if (face.length === 0) return;
  const cx = face.reduce((s, p) => s + p.x, 0) / face.length;
  const cy = face.reduce((s, p) => s + p.y, 0) / face.length;

  // Size the head off the shoulder span so it scales with the athlete rather
  // than being a fixed pixel blob at every zoom level.
  const ls = points.get('left_shoulder');
  const rs = points.get('right_shoulder');
  const span = ls && rs ? Math.hypot(ls.x - rs.x, ls.y - rs.y) : 40;
  const radius = Math.max(span * 0.45, 8) * t.scale;

  const c = project({x: cx, y: cy}, t);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.arc(c.x, c.y, Math.max(radius, 5), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Ground reference. Without it a floating skeleton gives the eye nothing to
 * judge depth or lean against, which is the whole point of the replay. */
export function drawFloor(
  ctx: CanvasRenderingContext2D,
  frames: (Point | null)[][],
  ankleIndices: number[],
  t: Transform,
  width: number,
  color: string
): void {
  let lowest = -Infinity;
  for (const frame of frames) {
    for (const i of ankleIndices) {
      const p = frame[i];
      if (p && Number.isFinite(p.y) && p.y > lowest) lowest = p.y;
    }
  }
  if (lowest === -Infinity) return;

  const y = project({x: 0, y: lowest}, t).y;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.restore();
}
