'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Activity} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {ApiClient, FOOTBALL_EXERCISES, GYM_EXERCISES, type VideoListItem} from '@/lib/api';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

function exerciseLabel(exercise: string | null): string | null {
  if (!exercise) return null;
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

export default function BiomechanicsPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.listVideos()
      .then((list) => {
        if (cancelled) return;
        setVideos(list.filter((v) => v.status === 'completed'));
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load videos.');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
          <p className="text-sm text-muted-foreground">
            Movement analysis and coaching feedback from your uploaded videos.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
          <p className="text-sm text-muted-foreground">
            Movement analysis and coaching feedback from your uploaded videos.
          </p>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
          <p className="text-sm text-muted-foreground">
            Movement analysis and coaching feedback from your uploaded videos.
          </p>
        </div>
        <EmptyState
          icon={Activity}
          title="No analyses yet"
          description="Upload a video and it will be processed for movement analysis."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Biomechanics</h1>
        <p className="text-sm text-muted-foreground">
          Movement analysis and coaching feedback from your uploaded videos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {videos.map((v) => {
          const hasFailures = (v.failed ?? 0) > 0;
          return (
            <Link key={v.id} href={`/dashboard/biomechanics/${v.id}`}>
              <Card size="sm" className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm truncate">
                      {exerciseLabel(v.exercise) ?? v.original_filename ?? 'Untitled video'}
                    </CardTitle>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        hasFailures
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-green-500/10 text-green-600'
                      }`}
                    >
                      {hasFailures ? 'Needs work' : 'Good form'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{v.rep_count ?? 0} reps</span>
                    <span>
                      {v.passed ?? 0} passed / {v.failed ?? 0} failed
                    </span>
                    <span>
                      {new Date(v.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {v.headline && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{v.headline}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
