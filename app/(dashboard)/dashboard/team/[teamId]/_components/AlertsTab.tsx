'use client';

import {useEffect, useState, type FormEvent} from 'react';
import Link from 'next/link';
import {ExternalLink, ShieldAlert} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import InjuryRiskBadge from '@/app/(dashboard)/_components/InjuryRiskBadge';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {TeamService, type InjuryAlert} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function AlertRow({
  alert,
  onAcknowledge
}: {
  alert: InjuryAlert;
  onAcknowledge: (id: string, note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onAcknowledge(alert.id, note.trim());
    setNoteOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{alert.player_name}</p>
            <InjuryRiskBadge level={alert.severity} />
            {alert.occurrences > 1 && (
              <Badge variant="secondary" className="text-[11px]">
                {alert.occurrences}× this session
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {alert.joint} ·{' '}
            {new Date(alert.session_date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <Link
          href={`/dashboard/biomechanics/${alert.video_id}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View at {formatTimestamp(alert.video_timestamp_seconds)}
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {alert.acknowledged ? (
        <p className="text-sm text-muted-foreground">
          Reviewed{alert.follow_up_note ? ` — ${alert.follow_up_note}` : ''}
        </p>
      ) : noteOpen ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Follow-up action (optional)…"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
          <Button type="submit" size="sm">
            Mark reviewed
          </Button>
        </form>
      ) : (
        <div>
          <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
            Mark reviewed
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AlertsTab({team}: {team: Team}) {
  const [alerts, setAlerts] = useState<InjuryAlert[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    TeamService.listInjuryAlerts(team.id).then((data) => {
      if (!cancelled) setAlerts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [team.id]);

  async function handleAcknowledge(id: string, note: string) {
    const updated = await TeamService.acknowledgeAlert(id, note);
    setAlerts((prev) => (prev ? prev.map((a) => (a.id === id ? updated : a)) : prev));
  }

  if (alerts === null) {
    return <div className="h-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />;
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No injury alerts"
        description="High-risk flags from your squad's sessions will show up here, sorted by severity."
      />
    );
  }

  const unresolved = alerts.filter((a) => !a.acknowledged);
  const resolved = alerts.filter((a) => a.acknowledged);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {unresolved.map((alert) => (
          <AlertRow key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
        ))}
      </div>
      {resolved.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Reviewed
          </p>
          {resolved.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
          ))}
        </div>
      )}
    </div>
  );
}
