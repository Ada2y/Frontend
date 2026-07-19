'use client';

import {useEffect, useState} from 'react';
import {Loader2, ShieldAlert} from 'lucide-react';
import {Card} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import ReviewQueueRow from '@/app/(dashboard)/_components/ReviewQueueRow';
import {ApiClient, type ReviewQueueItem} from '@/lib/api';
import {cn} from '@/lib/utils';

type Filter = 'open' | 'resolved';

export default function ReviewQueuePage() {
  const [filter, setFilter] = useState<Filter>('open');
  const [openItems, setOpenItems] = useState<ReviewQueueItem[]>([]);
  const [resolvedItems, setResolvedItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [open, resolved] = await Promise.all([
        ApiClient.getReviewQueue(false),
        ApiClient.getReviewQueue(true)
      ]);
      setOpenItems(open);
      setResolvedItems(resolved);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the review queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [open, resolved] = await Promise.all([
          ApiClient.getReviewQueue(false),
          ApiClient.getReviewQueue(true)
        ]);
        if (cancelled) return;
        setOpenItems(open);
        setResolvedItems(resolved);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load the review queue.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResolve(id: string, data: {approve: boolean; resolution_notes?: string}) {
    try {
      await ApiClient.resolveReviewQueueItem(id, data);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve this item.');
    }
  }

  const items = filter === 'open' ? openItems : resolvedItems;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          Flagged clinically sensitive recommendations awaiting human sign-off.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-1 rounded-md bg-muted p-1 text-sm">
        <button
          onClick={() => setFilter('open')}
          className={cn(
            'rounded px-3 py-1.5 font-medium transition-colors',
            filter === 'open'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Open ({openItems.length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={cn(
            'rounded px-3 py-1.5 font-medium transition-colors',
            filter === 'resolved'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Resolved ({resolvedItems.length})
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={filter === 'open' ? 'Queue is clear' : 'No resolved items yet'}
          description={
            filter === 'open'
              ? 'Recommendations flagged as pending_review will appear here until cleared or escalated.'
              : 'Items you clear or escalate will show up here for audit.'
          }
        />
      ) : (
        <Card className="p-8">
          <div className="flex flex-col">
            {items.map((item) => (
              <ReviewQueueRow key={item.id} item={item} onResolve={handleResolve} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
