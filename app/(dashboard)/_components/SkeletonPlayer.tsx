'use client';

/**
 * Skeleton replay. Draws the athlete's tracked pose on its own canvas instead
 * of over the source footage - the burned-in overlay was unreadable whenever
 * the background was busy, which in a gym it always is.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Loader2, Pause, Play, RotateCcw, SkipBack, SkipForward} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ApiClient, type PoseSequence} from '@/lib/api';
import {boundsOf, drawFloor, drawHead, drawPose, fitTransform, type Point} from '@/lib/pose/draw';
import {cn} from '@/lib/utils';

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

const COLOR_BODY = '#e4e6ef';
// Left and right in distinct hues: in a side view the limbs overlap, and one
// colour turns a readable pose into a tangle of crossing lines.
const COLOR_LEFT = '#7dd3fc';
const COLOR_RIGHT = '#fca5a5';
const COLOR_HOT = '#f87171';
const COLOR_FLOOR = 'rgba(148, 163, 184, 0.35)';

function pointsOfFrame(seq: PoseSequence, frameIdx: number): Map<string, Point> {
  const map = new Map<string, Point>();
  const frame = seq.frames[frameIdx];
  if (!frame) return map;
  for (const kp of frame.keypoints) {
    if (!Number.isFinite(kp.x) || !Number.isFinite(kp.y)) continue;
    map.set(kp.name, {x: kp.x, y: kp.y});
  }
  return map;
}

export default function SkeletonPlayer({videoId}: {videoId: string}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [seq, setSeq] = useState<PoseSequence | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  useEffect(() => {
    let cancelled = false;
    ApiClient.getPoseSequence(videoId)
      .then((data) => {
        if (cancelled) return;
        setSeq(data);
        setState(data.frames.length > 0 ? 'ready' : 'unavailable');
        // Frame 0 is usually the athlete walking into position - the least
        // legible frame in the clip, and captioned "between reps".
        const firstRep = data.reps[0];
        if (firstRep) {
          const at = data.frames.findIndex((f) => f.frame_index >= firstRep.window_start_frame);
          if (at > 0) setIndex(at);
        }
      })
      // 404 is the normal case for analyses that predate pose storage, so this
      // degrades to a quiet note rather than an error.
      .catch(() => !cancelled && setState('unavailable'));
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const total = seq?.frames.length ?? 0;

  // One transform for the whole clip: refitting per frame would make the
  // skeleton swim as limbs enter and leave the tracked area.
  const allFramePoints = useMemo(() => {
    if (!seq) return [];
    return seq.frames.map((f) =>
      seq.keypoint_names.map((name) => {
        const kp = f.keypoints.find((k) => k.name === name);
        return kp && Number.isFinite(kp.x) ? {x: kp.x, y: kp.y} : null;
      })
    );
  }, [seq]);

  const bounds = useMemo(() => boundsOf(allFramePoints), [allFramePoints]);

  const ankleIndices = useMemo(() => {
    if (!seq) return [];
    return ['left_ankle', 'right_ankle']
      .map((n) => seq.keypoint_names.indexOf(n))
      .filter((i) => i >= 0);
  }, [seq]);

  /** Which check failures, if any, apply to the rep containing this frame -
   * used to colour the frame and to caption it. */
  const currentRep = useMemo(() => {
    if (!seq) return null;
    const frameIdx = seq.frames[index]?.frame_index;
    if (frameIdx === undefined) return null;
    return (
      seq.reps.find((r) => frameIdx >= r.window_start_frame && frameIdx <= r.window_end_frame) ??
      null
    );
  }, [seq, index]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !seq || !bounds) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const t = fitTransform(bounds, cssW, cssH);
    drawFloor(ctx, allFramePoints, ankleIndices, t, cssW, COLOR_FLOOR);

    const points = pointsOfFrame(seq, index);
    const failing = (currentRep?.failed_checks.length ?? 0) > 0;
    drawHead(ctx, points, t, COLOR_BODY);
    drawPose(ctx, points, t, {
      color: COLOR_BODY,
      leftColor: failing ? COLOR_HOT : COLOR_LEFT,
      rightColor: failing ? COLOR_HOT : COLOR_RIGHT
    });
  }, [seq, bounds, allFramePoints, ankleIndices, index, currentRep]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  // rAF rather than setInterval so playback stays in step with the display
  // and pauses automatically when the tab is backgrounded.
  useEffect(() => {
    if (!playing || !seq || total === 0) return;
    let raf = 0;
    let last: number | null = null;
    const frameMs = 1000 / (seq.fps * speed);

    const tick = (now: number) => {
      if (last === null) last = now;
      const steps = Math.floor((now - last) / frameMs);
      if (steps > 0) {
        last = now;
        setIndex((i) => {
          const next = i + steps;
          if (next >= total) {
            setPlaying(false);
            return total - 1;
          }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, seq, total, speed]);

  const jumpToRep = (repIndex: number) => {
    if (!seq) return;
    const rep = seq.reps.find((r) => r.index === repIndex);
    if (!rep) return;
    const at = seq.frames.findIndex((f) => f.frame_index >= rep.window_start_frame);
    if (at >= 0) {
      setIndex(at);
      setPlaying(false);
    }
  };

  const step = (delta: number) => {
    setPlaying(false);
    setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0)));
  };

  if (state === 'loading') {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (state === 'unavailable' || !seq || !bounds) {
    return null;
  }

  const seconds = (seq.frames[index]?.timestamp_ms ?? 0) / 1000;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Movement replay</CardTitle>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                'rounded-md px-2 py-1 font-mono text-xs tabular-nums transition-colors',
                speed === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {s}×
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <canvas
          ref={canvasRef}
          className="h-72 w-full rounded-lg bg-slate-900 dark:bg-slate-950"
          role="img"
          aria-label={`Skeleton replay, frame ${index + 1} of ${total}`}
        />

        {seq.reps.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {seq.reps.map((rep) => {
              const failed = rep.failed_checks.length > 0;
              const active = currentRep?.index === rep.index;
              return (
                <button
                  key={rep.index}
                  type="button"
                  onClick={() => jumpToRep(rep.index)}
                  title={failed ? `Failed: ${rep.failed_checks.join(', ')}` : 'All checks passed'}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                    failed ? 'border-danger/40 text-danger' : 'border-success/40 text-success',
                    active && 'bg-muted ring-1 ring-primary'
                  )}
                >
                  Rep {rep.index + 1}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => step(-1)} aria-label="Previous frame">
            <SkipBack className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => {
              // Replaying from the end should restart, not sit on the last frame.
              if (index >= total - 1) setIndex(0);
              setPlaying((p) => !p);
            }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => step(1)} aria-label="Next frame">
            <SkipForward className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIndex(0);
              setPlaying(false);
            }}
            aria-label="Restart"
          >
            <RotateCcw className="size-4" />
          </Button>

          <input
            type="range"
            min={0}
            max={Math.max(total - 1, 0)}
            value={index}
            onChange={(e) => {
              setPlaying(false);
              setIndex(Number(e.target.value));
            }}
            aria-label="Scrub through the movement"
            className="h-1 flex-1 cursor-pointer accent-primary"
          />
          <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {seconds.toFixed(2)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{backgroundColor: COLOR_LEFT}} />
            Left side
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{backgroundColor: COLOR_RIGHT}} />
            Right side
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Tracked joint positions, redrawn on their own canvas.{' '}
          {currentRep
            ? currentRep.failed_checks.length > 0
              ? `Rep ${currentRep.index + 1} flagged: ${currentRep.failed_checks
                  .map((c) => c.replace(/_/g, ' '))
                  .join(', ')}.`
              : `Rep ${currentRep.index + 1} passed every check.`
            : 'Between reps.'}
        </p>
      </CardContent>
    </Card>
  );
}
