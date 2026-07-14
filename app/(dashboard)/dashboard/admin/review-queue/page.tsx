'use client';

import {useState} from 'react';
import {ShieldAlert} from 'lucide-react';
import {Card} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import ReviewQueueRow from '@/app/(dashboard)/_components/ReviewQueueRow';
import {mockReviewQueueOpen, mockReviewQueueResolved} from '@/lib/mocks/review-queue';
import type {ReviewQueueItem} from '@/lib/api';
import {cn} from '@/lib/utils';

type Filter = 'open' | 'resolved';

export default function ReviewQueuePage() {
  const [filter, setFilter] = useState<Filter>('open');
  const [openItems, setOpenItems] = useState<ReviewQueueItem[]>(mockReviewQueueOpen);
  const [resolvedItems, setResolvedItems] = useState<ReviewQueueItem[]>(mockReviewQueueResolved);

  function handleResolve(id: string, data: {approve: boolean; resolution_notes?: string}) {
    setOpenItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const resolvedItem: ReviewQueueItem = {
        ...item,
        resolved: true,
        resolution_notes: data.resolution_notes ?? null,
        resolved_at: new Date().toISOString()
      };
      setResolvedItems((r) => [resolvedItem, ...r]);
      return prev.filter((i) => i.id !== id);
    });
    // Real wiring lands once PATCH /admin/review-queue/{id} is live:
    // ApiClient.resolveReviewQueueItem(id, data)
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

      {items.length === 0 ? (
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
