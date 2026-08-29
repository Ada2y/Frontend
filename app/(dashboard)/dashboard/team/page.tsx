'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ChevronRight, Dumbbell, Trophy, Users} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import CreateTeamSheet from '@/app/(dashboard)/_components/CreateTeamSheet';
import StatCard from '@/app/(dashboard)/_components/StatCard';
import {ApiClient, type SportCategory, type Team} from '@/lib/api';

const COLORS = {
  primary: '#5e6ad2',
  blue: '#3b82f6',
  green: '#22c55e'
} as const;

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-14 animate-pulse rounded bg-muted [animation-delay:150ms]" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted [animation-delay:300ms]" />
        </div>
        <div className="size-12 animate-pulse rounded-xl bg-muted [animation-delay:100ms]" />
      </div>
    </div>
  );
}

function formatCreated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.listTeams()
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTeams([]);
        setError(err instanceof Error ? err.message : 'Failed to load your teams.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateTeam(data: {name: string; sport: SportCategory}) {
    try {
      const team = await ApiClient.createTeam(data);
      setTeams((prev) => [...(prev ?? []), team]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create the team.');
    }
  }

  const sports = new Set((teams ?? []).map((t) => t.sport));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Teams</h1>
          <p className="text-base text-muted-foreground">
            Your squads, their rosters and the risk picture across them.
          </p>
        </div>
        <CreateTeamSheet onCreate={handleCreateTeam} />
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {teams === null ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10"
              />
            ))}
          </div>
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team yet"
          description="Create a team, then add athletes to its roster by their athlete user id."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label="Teams"
              value={teams.length}
              description="Squads you coach"
              accentColor={COLORS.primary}
            />
            <StatCard
              icon={Trophy}
              label="Sports"
              value={sports.size}
              description={sports.size > 0 ? [...sports].join(', ') : 'No sports yet'}
              accentColor={COLORS.blue}
            />
            <StatCard
              icon={Dumbbell}
              label="Newest team"
              value={teams.length > 0 ? teams[teams.length - 1].name : '—'}
              description={
                teams.length > 0
                  ? `Created ${formatCreated(teams[teams.length - 1].created_at)}`
                  : ''
              }
              accentColor={COLORS.green}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Link key={team.id} href={`/dashboard/team/${team.id}`}>
                <Card className="h-full p-8 transition-all duration-200 hover:shadow-md hover:ring-foreground/20">
                  <CardHeader className="px-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground capitalize">
                          {team.sport}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    {/* The list endpoint returns no roster - only the detail
                        endpoint does - so this card cannot show a headcount
                        without an extra request per team. */}
                    <p className="text-sm text-muted-foreground">
                      Created {formatCreated(team.created_at)}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary">Open roster →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
