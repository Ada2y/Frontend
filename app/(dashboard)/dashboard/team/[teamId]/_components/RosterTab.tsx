'use client';

import {useState, type FormEvent} from 'react';
import {Check, Link2, Phone, Trash2, UserPlus, Users} from 'lucide-react';
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
import MockBadge from '@/app/(dashboard)/_components/MockBadge';
import RiskBandBadge from '@/app/(dashboard)/_components/RiskBandBadge';
import {ApiClient, type TeamDetail, type TeamRiskStat} from '@/lib/api';
import {TeamService} from '@/lib/mocks/team-service';

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** Real roster change. The backend has no invite flow, so joining a team means
 * the coach already knows the athlete's user id and pastes it here. */
function AddPlayerDialog({teamId, onAdded}: {teamId: string; onAdded: () => void}) {
  const [open, setOpen] = useState(false);
  const [athleteId, setAthleteId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await ApiClient.addTeamMember(teamId, athleteId.trim());
      setAthleteId('');
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that athlete.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-3.5" />
          Add player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add a player</DialogTitle>
            <DialogDescription>
              Athletes join by user id — the account has to exist already.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="athlete-id">Athlete user id</Label>
            <Input
              id="athlete-id"
              required
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="font-mono"
            />
          </div>
          {error && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={saving || !athleteId.trim()}>
              {saving ? 'Adding…' : 'Add to roster'}
            </Button>
          </DialogFooter>
        </form>
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
          <DialogTitle className="flex items-center gap-2">
            Invite a player
            <MockBadge />
          </DialogTitle>
          <DialogDescription>
            Share a join link or invite by phone number. No backend endpoint exists for invites yet,
            so nothing is actually sent.
          </DialogDescription>
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
        <AddPlayerDialog teamId={team.id} onAdded={onRosterChange} />
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
                      <AthleteLabel userId={member.user_id} />
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
