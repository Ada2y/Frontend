'use client';

/**
 * "Which one of these is you?"
 *
 * The pipeline picks the athlete by frames x bounding-box area, which is wrong
 * in predictable ways — a standing spotter outscores a lifter lying on a
 * bench, and a coach who stays in shot the whole set outscores an athlete who
 * walks in halfway. Rather than keep tuning that heuristic, the athlete
 * corrects it, and everything is recomputed against their choice.
 *
 * Only rendered when the video actually contains more than one person, so it
 * never asks a question that has one answer.
 */

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {Check, Loader2, Users} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {ApiClient, type AthleteCandidate} from '@/lib/api';
import {cn} from '@/lib/utils';

function CandidateThumb({videoId, filename}: {videoId: string; filename: string}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.fetchEvidenceBlob(videoId, filename)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urlRef.current = url;
        setSrc(url);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [videoId, filename]);

  if (failed || !src) {
    // A missing crop costs this one thumbnail, not the ability to choose.
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-muted">
        {failed ? (
          <Users className="size-6 text-muted-foreground" />
        ) : (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Person detected in this video"
      width={320}
      height={427}
      unoptimized
      sizes="(max-width: 640px) 45vw, 180px"
      className="aspect-[3/4] w-full rounded-lg object-cover"
    />
  );
}

export default function AthletePicker({
  videoId,
  athletes,
  selectedTrackId,
  wasRequested
}: {
  videoId: string;
  athletes: AthleteCandidate[];
  selectedTrackId: number | null;
  wasRequested: boolean;
}) {
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One person means nothing to resolve.
  if (athletes.length < 2) return null;

  async function choose(trackId: number) {
    if (trackId === selectedTrackId) return;
    setPending(trackId);
    setError(null);
    try {
      await ApiClient.selectAthlete(videoId, trackId);
      // The analysis re-runs in the background; the page's existing status
      // polling picks it up from QUEUED.
      window.location.reload();
    } catch (err) {
      setPending(null);
      setError(err instanceof Error ? err.message : 'Could not switch athlete.');
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-foreground">{athletes.length} people in this video</p>
            <p className="text-sm text-muted-foreground">
              {wasRequested
                ? 'Analysed for the person you picked. Choose someone else to re-run it.'
                : 'We analysed whoever was most prominent. If that is not you, pick yourself and we will run it again.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {athletes.map((athlete) => {
            const isSelected = athlete.track_id === selectedTrackId;
            const isPending = pending === athlete.track_id;
            return (
              <button
                key={athlete.track_id}
                type="button"
                onClick={() => choose(athlete.track_id)}
                disabled={pending !== null || isSelected}
                aria-pressed={isSelected}
                className={cn(
                  'group relative flex flex-col gap-2 rounded-xl p-2 text-left transition-colors',
                  isSelected
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'ring-1 ring-foreground/10 hover:bg-muted/50 disabled:opacity-60'
                )}
              >
                {athlete.thumbnail ? (
                  <CandidateThumb videoId={videoId} filename={athlete.thumbnail} />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-muted">
                    <Users className="size-6 text-muted-foreground" />
                  </div>
                )}

                <span className="flex items-center justify-between gap-2 px-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {isSelected ? 'Analysed' : 'This is me'}
                  </span>
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : isSelected ? (
                    <Check className="size-4 text-primary" />
                  ) : null}
                </span>
                {/* On screen for what share of the clip - the honest way to
                    tell two similar-looking crops apart. */}
                <span className="px-0.5 text-xs text-muted-foreground">
                  in shot {Math.round(athlete.coverage * 100)}% of the video
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {pending !== null && !error && (
          <p className="text-sm text-muted-foreground">
            Re-running the analysis for that person — this takes a few minutes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
