'use client';

import {useState} from 'react';
import {Check, ShieldAlert, ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import SeverityBadge from '@/app/(dashboard)/_components/SeverityBadge';
import {cn} from '@/lib/utils';
import type {ReviewQueueItem} from '@/lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function shortId(id: string) {
  return id.replace(/^athlete_mock_?/, '#').replace(/^(.{8}).+/, '$1…');
}

export default function ReviewQueueRow({
  item,
  onResolve
}: {
  item: ReviewQueueItem;
  onResolve: (id: string, data: {approve: boolean; resolution_notes?: string}) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="flex flex-col border-b border-border last:border-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={item.severity} />
            <span className="text-xs font-medium text-muted-foreground">
              Athlete {shortId(item.athlete_user_id)}
            </span>
            {item.resolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
                <Check className="size-3" />
                Reviewed
              </span>
            )}
          </div>
          <p className="text-sm text-foreground">{item.reason}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatDate(item.created_at)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 size-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 pb-4">
          {item.resolved ? (
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {item.resolution_notes || 'No notes were added.'}
              {item.resolved_at && (
                <span className="block">Resolved {formatDate(item.resolved_at)}</span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-lg bg-[#f59e0b]/5 p-3 ring-1 ring-[#f59e0b]/20">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#f59e0b]" />
                <p className="text-xs text-foreground">
                  This flag holds a nutrition recommendation as <code>pending_review</code>. It
                  stays hidden from the athlete until you clear or escalate it here.
                </p>
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note for the audit log (optional)"
                className="resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    onResolve(item.id, {approve: true, resolution_notes: notes || undefined})
                  }
                >
                  <Check className="size-3.5" />
                  Clear & approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    onResolve(item.id, {approve: false, resolution_notes: notes || undefined})
                  }
                >
                  Escalate
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
