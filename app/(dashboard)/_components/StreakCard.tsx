'use client';

/**
 * Consistency streak, activity heatstrip and milestones.
 *
 * Deliberately understated. A streak counter that shouts is the part of a
 * fitness app people mute first, and the honest version has to be able to
 * show a zero without editorialising about it.
 */

import {useEffect, useState} from 'react';
import {Award, Flame} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ApiClient, type Streaks} from '@/lib/api';
import {cn} from '@/lib/utils';

const MAX_DAYS_PER_WEEK = 7;

function weekLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export default function StreakCard() {
  const [streaks, setStreaks] = useState<Streaks | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.getStreaks()
      .then((data) => !cancelled && setStreaks(data))
      .catch(() => {
        // A missing streak is not worth an error state on the dashboard.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!streaks) return null;

  const recent = streaks.milestones.slice(-3).reverse();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame
            className={cn(
              'size-4',
              streaks.current_streak > 0 ? 'text-amber-500' : 'text-muted-foreground'
            )}
          />
          Consistency
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {streaks.active_days_last_30} active days in 30
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex items-end gap-6">
          <div className="flex flex-col">
            <span className="font-mono text-4xl leading-none font-semibold tabular-nums text-foreground">
              {streaks.current_streak}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              day streak
              {/* The streak survives an untrained today - saying so is the
                  difference between a nudge and a false accusation. */}
              {streaks.current_streak > 0 && !streaks.trained_today && ' · today not counted yet'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xl leading-none tabular-nums text-muted-foreground">
              {streaks.longest_streak}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">best</span>
          </div>
        </div>

        <div className="flex items-end gap-1.5">
          {streaks.weekly.map((week) => (
            <div key={week.week_start} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-12 w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-sm transition-all',
                    week.active_days > 0 ? 'bg-primary' : 'bg-muted',
                    week.in_progress && 'opacity-60'
                  )}
                  style={{
                    height: `${Math.max((week.active_days / MAX_DAYS_PER_WEEK) * 100, 6)}%`
                  }}
                  title={`${weekLabel(week.week_start)}: ${week.active_days} active days${
                    week.in_progress ? ' (this week so far)' : ''
                  }`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {weekLabel(week.week_start).split(' ')[1]}
              </span>
            </div>
          ))}
        </div>

        {recent.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-border pt-4">
            {recent.map((milestone) => (
              <li key={milestone.key} className="flex items-start gap-2">
                <Award className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm text-foreground">{milestone.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {milestone.description} ·{' '}
                    {new Date(milestone.achieved_on).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
