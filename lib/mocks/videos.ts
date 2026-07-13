export type VideoStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface MockVideo {
  id: string;
  fileName: string;
  sport: string;
  status: VideoStatus;
  durationSeconds: number | null;
  storageUrl: string;
  capturedAt: string;
  uploadedAt: string;
  failureReason?: string;
}

export const STATUS_COLORS: Record<VideoStatus, {bg: string; text: string}> = {
  UPLOADED: {bg: 'bg-blue-500/10', text: 'text-blue-600'},
  QUEUED: {bg: 'bg-muted', text: 'text-muted-foreground'},
  PROCESSING: {bg: 'bg-amber-500/10', text: 'text-amber-600'},
  COMPLETED: {bg: 'bg-green-500/10', text: 'text-green-600'},
  FAILED: {bg: 'bg-red-500/10', text: 'text-red-600'}
};

export const MOCK_VIDEOS: MockVideo[] = [
  {
    id: 'vid_mock_1',
    fileName: 'match_highlights_q1.mp4',
    sport: 'FOOTBALL',
    status: 'COMPLETED',
    durationSeconds: 142,
    storageUrl: 'mock://videos/vid_mock_1.mp4',
    capturedAt: '2026-07-10T15:30:00Z',
    uploadedAt: '2026-07-10T16:00:00Z'
  },
  {
    id: 'vid_mock_2',
    fileName: 'training_sprint_drill.mov',
    sport: 'ATHLETICS',
    status: 'PROCESSING',
    durationSeconds: 87,
    storageUrl: 'mock://videos/vid_mock_2.mov',
    capturedAt: '2026-07-12T09:15:00Z',
    uploadedAt: '2026-07-12T10:00:00Z'
  },
  {
    id: 'vid_mock_3',
    fileName: 'basketball_practice.mp4',
    sport: 'BASKETBALL',
    status: 'FAILED',
    durationSeconds: 210,
    storageUrl: 'mock://videos/vid_mock_3.mp4',
    capturedAt: '2026-07-11T14:00:00Z',
    uploadedAt: '2026-07-11T14:30:00Z',
    failureReason: 'Pose estimation failed: insufficient lighting'
  }
];
