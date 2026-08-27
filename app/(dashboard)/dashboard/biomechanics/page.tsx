'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Film,
  TrendingUp,
  Video
} from 'lucide-react';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type VideoListItem
} from '@/lib/api';

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function exerciseLabel(exercise: string | null): string | null {
  if (!exercise) return null;
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

function SkeletonPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-80 animate-pulse rounded bg-muted [animation-delay:100ms]" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-10 w-10 animate-pulse rounded bg-muted [animation-delay:100ms]" />
              </div>
              <div className="size-12 animate-pulse rounded-xl bg-muted [animation-delay:150ms]" />
            </div>
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
          <div className="flex items-center gap-4">
            <div className="size-12 animate-pulse rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-60 animate-pulse rounded bg-muted [animation-delay:100ms]" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsRow({videos}: {videos: VideoListItem[]}) {
  const total = videos.length;
  const withIssues = videos.filter((v) => (v.failed ?? 0) > 0).length;
  const clean = total - withIssues;

  const totalPassed = videos.reduce((sum, v) => sum + (v.passed ?? 0), 0);
  const totalChecks = videos.reduce((sum, v) => sum + (v.passed ?? 0) + (v.failed ?? 0), 0);
  const passRate = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Reports
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{total}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Activity className="size-6" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Good form
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{clean}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <CheckCircle className="size-6" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Needs work
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{withIssues}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="size-6" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Pass rate
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {passRate != null ? `${passRate}%` : '--'}
            </span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="size-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({video}: {video: VideoListItem}) {
  const hasFailures = (video.failed ?? 0) > 0;
  const totalChecks = (video.passed ?? 0) + (video.failed ?? 0);
  const passRate =
    totalChecks > 0 ? Math.round(((video.passed ?? 0) / totalChecks) * 100) : null;
  const accentColor = hasFailures ? COLORS.amber : COLORS.green;
  const borderColor = hasFailures ? 'border-l-amber-500' : 'border-l-green-500';

  return (
    <Link href={`/dashboard/biomechanics/${video.id}`}>
      <div
        className={`relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 border-l-4 ${borderColor} transition-all duration-200 hover:shadow-md hover:ring-foreground/20 cursor-pointer`}
      >
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: accentColor}} />
        <div className="flex items-center gap-4 p-5">
          {/* Icon */}
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${hasFailures ? 'bg-amber-500/10' : 'bg-green-500/10'}`}
          >
            <Film
              className={`size-6 ${hasFailures ? 'text-amber-500' : 'text-green-500'}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {exerciseLabel(video.exercise) ?? video.original_filename ?? 'Untitled video'}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="capitalize">{video.sport}</span>
              <span>
                {video.passed ?? 0} passed / {video.failed ?? 0} failed
              </span>
              <span>{video.rep_count ?? 0} reps</span>
              <span>{formatRelativeTime(video.created_at)}</span>
            </div>
            {video.headline && (
              <p className="mt-2 truncate text-sm text-foreground">{video.headline}</p>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {passRate != null && (
              <div className="relative">
                <ProgressRing
                  value={passRate}
                  size={48}
                  strokeWidth={4}
                  color={passRate >= 80 ? COLORS.green : passRate >= 50 ? COLORS.amber : COLORS.red}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                  {passRate}%
                </span>
              </div>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                hasFailures
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-green-500/10 text-green-600'
              }`}
            >
              {hasFailures ? (
                <AlertTriangle className="size-3.5" />
              ) : (
                <CheckCircle className="size-3.5" />
              )}
              {hasFailures ? 'Needs work' : 'Good form'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
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

  if (loading) return <SkeletonPage />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Biomechanics</h1>
          <p className="text-base text-muted-foreground">
            Movement analysis and coaching feedback from your uploaded videos.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-base text-red-600">
          <AlertTriangle className="size-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Biomechanics</h1>
        <p className="text-base text-muted-foreground">
          Movement analysis and coaching feedback from your uploaded videos.
        </p>
      </div>

      <StatsRow videos={videos} />

      {videos.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <Activity className="size-7 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-foreground">No analyses yet</p>
            <p className="text-sm text-muted-foreground">
              Upload a video and it will be processed for movement analysis.
            </p>
            <Link href="/dashboard/videos" className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Video className="size-4" />
                Go to videos
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((v) => (
            <ReportCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
