'use client';

import {useEffect, useMemo, useState} from 'react';
import {Download, KeyRound, Users2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {AdminService, type AdminUser, type AdminUserRole} from '@/lib/mocks/admin-service';
import {cn} from '@/lib/utils';

type SortKey = 'full_name' | 'role' | 'plan_tier' | 'last_active_at';

const ROLE_LABELS: Record<AdminUserRole, string> = {
  athlete: 'Athlete',
  coach: 'Coach',
  medical_reviewer: 'Medical reviewer',
  platform_admin: 'Platform admin'
};

const ROLES = Object.keys(ROLE_LABELS) as AdminUserRole[];

function formatLastActive(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ada2y-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('full_name');
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [resetSentFor, setResetSentFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AdminService.listUsers().then((data) => {
      if (!cancelled) setUsers(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!users) return [];
    const filtered = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);
    return [...filtered].sort((a, b) => {
      if (sortKey === 'last_active_at') {
        return (b.last_active_at ?? '').localeCompare(a.last_active_at ?? '');
      }
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });
  }, [users, roleFilter, sortKey]);

  async function handleRoleChange(userId: string, role: AdminUserRole) {
    const updated = await AdminService.updateUserRole(userId, role);
    setUsers((prev) => (prev ? prev.map((u) => (u.id === userId ? updated : u)) : prev));
  }

  async function handleResetPassword(userId: string) {
    await AdminService.resetPassword(userId);
    setResetSentFor(userId);
    setTimeout(() => setResetSentFor(null), 3000);
  }

  async function handleConfirmSuspend() {
    if (!suspendTarget) return;
    const nextStatus = suspendTarget.status === 'active' ? 'suspended' : 'active';
    const updated = await AdminService.setUserStatus(suspendTarget.id, nextStatus);
    setUsers((prev) => (prev ? prev.map((u) => (u.id === suspendTarget.id ? updated : u)) : prev));
    setSuspendTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage accounts, roles, and support requests across the platform.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!rows.length}
          onClick={() => downloadCsv(AdminService.exportUsersCsv(rows))}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AdminUserRole | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_name">Sort: Name</SelectItem>
            <SelectItem value="role">Sort: Role</SelectItem>
            <SelectItem value="plan_tier">Sort: Plan tier</SelectItem>
            <SelectItem value="last_active_at">Sort: Last active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users === null ? (
        <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No users match this filter"
          description="Try a different role filter."
        />
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as AdminUserRole)}
                    >
                      <SelectTrigger size="sm" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="capitalize">{user.plan_tier}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatLastActive(user.last_active_at)}
                  </TableCell>
                  <TableCell className="tabular-nums">{user.session_count}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        user.status === 'active'
                          ? 'bg-[#22c55e]/10 text-[#22c55e]'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResetPassword(user.id)}
                        disabled={resetSentFor === user.id}
                      >
                        <KeyRound className="size-3.5" />
                        {resetSentFor === user.id ? 'Sent' : 'Reset password'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSuspendTarget(user)}>
                        {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendTarget?.status === 'active' ? 'Suspend account' : 'Reactivate account'}
            </DialogTitle>
            <DialogDescription>
              {suspendTarget?.status === 'active'
                ? `${suspendTarget?.full_name} will lose access immediately.`
                : `${suspendTarget?.full_name} will regain access immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={suspendTarget?.status === 'active' ? 'destructive' : 'default'}
              onClick={handleConfirmSuspend}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
