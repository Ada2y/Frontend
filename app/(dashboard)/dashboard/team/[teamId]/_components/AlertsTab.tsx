'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {AlertTriangle, ShieldAlert} from 'lucide-react';
import {Button} from '@/components/ui/button';
import AthleteLabel from '@/app/(dashboard)/_components/AthleteLabel';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import MockBadge from '@/app/(dashboard)/_components/MockBadge';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type SessionAlert,
  type TeamDetail
} from '@/lib/api';

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

function exerciseLabel(exercise: string | null): string {
  if (!exercise) return 'Unknown movement';
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** Acknowledgements have no backend endpoint, so "reviewed" is browser-local
 * state keyed by the real analysis-session id and is lost on reload. */
function AlertRow({
  alert,
  reviewedNote,
  onAcknowledge
}: {
  alert: SessionAlert;
  reviewedNote: string | null | undefined;
  onAcknowledge: (id: string, note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onAcknowledge(alert.id, note.trim());
    setNoteOpen(false);
  }

  const reviewed = reviewedNote !== undefined;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <AthleteLabel userId={alert.athlete_user_id} />
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-2 py-0.5 text-[11px] font-medium text-danger">
              <AlertTriangle className="size-3" />
              Risk finding
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {exerciseLabel(alert.exercise)} · {formatDate(alert.created_at)}
          </p>
        </div>
      </div>

      {reviewed ? (
        <p className="text-sm text-muted-foreground">
          Reviewed{reviewedNote ? ` — ${reviewedNote}` : ''}
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
            Mark reviewed
          </Button>
          <MockBadge />
        </div>
      )}
    </div>
  );
}

export default function AlertsTab({team}: {team: TeamDetail}) {
  const [alerts, setAlerts] = useState<SessionAlert[] | null>(null);
  const [reviewed, setReviewed] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.getTeamAlerts(team.id)
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setAlerts([]);
        setError(err instanceof Error ? err.message : 'Failed to load alerts.');
      });
    return () => {
      cancelled = true;
    };
  }, [team.id]);

  function handleAcknowledge(id: string, note: string) {
    setReviewed((prev) => ({...prev, [id]: note}));
  }

  if (alerts === null) {
    return <div className="mt-4 h-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />;
  }

  if (error) {
    return (
      <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
        {error}
      </p>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={ShieldAlert}
          title="No injury alerts"
          description="Sessions on this roster that produce a high-severity finding will appear here, newest first."
        />
      </div>
    );
  }

  const open = alerts.filter((a) => reviewed[a.id] === undefined);
  const done = alerts.filter((a) => reviewed[a.id] !== undefined);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* The API returns the analysis-session id, not a video id, and a coach
          cannot read another user's report - so these rows do not link out. */}
      <p className="text-sm text-muted-foreground">
        {alerts.length} {alerts.length === 1 ? 'session' : 'sessions'} on this roster produced a
        high-severity finding.
      </p>

      <div className="flex flex-col gap-3">
        {open.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            reviewedNote={reviewed[alert.id]}
            onAcknowledge={handleAcknowledge}
          />
        ))}
      </div>

      {done.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Reviewed
          </p>
          {done.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              reviewedNote={reviewed[alert.id]}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
