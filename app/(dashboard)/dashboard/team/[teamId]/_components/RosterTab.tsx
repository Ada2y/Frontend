'use client';

import {useState, type FormEvent} from 'react';
import {Link2, Phone, Video, Check} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import InjuryRiskBadge from '@/app/(dashboard)/_components/InjuryRiskBadge';
import {TeamService} from '@/lib/mocks/team-service';
import type {Team} from '@/lib/api';

function formatLastSession(iso: string | null) {
  if (!iso) return 'No sessions yet';
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

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
          <DialogDescription>Share a join link or invite by phone number.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm text-foreground">
            <Check className="size-4 text-[#22c55e]" />
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

export default function RosterTab({team}: {team: Team}) {
  const [assigned, setAssigned] = useState<Record<string, boolean>>({});

  function handleAssign(playerId: string) {
    setAssigned((prev) => ({...prev, [playerId]: true}));
  }

  if (team.players.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <InviteDialog teamId={team.id} />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
          <Video className="size-4" />
          No players invited yet — share the team link to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <InviteDialog teamId={team.id} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Injury risk</TableHead>
            <TableHead>Last session</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium text-foreground">{player.full_name}</TableCell>
              <TableCell>
                <InjuryRiskBadge level={player.injury_risk} />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {formatLastSession(player.last_session_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      {assigned[player.id] ? 'Session assigned' : 'Assign session'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleAssign(player.id)}>
                      <Video className="size-3.5" />
                      Assign a video upload session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
