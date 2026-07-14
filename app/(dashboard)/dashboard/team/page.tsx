'use client';

import {useState} from 'react';
import {Users, Video} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import CreateTeamSheet from '@/app/(dashboard)/_components/CreateTeamSheet';
import InjuryRiskBadge from '@/app/(dashboard)/_components/InjuryRiskBadge';
import {mockTeams} from '@/lib/mocks/teams';
import type {Team} from '@/lib/api';

function formatLastSession(iso: string | null) {
  if (!iso) return 'No sessions yet';
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function RosterTable({team}: {team: Team}) {
  return (
    <Card className="p-8">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">{team.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground capitalize">
              {team.sport} · {team.players.length} players
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pe-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Player
                </th>
                <th className="py-2 pe-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Injury risk
                </th>
                <th className="py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Last session
                </th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-border/60 last:border-0 hover:bg-foreground/4"
                >
                  <td className="py-2.5 pe-3 font-medium text-foreground">{player.full_name}</td>
                  <td className="py-2.5 pe-3">
                    <InjuryRiskBadge level={player.injury_risk} />
                  </td>
                  <td className="py-2.5 text-muted-foreground tabular-nums">
                    {formatLastSession(player.last_session_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);

  function handleCreateTeam(data: {name: string; sport: string}) {
    setTeams((prev) => [
      ...prev,
      {id: `team_mock_${prev.length + 1}`, name: data.name, sport: data.sport, players: []}
    ]);
    // Real wiring lands once GET/POST /teams is live: ApiClient.createTeam(data)
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

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team yet"
          description="Create a team and invite players via a unique link or phone number to get started."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {teams.map((team) =>
            team.players.length === 0 ? (
              <Card key={team.id} className="p-8">
                <CardHeader className="px-0">
                  <CardTitle className="text-base">{team.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">{team.sport}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="size-4" />
                    No players invited yet — share the team link to get started.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RosterTable key={team.id} team={team} />
            )
          )}
        </div>
      )}
    </div>
  );
}
