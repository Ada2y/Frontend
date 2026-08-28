'use client';

import {useCallback, useEffect, useState} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users2
} from 'lucide-react';
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
import StatCard from '@/app/(dashboard)/_components/StatCard';
import {ApiClient, type AccountStatus, type AdminUser, type UserRole} from '@/lib/api';
import {cn} from '@/lib/utils';

const COLORS = {
  primary: '#5e6ad2',
  blue: '#3b82f6',
  green: '#22c55e'
} as const;

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<UserRole, string> = {
  athlete: 'Athlete',
  coach: 'Coach',
  medical_reviewer: 'Medical reviewer',
  platform_admin: 'Platform admin'
};

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_verification: 'Pending verification',
  deleted: 'Deleted'
};

const STATUSES = Object.keys(STATUS_LABELS) as AccountStatus[];

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: 'bg-success-bg text-success',
  suspended: 'bg-danger-bg text-danger',
  pending_verification: 'bg-warning-bg text-warning',
  deleted: 'bg-muted text-muted-foreground'
};

function formatCreated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** Only the fields the backend actually stores on a user - the old export
 * carried plan tier, session count and last-active, none of which exist. */
function toCsv(rows: AdminUser[]): string {
  const header = 'id,email,full_name,role,status,created_at';
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = rows.map((u) =>
    [u.id, u.email, u.full_name ?? '', u.role, u.status, u.created_at].map(escape).join(',')
  );
  return [header, ...lines].join('\n');
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
  const [page, setPage] = useState<{total: number; items: AdminUser[]} | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [resetSentFor, setResetSentFor] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await ApiClient.listUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        skip,
        limit: PAGE_SIZE
      });
      setPage({total: result.total, items: result.items});
      setError(null);
    } catch (err) {
      setPage({total: 0, items: []});
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    }
  }, [roleFilter, statusFilter, skip]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Any filter change invalidates the current offset - staying on page 3 of a
  // result set that now has one page would render an empty table.
  function changeFilter(fn: () => void) {
    setSkip(0);
    setPage(null);
    fn();
  }

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    setBusyUserId(user.id);
    try {
      const updated = await ApiClient.updateUser(user.id, {role});
      setPage((prev) =>
        prev ? {...prev, items: prev.items.map((u) => (u.id === user.id ? updated : u))} : prev
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change that role.');
    } finally {
      setBusyUserId(null);
    }
  }

  /** There is no admin-initiated reset endpoint, but /auth/forgot-password
   * takes an email and mails the real code - so this is the genuine flow,
   * triggered on the user's behalf. */
  async function handleResetPassword(user: AdminUser) {
    setBusyUserId(user.id);
    try {
      await ApiClient.forgotPassword(user.email);
      setResetSentFor(user.id);
      setTimeout(() => setResetSentFor(null), 3000);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the reset email.');
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleConfirmStatus() {
    if (!statusTarget) return;
    const next: AccountStatus = statusTarget.status === 'active' ? 'suspended' : 'active';
    setBusyUserId(statusTarget.id);
    try {
      const updated = await ApiClient.updateUser(statusTarget.id, {status: next});
      setPage((prev) =>
        prev ? {...prev, items: prev.items.map((u) => (u.id === updated.id ? updated : u))} : prev
      );
      setError(null);
      setStatusTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change that account status.');
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setBusyUserId(deleteTarget.id);
    try {
      await ApiClient.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete that account.');
    } finally {
      setBusyUserId(null);
    }
  }

  const rows = page?.items ?? [];
  const total = page?.total ?? 0;
  const pageStart = total === 0 ? 0 : skip + 1;
  const pageEnd = Math.min(skip + PAGE_SIZE, total);
  const activeCount = rows.filter((u) => u.status === 'active').length;
  const staffCount = rows.filter(
    (u) => u.role === 'coach' || u.role === 'platform_admin' || u.role === 'medical_reviewer'
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-base text-muted-foreground">
            Every account on the platform — roles, status and access.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={rows.length === 0}
          onClick={() => downloadCsv(toCsv(rows))}
        >
          <Download className="size-3.5" />
          Export this page
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users2}
          label="Total users"
          value={total}
          description="Matching the current filters"
          accentColor={COLORS.primary}
        />
        <StatCard
          icon={UserCheck}
          label="Active"
          value={activeCount}
          description="On this page"
          accentColor={COLORS.green}
        />
        <StatCard
          icon={ShieldCheck}
          label="Staff"
          value={staffCount}
          description="Coaches, reviewers and admins on this page"
          accentColor={COLORS.blue}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={roleFilter}
          onValueChange={(v) => changeFilter(() => setRoleFilter(v as UserRole | 'all'))}
        >
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
        <Select
          value={statusFilter}
          onValueChange={(v) => changeFilter(() => setStatusFilter(v as AccountStatus | 'all'))}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {page === null ? (
        <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No users match these filters"
          description="Try a different role or status."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {user.full_name ?? 'No name set'}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user, v as UserRole)}
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
                    <TableCell>
                      <Badge className={cn(STATUS_STYLES[user.status])}>
                        {STATUS_LABELS[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {formatCreated(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetPassword(user)}
                          disabled={busyUserId === user.id || resetSentFor === user.id}
                        >
                          <KeyRound className="size-3.5" />
                          {resetSentFor === user.id ? 'Sent' : 'Reset password'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyUserId === user.id}
                          onClick={() => setStatusTarget(user)}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${user.email}`}
                          disabled={busyUserId === user.id}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="size-3.5 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground tabular-nums">
              {pageStart}–{pageEnd} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={skip + PAGE_SIZE >= total}
                onClick={() => setSkip((s) => s + PAGE_SIZE)}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusTarget?.status === 'active' ? 'Suspend account' : 'Reactivate account'}
            </DialogTitle>
            <DialogDescription>
              {statusTarget?.status === 'active'
                ? `${statusTarget?.email} will lose access immediately.`
                : `${statusTarget?.email} will regain access immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={statusTarget?.status === 'active' ? 'destructive' : 'default'}
              onClick={handleConfirmStatus}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              {deleteTarget?.email} will be deleted. This cannot be undone from here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
