'use client';

/**
 * Actual vs corrected pose, drawn as vectors on a neutral canvas.
 *
 * The pipeline also bakes this comparison into a JPEG over the source frame,
 * but that version is unreadable on busy footage - gym backgrounds, other
 * athletes in shot, cameras that burn in their own annotations. Redrawing the
 * two poses independently removes the footage from the comparison entirely.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Info} from 'lucide-react';
import {boundsOf, drawHead, drawPose, fitTransform, type Point} from '@/lib/pose/draw';
import type {CorrectionPose, PosePoint} from '@/lib/api';
import {cn} from '@/lib/utils';

const COLOR_ACTUAL = '#f87171';
const COLOR_TARGET = '#38bdf8';

type Mode = 'both' | 'actual' | 'target';

function toMap(points: (PosePoint | null)[]): Map<string, Point> {
  const map = new Map<string, Point>();
  for (const p of points) {
    if (p) map.set(p.name, {x: p.x, y: p.y});
  }
  return map;
}

export default function CorrectionCanvas({correction}: {correction: CorrectionPose}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<Mode>('both');

  const actual = useMemo(() => toMap(correction.actual), [correction.actual]);
  const target = useMemo(() => toMap(correction.target), [correction.target]);
  const highlight = useMemo(() => new Set(correction.highlight), [correction.highlight]);

  // Both poses share one transform, or the comparison is meaningless - two
  // separately-fitted skeletons would hide the very difference we're showing.
  const bounds = useMemo(
    () => boundsOf([correction.actual, correction.target]),
    [correction.actual, correction.target]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;
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

    const t = fitTransform(bounds, cssW, cssH, 28);

    if (mode !== 'actual') {
      // Dashed and behind: the target is a guide, not something that happened.
      drawHead(ctx, target, t, COLOR_TARGET, mode === 'both' ? 0.85 : 1);
      drawPose(ctx, target, t, {
        color: COLOR_TARGET,
        highlight,
        highlightColor: COLOR_TARGET,
        dashed: true,
        alpha: mode === 'both' ? 0.85 : 1
      });
    }
    if (mode !== 'target') {
      drawHead(ctx, actual, t, COLOR_ACTUAL);
      drawPose(ctx, actual, t, {color: COLOR_ACTUAL, highlight, highlightColor: COLOR_ACTUAL});
    }
  }, [bounds, actual, target, highlight, mode]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  if (!bounds) return null;

  const MODES: {value: Mode; label: string}[] = [
    {value: 'both', label: 'Compare'},
    {value: 'actual', label: 'Yours'},
    {value: 'target', label: 'Target'}
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded" style={{backgroundColor: COLOR_ACTUAL}} />
            Your rep
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-0.5 w-4 rounded"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${COLOR_TARGET} 0 4px, transparent 4px 7px)`
              }}
            />
            Target
          </span>
        </div>
        <div className="flex items-center gap-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                mode === m.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="h-64 w-full rounded-lg bg-slate-900 dark:bg-slate-950"
        role="img"
        aria-label={correction.summary ?? 'Your pose compared with the target pose'}
      />

      {correction.summary && (
        <p className="font-mono text-xs tabular-nums text-foreground">{correction.summary}</p>
      )}
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3 shrink-0" />
        Solved from your own frame by rotating only the joint this check measured. A 2D illustration
        of the direction to move in, not an exact biomechanical prescription.
      </p>
    </div>
  );
}
