'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Users, ChevronRight} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import CreateTeamSheet from '@/app/(dashboard)/_components/CreateTeamSheet';
import {TeamService} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    TeamService.listTeams().then((data) => {
      if (!cancelled) setTeams(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateTeam(data: {name: string; sport: string}) {
    const team = await TeamService.createTeam(data);
    setTeams((prev) => [...(prev ?? []), team]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your squad from a single dashboard.
          </p>
        </div>
        <CreateTeamSheet onCreate={handleCreateTeam} />
      </div>

      {teams === null ? (
        <div className="h-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team yet"
          description="Create a team and invite players via a unique link or phone number to get started."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/team/${team.id}`}>
              <Card className="p-8 transition-colors hover:bg-foreground/[0.02]">
                <CardHeader className="px-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">
                        {team.sport} · {team.players.length} players
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {team.players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No players invited yet.</p>
                  ) : (
                    <div className="flex -space-x-2">
                      {team.players.slice(0, 5).map((player) => (
                        <div
                          key={player.id}
                          title={player.full_name}
                          className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground ring-2 ring-card"
                        >
                          {player.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
