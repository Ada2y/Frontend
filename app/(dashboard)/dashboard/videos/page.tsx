'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {AlertCircle, CheckCircle, Upload, Video, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type VideoExercise,
  type VideoListItem,
  type VideoSport,
  type VideoStatus
} from '@/lib/api';

// Site-standard form-control style (matches CreateTeamSheet's inputClassName).
const selectClassName =
  'flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full';

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

const STATUS_COLORS: Record<VideoStatus, {bg: string; text: string}> = {
  uploaded: {bg: 'bg-blue-500/10', text: 'text-blue-600'},
  queued: {bg: 'bg-muted', text: 'text-muted-foreground'},
  processing: {bg: 'bg-amber-500/10', text: 'text-amber-600'},
  completed: {bg: 'bg-green-500/10', text: 'text-green-600'},
  failed: {bg: 'bg-red-500/10', text: 'text-red-600'}
};

const PENDING_STATUSES: VideoStatus[] = ['uploaded', 'queued', 'processing'];
const POLL_INTERVAL_MS = 4000;

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
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
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
        <AlertCircle className="size-3" />
        Retry needed
      </span>
    );
  }

  const colors = STATUS_COLORS[video.status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}
    >
      {video.status}
    </span>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState<VideoSport>('gym');
  const [exercise, setExercise] = useState<VideoExercise | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      const list = await ApiClient.listVideos();
      setVideos(list);
    } catch {
      // leave the previous list in place - the topbar/other polling will surface auth issues
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
        // leave the previous list in place - the topbar/other polling will surface auth issues
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
      await loadVideos();
      setTimeout(() => setUploadComplete(false), 3000);
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Videos</h1>
        <p className="text-sm text-muted-foreground">
          Upload training videos for pose analysis and biomechanics review.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sport</span>
              <select
                value={sport}
                onChange={(e) => {
                  setSport(e.target.value as VideoSport);
                  setExercise('');
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
              <span className="text-xs font-medium text-muted-foreground">Exercise</span>
              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value as VideoExercise)}
                className={selectClassName}
              >
                <option value="">Select an exercise…</option>
                {EXERCISE_OPTIONS_BY_SPORT[sport].map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {exercise && (
            <p className="-mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Camera angle: </span>
              {EXERCISE_OPTIONS_BY_SPORT[sport].find((opt) => opt.value === exercise)?.view}
            </p>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag and drop a video here, or{' '}
                <span className="text-primary underline">browse files</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
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
          </div>

          {selectedFile && (
            <div className="flex flex-col gap-3">
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
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="size-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center gap-2 text-sm text-green-600">
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
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Uploaded videos</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && videos.length === 0 && (
          <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
        )}
        <div className="grid grid-cols-1 gap-3">
          {videos.map((v) => (
            <Card key={v.id} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm truncate">
                    {v.original_filename ?? 'Untitled video'}
                  </CardTitle>
                  <StatusBadge video={v} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{v.sport}</span>
                  {formatExercise(v.exercise) && <span>{formatExercise(v.exercise)}</span>}
                  <span>{formatDuration(v.duration_seconds)}</span>
                  <span>{formatDate(v.created_at)}</span>
                </div>
                {v.headline && v.status === 'completed' && v.assessable !== false && (
                  <p className="mt-2 text-xs text-foreground">{v.headline}</p>
                )}
                {v.failure_reason && (
                  <p className="mt-2 text-xs text-red-600">{v.failure_reason}</p>
                )}
                {v.status === 'completed' && v.assessable === false && (
                  <p className="mt-2 text-xs text-red-600">
                    {v.headline ?? "We couldn't measure this video."} Re-record and upload again.
                  </p>
                )}
                {v.status === 'completed' && (
                  <Link
                    href={`/dashboard/biomechanics/${v.id}`}
                    className="mt-2 inline-block text-xs font-medium text-primary underline"
                  >
                    View report
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
