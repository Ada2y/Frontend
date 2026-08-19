'use client';

import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {AlertTriangle} from 'lucide-react';
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import InjuryRiskBadge from '@/app/(dashboard)/_components/InjuryRiskBadge';
import {TeamService, type CoachAnnotation} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

const chartConfig = {
  a: {label: 'Player A', color: 'var(--chart-1)'},
  b: {label: 'Player B', color: 'var(--chart-4)'}
} satisfies ChartConfig;

export default function CompareTab({team}: {team: Team}) {
  const [playerAId, setPlayerAId] = useState(team.players[0]?.id ?? '');
  const [playerBId, setPlayerBId] = useState(team.players[1]?.id ?? team.players[0]?.id ?? '');
  const [chartData, setChartData] = useState<{date: string; a: number | null; b: number | null}[]>(
    []
  );
  const [annotations, setAnnotations] = useState<CoachAnnotation[]>([]);
  const [note, setNote] = useState('');

  const playerA = team.players.find((p) => p.id === playerAId);
  const playerB = team.players.find((p) => p.id === playerBId);

  useEffect(() => {
    if (!playerAId || !playerBId) return;
    let cancelled = false;
    Promise.all([
      TeamService.getPlayerJointSeries(playerAId),
      TeamService.getPlayerJointSeries(playerBId)
    ]).then(([seriesA, seriesB]) => {
      if (cancelled) return;
      const jointA = seriesA[0];
      const jointB = seriesB[0];
      const dates = Array.from(
        new Set([...(jointA?.points ?? []), ...(jointB?.points ?? [])].map((p) => p.session_date))
      ).sort();
      setChartData(
        dates.map((date) => ({
          date,
          a: jointA?.points.find((p) => p.session_date === date)?.angle_deg ?? null,
          b: jointB?.points.find((p) => p.session_date === date)?.angle_deg ?? null
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [playerAId, playerBId]);

  useEffect(() => {
    if (!playerAId) return;
    let cancelled = false;
    TeamService.listAnnotations(playerAId).then((data) => {
      if (!cancelled) setAnnotations(data);
    });
    return () => {
      cancelled = true;
    };
  }, [playerAId]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim() || !playerAId) return;
    const added = await TeamService.addAnnotation(playerAId, note.trim());
    setAnnotations((prev) => [...prev, added]);
    setNote('');
  }

  const diverges = useMemo(
    () => !!playerA && !!playerB && playerA.injury_risk !== playerB.injury_risk,
    [playerA, playerB]
  );

  if (team.players.length < 2) {
    return (
      <p className="rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
        Compare needs at least two players on the roster.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Player A</Label>
          <Select value={playerAId} onValueChange={setPlayerAId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {team.players.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Player B</Label>
          <Select value={playerBId} onValueChange={setPlayerBId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {team.players.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {diverges && playerA && playerB && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {playerA.full_name} is at <strong className="mx-1">{playerA.injury_risk}</strong> risk
          while {playerB.full_name} is at <strong className="mx-1">{playerB.injury_risk}</strong>{' '}
          risk — worth a closer look before the next session.
        </div>
      )}

      <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Knee valgus angle (°) — overlaid
        </p>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <LineChart data={chartData} margin={{left: 12, right: 12}}>
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
              dataKey="a"
              name={playerA?.full_name}
              stroke="var(--color-a)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="b"
              name={playerB?.full_name}
              stroke="var(--color-b)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{background: 'var(--chart-1)'}} />
            {playerA?.full_name}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{background: 'var(--chart-4)'}} />
            {playerB?.full_name}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Private notes on {playerA?.full_name}
          </p>
          {playerA && <InjuryRiskBadge level={playerA.injury_risk} />}
        </div>
        <div className="flex flex-col gap-2">
          {annotations.length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet — only you can see these.</p>
          )}
          {annotations.map((a) => (
            <div key={a.id} className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
              {a.note}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note…"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
          <Button type="submit" size="sm" disabled={!note.trim()}>
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
