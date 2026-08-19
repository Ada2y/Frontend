'use client';

import {use, useEffect, useState} from 'react';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {TeamService} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';
import RosterTab from './_components/RosterTab';
import CompareTab from './_components/CompareTab';
import PlanTab from './_components/PlanTab';
import AlertsTab from './_components/AlertsTab';
import StatsTab from './_components/StatsTab';

export default function TeamDetailPage({params}: {params: Promise<{teamId: string}>}) {
  const {teamId} = use(params);
  const [team, setTeam] = useState<Team | null | undefined>(null);

  useEffect(() => {
    let cancelled = false;
    TeamService.getTeam(teamId).then((data) => {
      if (!cancelled) setTeam(data ?? undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  if (team === null) {
    return <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />;
  }

  if (team === undefined) {
    return <p className="text-sm text-muted-foreground">Team not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/team"
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          All teams
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {team.sport} · {team.players.length} players
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
          <RosterTab team={team} />
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
          <StatsTab team={team} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
