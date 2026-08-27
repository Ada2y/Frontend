'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Film,
  Loader2,
  TrendingUp,
  Upload,
  Video,
  X,
  XCircle
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type VideoExercise,
  type VideoListItem,
  type VideoSport,
  type VideoStatus
} from '@/lib/api';

const selectClassName =
  'flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2362666d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")]';

const SPORT_OPTIONS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];

const EXERCISE_OPTIONS_BY_SPORT: Record<
  VideoSport,
  {value: VideoExercise; label: string; view: string}[]
> = {
  gym: GYM_EXERCISES,
  football: FOOTBALL_EXERCISES
};

const STATUS_CONFIG: Record<
  VideoStatus,
  {
    bg: string;
    text: string;
    accent: string;
    icon: typeof CheckCircle;
    label: string;
  }
> = {
  uploaded: {
    bg: 'bg-info-bg',
    text: 'text-info',
    accent: 'border-l-blue-500',
    icon: Upload,
    label: 'Uploaded'
  },
  queued: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    accent: 'border-l-muted-foreground/30',
    icon: Clock,
    label: 'Queued'
  },
  processing: {
    bg: 'bg-warning-bg',
    text: 'text-warning',
    accent: 'border-l-amber-500',
    icon: Loader2,
    label: 'Processing'
  },
  completed: {
    bg: 'bg-success-bg',
    text: 'text-success',
    accent: 'border-l-green-500',
    icon: CheckCircle,
    label: 'Completed'
  },
  failed: {
    bg: 'bg-danger-bg',
    text: 'text-danger',
    accent: 'border-l-red-500',
    icon: XCircle,
    label: 'Failed'
  }
};

const PENDING_STATUSES: VideoStatus[] = ['uploaded', 'queued', 'processing'];
const POLL_INTERVAL_MS = 4000;

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

