'use client';

import {useEffect, useRef, useState} from 'react';
import {Loader2, Minus, MessageCircle, Send, TrendingDown, TrendingUp} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  ApiClient,
  type CoachMessage,
  type MetricTrend,
  type TrendDirection,
  type TrendsResult
} from '@/lib/api';
import {describeMetric} from '@/lib/metrics';

const SUMMARY_POLL_INTERVAL_MS = 4000;
// The coach-message task is dispatched right after the report completes and
// usually finishes well inside this window; we stop polling past it rather
// than poll forever if that background task ever fails silently.
const SUMMARY_POLL_MAX_ATTEMPTS = 15;

const DIRECTION_ICON: Record<TrendDirection, typeof TrendingUp> = {
  improving: TrendingUp,
  regressing: TrendingDown,
  stable: Minus,
  neutral: Minus
};

const DIRECTION_COLOR: Record<TrendDirection, string> = {
  improving: 'text-green-600',
  regressing: 'text-red-600',
  stable: 'text-muted-foreground',
  neutral: 'text-muted-foreground'
};

function trendEntries(trends: TrendsResult | null): [string, MetricTrend][] {
  if (!trends || ('available' in trends && trends.available === false)) return [];
  const all = Object.entries(trends as Record<string, MetricTrend>);
  // Meaningful first: anything actually moving, worst-to-best, then the flat
  // ones. Dumping 28 raw metrics in source order buried the two that matter.
  const rank = (d: TrendDirection) => (d === 'regressing' ? 0 : d === 'improving' ? 1 : 2);
  return all.sort(([, a], [, b]) => rank(a.direction) - rank(b.direction));
}

const TRENDS_COLLAPSED_COUNT = 4;

export default function CoachCard({videoId}: {videoId: string}) {
  const [summary, setSummary] = useState<CoachMessage | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [trends, setTrends] = useState<TrendsResult | null>(null);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<CoachMessage | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const msg = await ApiClient.getCoachMessage(videoId);
        if (cancelled) return;
        setSummary(msg);
        attemptsRef.current += 1;
        if (msg.message_en || attemptsRef.current >= SUMMARY_POLL_MAX_ATTEMPTS) {
          setSummaryLoading(false);
          if (timer) clearInterval(timer);
        }
      } catch {
        if (!cancelled) setSummaryLoading(false);
        if (timer) clearInterval(timer);
      }
    }

    poll();
    timer = setInterval(poll, SUMMARY_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;
    ApiClient.getTrends(videoId)
      .then((t) => !cancelled && setTrends(t))
      .catch(() => {
        // trends are a bonus, not core to the page - fail silently
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAskError(null);
    setAnswer(null);
    try {
      const result = await ApiClient.askCoach(videoId, question.trim());
      setAnswer(result);
      setQuestion('');
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'Failed to reach the coach');
    } finally {
      setAsking(false);
    }
  }

  const entries = trendEntries(trends);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" />
          Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {summaryLoading && !summary?.message_en && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Your coach is reviewing this session…
          </div>
        )}
        {!summaryLoading && !summary?.message_en && (
          <p className="text-sm text-muted-foreground">No coaching summary available yet.</p>
        )}
        {summary?.message_en && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-foreground">{summary.message_en}</p>
            {summary.message_ar && (
              <p className="mt-2 text-sm text-muted-foreground" dir="rtl">
                {summary.message_ar}
              </p>
            )}
          </div>
        )}

        {entries.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Trends</p>
            {(showAllTrends ? entries : entries.slice(0, TRENDS_COLLAPSED_COUNT)).map(
              ([name, stats]) => {
                const Icon = DIRECTION_ICON[stats.direction];
                const described = describeMetric(name);
                return (
                  <div key={name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{described.label}</span>
                    <span
                      className={`flex items-center gap-1 font-mono tabular-nums ${DIRECTION_COLOR[stats.direction]}`}
                    >
                      <Icon className="size-3" />
                      {stats.first}
                      {described.unit ?? ''} → {stats.latest}
                      {described.unit ?? ''}
                    </span>
                  </div>
                );
              }
            )}
            {entries.length > TRENDS_COLLAPSED_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllTrends((v) => !v)}
                className="mt-1 self-start text-xs font-medium text-primary underline"
              >
                {showAllTrends
                  ? 'Show less'
                  : `Show ${entries.length - TRENDS_COLLAPSED_COUNT} more`}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleAsk} className="flex flex-col gap-2">
          <label htmlFor="coach-question" className="text-xs font-medium text-muted-foreground">
            Ask the coach about this session
          </label>
          <div className="flex gap-2">
            <input
              id="coach-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. why did I fail the depth check?"
              disabled={asking}
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
            <Button type="submit" size="sm" disabled={asking || !question.trim()}>
              {asking ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>
          </div>
        </form>

        {askError && <p className="text-xs text-red-600">{askError}</p>}

        {answer && (
          <div className="rounded-lg border border-border p-3">
            {!answer.in_scope && (
              <p className="mb-1 text-[11px] font-medium text-amber-600">
                Out of scope for this coach
              </p>
            )}
            <p className="text-sm text-foreground">{answer.message_en}</p>
            {answer.message_ar && (
              <p className="mt-2 text-sm text-muted-foreground" dir="rtl">
                {answer.message_ar}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
