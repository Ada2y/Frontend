'use client';

import {useEffect, useState} from 'react';
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from 'recharts';
import {Download, ShieldCheck, TrendingUp, Users} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {Button} from '@/components/ui/button';
import AthleteLabel from '@/app/(dashboard)/_components/AthleteLabel';
import MockBadge from '@/app/(dashboard)/_components/MockBadge';
import RiskBandBadge from '@/app/(dashboard)/_components/RiskBandBadge';
import StatCard from '@/app/(dashboard)/_components/StatCard';
import {cn} from '@/lib/utils';
import {TeamService, type SquadStats} from '@/lib/mocks/team-service';
import type {TeamDetail, TeamRiskStat} from '@/lib/api';

const COLORS = {
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b'
} as const;

const chartConfig = {
  avg_risk_score: {label: 'Avg squad risk', color: 'var(--chart-1)'}
} satisfies ChartConfig;

function riskColor(score: number) {
  if (score >= 60) return 'bg-danger';
  if (score >= 30) return 'bg-warning';
  return 'bg-success';
}

export default function StatsTab({team, riskStats}: {team: TeamDetail; riskStats: TeamRiskStat[]}) {
  const [mockStats, setMockStats] = useState<SquadStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    TeamService.getSquadStats().then((data) => {
      if (!cancelled) setMockStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only assessable athletes belong in an average - folding "not enough data"
  // in as a zero would report a squad as healthier than anything was measured.
  const scored = riskStats.filter((r) => r.available && r.score != null);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length)
      : null;
  const elevated = scored.filter((r) => r.band === 'elevated').length;

  const ranked = [...riskStats].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Assessed"
          value={`${scored.length}/${team.members.length}`}
          description="Athletes with enough data"
          accentColor={COLORS.primary}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg risk"
          value={avgScore ?? '—'}
          description={avgScore != null ? 'Across assessed athletes' : 'Nothing assessable yet'}
          accentColor={COLORS.amber}
        />
        <StatCard
          icon={ShieldCheck}
          label="Elevated"
          value={elevated}
          description={elevated === 0 ? 'No one in the elevated band' : 'Athletes to look at first'}
          accentColor={elevated === 0 ? COLORS.green : COLORS.amber}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Injury-risk screening by athlete
        </p>
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No risk screening yet — it appears once roster athletes have training data.
          </p>
        ) : (
          ranked.map((row) => (
            <div key={row.athlete_user_id} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <AthleteLabel userId={row.athlete_user_id} />
                  <RiskBandBadge band={row.band} available={row.available} />
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {row.score != null ? Math.round(row.score) : '—'}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                <div
                  className={cn('h-full rounded-full', riskColor(row.score ?? 0))}
                  style={{width: `${Math.min(row.score ?? 0, 100)}%`}}
                />
              </div>
              {!row.available && <p className="text-xs text-muted-foreground">{row.note}</p>}
            </div>
          ))
        )}
      </div>

      {/* Body-part breakdown and the 30-day trend have no backend endpoint -
          RiskService only scores a whole athlete, not a joint. */}
      <div className="flex flex-col gap-6 rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Body part &amp; 30-day trend
            <MockBadge />
          </p>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Download className="size-3.5" />
            Export PDF
          </Button>
        </div>

        {mockStats === null ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {mockStats.body_part_risk.map((row) => (
                <div key={row.body_part} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{row.body_part}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {row.risk_score}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className={cn('h-full rounded-full', riskColor(row.risk_score))}
                      style={{width: `${row.risk_score}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>

            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <LineChart data={mockStats.trend} margin={{left: 12, right: 12}}>
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
          </>
        )}
      </div>
    </div>
  );
}
