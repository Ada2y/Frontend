'use client';

import {useState, type FormEvent} from 'react';
import {CalendarDays, Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {TeamService, type TeamPlanDraft, type TeamPlanIntensity} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INTENSITIES: TeamPlanIntensity[] = ['light', 'moderate', 'peak'];

const intensityStyles: Record<TeamPlanIntensity, string> = {
  light: 'bg-[#22c55e]/10 text-[#22c55e]',
  moderate: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  peak: 'bg-destructive/10 text-destructive'
};

export default function PlanTab({team}: {team: Team}) {
  const [matchDate, setMatchDate] = useState('');
  const [intensity, setIntensity] = useState<TeamPlanIntensity>('moderate');
  const [draft, setDraft] = useState<TeamPlanDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!matchDate) return;
    setGenerating(true);
    try {
      const result = await TeamService.generateTeamPlan(
        team.id,
        matchDate,
        intensity,
        team.players
      );
      setDraft(result);
    } finally {
      setGenerating(false);
    }
  }

  async function handleOverride(playerId: string, day: number, next: TeamPlanIntensity) {
    const updated = await TeamService.overrideDay(team.id, playerId, day, next);
    setDraft(updated);
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const published = await TeamService.publishTeamPlan(team.id);
      setDraft(published);
    } finally {
      setPublishing(false);
    }
  }

  if (team.players.length === 0) {
    return (
      <p className="rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
        Invite players before generating a team plan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="match-date">Match date</Label>
          <Input
            id="match-date"
            type="date"
            required
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Target intensity</Label>
          <Select value={intensity} onValueChange={(v) => setIntensity(v as TeamPlanIntensity)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTENSITIES.map((i) => (
                <SelectItem key={i} value={i} className="capitalize">
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={generating || !matchDate}>
          <CalendarDays className="size-3.5" />
          {generating ? 'Generating…' : 'Generate 7-day microcycle'}
        </Button>
      </form>

      {draft && (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  {DAY_LABELS.map((d) => (
                    <TableHead key={d}>{d}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium text-foreground">
                      {player.full_name}
                    </TableCell>
                    {(draft.per_player[player.id] ?? []).map((day) => (
                      <TableCell key={day.day_of_week}>
                        <Select
                          value={day.intensity}
                          onValueChange={(v) =>
                            handleOverride(player.id, day.day_of_week, v as TeamPlanIntensity)
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-28 border-0 bg-transparent px-1 shadow-none"
                          >
                            <Badge className={`${intensityStyles[day.intensity]} capitalize`}>
                              {day.overridden && '✎ '}
                              {day.focus}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {INTENSITIES.map((i) => (
                              <SelectItem key={i} value={i} className="capitalize">
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handlePublish} disabled={publishing || draft.published}>
              {draft.published ? (
                <>
                  <Check className="size-3.5" />
                  Published — players notified
                </>
              ) : publishing ? (
                'Publishing…'
              ) : (
                'Publish plan to squad'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
