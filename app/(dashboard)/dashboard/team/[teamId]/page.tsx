'use client';

import {use, useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {ApiClient, type TeamDetail, type TeamRiskStat} from '@/lib/api';
import RosterTab from './_components/RosterTab';
import CompareTab from './_components/CompareTab';
import PlanTab from './_components/PlanTab';
import AlertsTab from './_components/AlertsTab';
import StatsTab from './_components/StatsTab';

export default function TeamDetailPage({params}: {params: Promise<{teamId: string}>}) {
  const {teamId} = use(params);
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [riskStats, setRiskStats] = useState<TeamRiskStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Risk stats are recomputed server-side per member on every call, so they
   * are fetched alongside the roster once and shared by every tab rather than
   * re-requested per tab. */
  const load = useCallback(async () => {
    try {
      const detail = await ApiClient.getTeam(teamId);
      setTeam(detail);
      setError(null);
      // A risk-stats failure must not blank out a roster that loaded fine.
      setRiskStats(await ApiClient.getTeamRiskStats(teamId).catch(() => []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load this team.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-56 animate-pulse rounded bg-muted [animation-delay:100ms]" />
          <div className="h-5 w-40 animate-pulse rounded bg-muted [animation-delay:200ms]" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/team"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          All teams
        </Link>
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error ?? 'Team not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/team"
          className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          All teams
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{team.name}</h1>
        <p className="text-base text-muted-foreground capitalize">
          {team.sport} · {team.members.length} {team.members.length === 1 ? 'player' : 'players'}
        </p>
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="plan">Team plan</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <RosterTab team={team} riskStats={riskStats} onRosterChange={load} />
        </TabsContent>
        <TabsContent value="compare">
          <CompareTab team={team} />
        </TabsContent>
        <TabsContent value="plan">
          <PlanTab team={team} />
        </TabsContent>
        <TabsContent value="alerts">
          <AlertsTab team={team} />
        </TabsContent>
        <TabsContent value="stats">
          <StatsTab team={team} riskStats={riskStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
