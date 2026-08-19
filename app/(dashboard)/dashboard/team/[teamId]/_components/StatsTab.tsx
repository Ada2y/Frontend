'use client';

import {useEffect, useState} from 'react';
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from 'recharts';
import {Download} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {TeamService, type SquadStats} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

const chartConfig = {
  avg_risk_score: {label: 'Avg squad risk', color: 'var(--chart-1)'}
} satisfies ChartConfig;

function riskColor(score: number) {
  if (score >= 60) return 'bg-destructive';
  if (score >= 35) return 'bg-[#f59e0b]';
  return 'bg-[#22c55e]';
}

export default function StatsTab({team}: {team: Team}) {
  const [stats, setStats] = useState<SquadStats | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    TeamService.getSquadStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />;
  }

  const playerName = (id: string) => team.players.find((p) => p.id === id)?.full_name ?? id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Injury risk by body part — last 30 days
        </p>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Download className="size-3.5" />
          Export PDF
        </Button>
      </div>

      <div id="squad-stats-print" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-xl bg-card p-8 ring-1 ring-foreground/10">
          {stats.body_part_risk.map((row) => (
            <button
              key={row.body_part}
              type="button"
              onClick={() => setExpanded(expanded === row.body_part ? null : row.body_part)}
              className="flex flex-col gap-1.5 text-left"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{row.body_part}</span>
                <span className="tabular-nums text-muted-foreground">{row.risk_score}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                <div
                  className={cn('h-full rounded-full', riskColor(row.risk_score))}
                  style={{width: `${row.risk_score}%`}}
                />
              </div>
              {expanded === row.body_part && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.affected_player_ids.length === 0
                    ? 'No players currently affected.'
                    : `Affected: ${row.affected_player_ids.map(playerName).join(', ')}`}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
          <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            30-day trend
          </p>
          <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
            <LineChart data={stats.trend} margin={{left: 12, right: 12}}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
                }
              />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="avg_risk_score"
                stroke="var(--color-avg_risk_score)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
