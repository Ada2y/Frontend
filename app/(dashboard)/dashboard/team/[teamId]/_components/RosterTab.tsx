'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {Check, Link2, Loader2, Phone, Search, Trash2, UserPlus, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import AthleteLabel from '@/app/(dashboard)/_components/AthleteLabel';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import RiskBandBadge from '@/app/(dashboard)/_components/RiskBandBadge';
import {ApiClient, type AthleteSearchResult, type TeamDetail, type TeamRiskStat} from '@/lib/api';
import {TeamService} from '@/lib/mocks/team-service';

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_MIN_CHARS = 2;

/** Real roster change. The coach finds the athlete through /coach/athletes -
 * by name, email, or an id pasted from somewhere else - rather than having to
 * know a UUID, which is the only thing this dialog used to accept. */
function AddPlayerDialog({
  teamId,
  memberIds,
  onAdded
}: {
  teamId: string;
  memberIds: Set<string>;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AthleteSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = query.trim();
    let cancelled = false;

    // Debounced so a coach typing a name does not fire a request per keystroke.
    const timer = setTimeout(() => {
      (async () => {
        if (term.length < SEARCH_MIN_CHARS) {
          setResults(null);
          return;
        }
        setSearching(true);
        try {
          const data = await ApiClient.searchAthletes(term);
          if (!cancelled) {
            setResults(data);
            setError(null);
          }
        } catch (err) {
          if (cancelled) return;
          setResults([]);
          setError(err instanceof Error ? err.message : 'Could not search for athletes.');
        } finally {
          if (!cancelled) setSearching(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  async function handleAdd(athlete: AthleteSearchResult) {
    setAdding(athlete.id);
    setError(null);
    try {
      await ApiClient.addTeamMember(teamId, athlete.id);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that athlete.');
    } finally {
      setAdding(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery('');
          setResults(null);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-3.5" />
          Add player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add a player</DialogTitle>
            <DialogDescription>
              Search by name or email. The athlete needs an Ada2y account already.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="athlete-search">Find an athlete</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="athlete-search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email or athlete id…"
                className="pl-8"
              />
              {searching && (
                <Loader2 className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {results === null ? (
              <p className="px-1 py-2 text-sm text-muted-foreground">
                Type at least {SEARCH_MIN_CHARS} characters to search.
              </p>
            ) : results.length === 0 ? (
              <p className="px-1 py-2 text-sm text-muted-foreground">
                No athlete matches “{query.trim()}”.
              </p>
            ) : (
              results.map((athlete) => {
                const alreadyOnTeam = memberIds.has(athlete.id);
                return (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {athlete.full_name || 'No name on this account'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {athlete.email}
                      </span>
                    </div>
                    {alreadyOnTeam ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Check className="size-3.5 text-success" />
                        On this team
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={adding !== null}
                        onClick={() => handleAdd(athlete)}
                      >
                        {adding === athlete.id ? 'Adding…' : 'Add'}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Invites by link or phone have no backend endpoint - this dialog still runs
 * on lib/mocks/team-service, so nothing it "sends" leaves the browser. */
function InviteDialog({teamId}: {teamId: string}) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<'link' | 'phone'>('link');
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const invite = await TeamService.inviteToTeam(teamId, {
      method,
      value: method === 'link' ? `https://ada2y.app/join/${teamId}` : value
    });
    setSent(invite.value);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(null);
          setValue('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Invite player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a player</DialogTitle>
          <DialogDescription>Share a join link, or invite by phone number.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm text-foreground">
            <Check className="size-4 text-success" />
            {method === 'link' ? `Link ready: ${sent}` : `Invite sent to ${sent}`}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={method === 'link' ? 'default' : 'outline'}
                onClick={() => setMethod('link')}
              >
                <Link2 className="size-3.5" />
                Link
              </Button>
              <Button
                type="button"
                size="sm"
                variant={method === 'phone' ? 'default' : 'outline'}
                onClick={() => setMethod('phone')}
              >
                <Phone className="size-3.5" />
                Phone
              </Button>
            </div>
            {method === 'phone' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-phone">Phone number</Label>
                <Input
                  id="invite-phone"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="+20 10 1234 5678"
                />
              </div>
            )}
            <DialogFooter>
              <Button type="submit">{method === 'link' ? 'Generate link' : 'Send invite'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function RosterTab({
  team,
  riskStats,
  onRosterChange
}: {
  team: TeamDetail;
  riskStats: TeamRiskStat[];
  onRosterChange: () => void;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const riskByAthlete = new Map(riskStats.map((r) => [r.athlete_user_id, r]));
  const memberIds = new Set(team.members.map((m) => m.user_id));

  async function handleRemove(athleteUserId: string) {
    setRemoving(athleteUserId);
    setError(null);
    try {
      await ApiClient.removeTeamMember(team.id, athleteUserId);
      onRosterChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that athlete.');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <InviteDialog teamId={team.id} />
        <AddPlayerDialog teamId={team.id} memberIds={memberIds} onAdded={onRosterChange} />
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {team.members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players on this roster"
          description="Add an athlete by their user id to start tracking their risk screening here."
        />
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Athlete</TableHead>
                <TableHead>Risk screening</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map((member) => {
                const risk = riskByAthlete.get(member.user_id);
                return (
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <AthleteLabel userId={member.user_id} name={member.athlete_name} />
                    </TableCell>
                    <TableCell>
                      <RiskBandBadge band={risk?.band ?? null} available={risk?.available} />
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {risk?.score != null ? Math.round(risk.score) : '—'}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {formatJoined(member.joined_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={removing === member.user_id}
                        onClick={() => handleRemove(member.user_id)}
                      >
                        <Trash2 className="size-3.5" />
                        {removing === member.user_id ? 'Removing…' : 'Remove'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
