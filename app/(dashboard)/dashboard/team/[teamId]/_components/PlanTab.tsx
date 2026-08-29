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
import {shortAthleteId} from '@/app/(dashboard)/_components/AthleteLabel';
import {TeamService, type TeamPlanDraft, type TeamPlanIntensity} from '@/lib/mocks/team-service';
import type {TeamDetail} from '@/lib/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INTENSITIES: TeamPlanIntensity[] = ['light', 'moderate', 'peak'];

const intensityStyles: Record<TeamPlanIntensity, string> = {
  light: 'bg-success-bg text-success',
  moderate: 'bg-warning-bg text-warning',
  peak: 'bg-danger-bg text-danger'
};

/** Entirely mock-backed: there is no team-plan endpoint. /training-plans is
 * athlete-scoped and generates a plan for the caller, so a coach cannot build
 * or publish a squad microcycle through the API yet. */
export default function PlanTab({team}: {team: TeamDetail}) {
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
        team.members.map((m) => m.user_id)
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

  if (team.members.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
        Add players to the roster before generating a team plan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
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
                {team.members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-mono text-foreground">
                      {shortAthleteId(member.user_id)}
                    </TableCell>
                    {(draft.per_player[member.user_id] ?? []).map((day) => (
                      <TableCell key={day.day_of_week}>
                        <Select
                          value={day.intensity}
                          onValueChange={(v) =>
                            handleOverride(member.user_id, day.day_of_week, v as TeamPlanIntensity)
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
