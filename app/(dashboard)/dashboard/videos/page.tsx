'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {CheckCircle, Upload, Video, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {MOCK_VIDEOS, STATUS_COLORS, type MockVideo, type VideoStatus} from '@/lib/mocks/videos';

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function StatusBadge({status}: {status: VideoStatus}) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {status}
    </span>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<MockVideo[]>(MOCK_VIDEOS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  selectedFileRef.current = selectedFile;

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) return;
    setSelectedFile(file);
    setUploadComplete(false);
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

  function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.random() * 15 + 5, 100);
        if (next >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
          const file = selectedFileRef.current;
          if (file) {
            queueMicrotask(() => {
              setUploading(false);
              setUploadComplete(true);
              setVideos((prev) => [
                {
                  id: `vid_mock_${Date.now()}`,
                  fileName: file.name,
                  sport: 'OTHER',
                  status: 'UPLOADED' as const,
                  durationSeconds: null,
                  storageUrl: `mock://videos/${file.name}`,
                  capturedAt: new Date().toISOString(),
                  uploadedAt: new Date().toISOString()
                },
                ...prev
              ]);
              setSelectedFile(null);
              setTimeout(() => setUploadComplete(false), 3000);
            });
          }
        }
        return next;
      });
    }, 200);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setProgress(0);
    setUploadComplete(false);
    if (progressRef.current) clearInterval(progressRef.current);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Videos</h1>
        <p className="text-sm text-muted-foreground">
          Upload training and match videos for pose analysis and biomechanics review.
        </p>
      </div>

      <Card>
        <CardContent>
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
              <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, AVI — max 500MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-4 flex flex-col gap-3">
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

              {(uploading || progress > 0) && (
                <div className="flex flex-col gap-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200"
                      style={{width: `${Math.min(progress, 100)}%`}}
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {Math.min(Math.round(progress), 100)}%
                  </p>
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="size-4" />
                  Upload complete
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
        <div className="grid grid-cols-1 gap-3">
          {videos.map((v) => (
            <Card key={v.id} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm truncate">{v.fileName}</CardTitle>
                  <StatusBadge status={v.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{v.sport}</span>
                  <span>{formatDuration(v.durationSeconds)}</span>
                  <span>{formatDate(v.uploadedAt)}</span>
                </div>
                {v.failureReason && <p className="mt-2 text-xs text-red-600">{v.failureReason}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