function formatExercise(exercise: VideoExercise | null): string | null {
  if (!exercise) return null;
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

/** A video that finished processing but measured nothing (0 reps, wrong
 * camera angle) is NOT a success. Showing it green as "completed" told the
 * athlete everything was fine and gave them no reason to re-record. */
function StatusBadge({video}: {video: VideoListItem}) {
  const needsRetry = video.status === 'completed' && video.assessable === false;

  if (needsRetry) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-2 py-0.5 text-xs font-medium text-danger">
        <AlertCircle className="size-3" />
        Retry needed
      </span>
    );
  }

  if (video.status === 'completed') {
    const failed = video.failed ?? 0;
    return failed > 0 ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning">
        <AlertTriangle className="size-3" />
        {failed} to work on
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 className="size-3" />
        Good form
      </span>
    );
  }

  const config = STATUS_CONFIG[video.status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold capitalize ${config.bg} ${config.text}`}
    >
      <Icon className={`size-3.5 ${video.status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}

function SkeletonPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        <div className="h-5 w-80 animate-pulse rounded bg-muted [animation-delay:100ms]" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
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
      <div className="relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10"
        >
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
  const completed = videos.filter((v) => v.status === 'completed').length;
  const processing = videos.filter((v) => PENDING_STATUSES.includes(v.status)).length;

  const completedVideos = videos.filter((v) => v.status === 'completed');
  const totalPassed = completedVideos.reduce((sum, v) => sum + (v.passed ?? 0), 0);
  const totalChecks = completedVideos.reduce(
    (sum, v) => sum + (v.passed ?? 0) + (v.failed ?? 0),
    0
  );
  const passRate = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{total}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Video className="size-6" />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{completed}</span>
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
              Processing
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{processing}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Loader2 className="size-6" />
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

function UploadSection({
  sport,
  exercise,
  onSportChange,
  onExerciseChange
}: {
  sport: VideoSport;
  exercise: VideoExercise | '';
  onSportChange: (s: VideoSport) => void;
  onExerciseChange: (e: VideoExercise | '') => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) return;
    setSelectedFile(file);
    setUploadComplete(false);
    setUploadError(null);
    setProgress(0);
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    if (!exercise) {
      setUploadError('Select which exercise this video shows.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setProgress(0);

    try {
      await ApiClient.uploadVideoWithProgress(sport, selectedFile, exercise, setProgress);
      setUploading(false);
      setUploadComplete(true);
      setSelectedFile(null);
      setTimeout(() => setUploadComplete(false), 3000);
      window.location.reload();
    } catch (err) {
      setUploading(false);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setProgress(0);
    setUploadComplete(false);
    setUploadError(null);
    setUploading(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="size-6 text-primary" />
          </div>
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Upload video
            </span>
          </div>
        </div>

        {/* Selectors */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Sport</span>
            <select
              value={sport}
              onChange={(e) => {
                onSportChange(e.target.value as VideoSport);
                onExerciseChange('');
              }}
              className={selectClassName}
            >
              {SPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Exercise</span>
            <select
              value={exercise}
              onChange={(e) => onExerciseChange(e.target.value as VideoExercise)}
              className={selectClassName}
            >
              <option value="">Select an exercise...</option>
              {EXERCISE_OPTIONS_BY_SPORT[sport].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {exercise && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Camera angle: </span>
            {EXERCISE_OPTIONS_BY_SPORT[sport].find((opt) => opt.value === exercise)?.view}
          </p>
        )}

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-5 flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/30 hover:shadow-md'
          }`}
        >
          <div
            className={`flex size-16 items-center justify-center rounded-2xl transition-colors duration-200 ${
              isDragging ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Upload className="size-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              Drag and drop a video here, or{' '}
              <span className="text-primary underline">browse files</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              MP4, MOV, AVI — max 100MB, 90 seconds
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Upload video file"
          />

          {selectedFile && (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Video className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={handleRemoveFile}>
                  <X className="size-3" />
                </Button>
              </div>

              {uploading && (
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200"
                      style={{width: `${Math.min(progress, 100)}%`}}
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">{progress}%</p>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-danger">
                  <AlertCircle className="size-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Upload complete — queued for analysis
                </div>
              )}

              {!uploading && !uploadComplete && (
                <Button onClick={handleUpload} className="w-full">
                  Upload
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Selected file fallback (when not inside drop zone) */}
        {!selectedFile && uploading && (
          <div className="mt-5 flex flex-col gap-4 rounded-xl bg-muted/30 p-4">
            <div className="flex flex-col gap-2">
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                  style={{width: `${Math.min(progress, 100)}%`}}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uploading...</span>
                <span className="text-sm font-semibold text-foreground">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {uploadError && !selectedFile && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-base text-red-600">
            <AlertCircle className="size-5 shrink-0" />
            {uploadError}
          </div>
        )}

        {uploadComplete && !selectedFile && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/8 px-4 py-3 text-base text-green-600">
            <CheckCircle className="size-5" />
            Upload complete — queued for analysis
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({video}: {video: VideoListItem}) {
  const config = STATUS_CONFIG[video.status];
  const StatusIcon = config.icon;
  const isCompleted = video.status === 'completed';
  const isFailed = video.status === 'failed';
  const isProcessing = video.status === 'processing';

  const totalChecks = (video.passed ?? 0) + (video.failed ?? 0);
  const passRate = totalChecks > 0 ? Math.round(((video.passed ?? 0) / totalChecks) * 100) : null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 border-l-4 ${config.accent} transition-all duration-200 hover:shadow-md hover:ring-foreground/20`}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Status icon */}
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${config.bg}`}
        >
          <StatusIcon className={`size-6 ${config.text} ${isProcessing ? 'animate-spin' : ''}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {video.original_filename ?? 'Untitled video'}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="capitalize">{video.sport}</span>
            {formatExercise(video.exercise) && (
              <span className="capitalize">{formatExercise(video.exercise)}</span>
            )}
            <span>{formatDuration(video.duration_seconds)}</span>
            <span>{formatRelativeTime(video.created_at)}</span>
          </div>

          {video.headline && isCompleted && (
            <p className="mt-2 text-sm text-foreground">{video.headline}</p>
          )}
          {video.failure_reason && (
            <p className="mt-2 text-sm text-red-600">{video.failure_reason}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Pass rate ring for completed */}
          {isCompleted && passRate != null && (
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

          <StatusBadge video={video} />
        </div>
      </div>

      {/* View report button */}
      {isCompleted && (
        <div className="border-t border-border px-5 py-3">
          <Link
            href={`/dashboard/biomechanics/${video.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            View report
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState<VideoSport>('gym');
  const [exercise, setExercise] = useState<VideoExercise | ''>('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      const list = await ApiClient.listVideos();
      setVideos(list);
    } catch {
      // leave previous list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await ApiClient.listVideos();
        if (!cancelled) setVideos(list);
      } catch {
        // leave previous list
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hasPending = videos.some((v) => PENDING_STATUSES.includes(v.status));
    if (!hasPending) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(loadVideos, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [videos, loadVideos]);

  if (loading) return <SkeletonPage />;

  const completedVideos = videos.filter((v) => v.status === 'completed');
  const pendingVideos = videos.filter((v) => PENDING_STATUSES.includes(v.status));
  const failedVideos = videos.filter((v) => v.status === 'failed');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Videos</h1>
        <p className="text-base text-muted-foreground">
          Upload training videos for pose analysis and biomechanics review.
        </p>
      </div>

      {/* Stats */}
      <StatsRow videos={videos} />

      {/* Upload */}
      <UploadSection
        sport={sport}
        exercise={exercise}
        onSportChange={setSport}
        onExerciseChange={setExercise}
      />

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <Video className="size-7 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-foreground">No videos uploaded yet</p>
            <p className="text-sm text-muted-foreground">
              Upload your first video above to get started with analysis.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Processing */}
          {pendingVideos.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Loader2 className="size-5 animate-spin text-amber-500" />
                Processing
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                  {pendingVideos.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {pendingVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedVideos.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CheckCircle className="size-5 text-green-500" />
                Completed
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                  {completedVideos.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {completedVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </div>
          )}

          {/* Failed */}
          {failedVideos.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <XCircle className="size-5 text-red-500" />
                Failed
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {failedVideos.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {failedVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
