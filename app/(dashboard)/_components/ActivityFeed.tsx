import Link from 'next/link';
import {Upload, CheckCircle, AlertTriangle, FileText, Apple} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {VideoListItem} from '@/lib/api';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ActivityItem {
  id: string;
  icon: typeof CheckCircle;
  iconColor: string;
  title: string;
  detail: string;
  href: string;
  timestamp: string;
}

function videoToActivity(v: VideoListItem): ActivityItem {
  const isCompleted = v.status === 'completed';
  const hasFailed = (v.failed ?? 0) > 0;

  return {
    id: v.id,
    icon: isCompleted ? (hasFailed ? AlertTriangle : CheckCircle) : Upload,
    iconColor: isCompleted
      ? hasFailed
        ? 'text-amber-500'
        : 'text-green-500'
      : 'text-muted-foreground',
    title: v.original_filename ?? 'Untitled video',
    detail: isCompleted
      ? `${v.exercise ?? v.sport} \u00b7 ${v.passed ?? 0}/${((v.passed ?? 0) + (v.failed ?? 0))} passed`
      : v.status,
    href: isCompleted ? `/dashboard/biomechanics/${v.id}` : '/dashboard/videos',
    timestamp: v.created_at
  };
}

interface ActivityFeedProps {
  videos: VideoListItem[];
}

export default function ActivityFeed({videos}: ActivityFeedProps) {
  const items = videos.slice(0, 6).map(videoToActivity);

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-base text-muted-foreground">No activity yet.</p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-start gap-3 py-3 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
        >
          <item.icon className={cn('mt-0.5 size-5 shrink-0', item.iconColor)} />
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="truncate text-base font-medium text-foreground">{item.title}</span>
            <span className="text-sm text-muted-foreground">{item.detail}</span>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {formatRelativeTime(item.timestamp)}
          </span>
        </Link>
      ))}
    </div>
  );
}
