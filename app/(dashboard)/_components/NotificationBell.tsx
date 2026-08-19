'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Bell} from 'lucide-react';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {ApiClient, type NotificationItem} from '@/lib/api';

const POLL_INTERVAL_MS = 45000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    ApiClient.listNotifications()
      .then(setNotifications)
      .catch(() => {
        // silent - the bell just won't update; other auth-gated UI will surface the real error
      });
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleSelect(notification: NotificationItem) {
    if (!notification.is_read) {
      try {
        await ApiClient.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? {...n, is_read: true} : n))
        );
      } catch {
        // best-effort - navigation still proceeds
      }
    }
    setOpen(false);
    if (notification.related_entity_type === 'video_session' && notification.related_entity_id) {
      router.push(`/dashboard/biomechanics/${notification.related_entity_id}`);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative cursor-pointer"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {notifications.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleSelect(n)}
              className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                n.is_read ? '' : 'bg-primary/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {!n.is_read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <span className="text-sm font-medium text-foreground">{n.title}</span>
              </div>
              {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              <span className="text-[11px] text-muted-foreground">{formatTime(n.created_at)}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
