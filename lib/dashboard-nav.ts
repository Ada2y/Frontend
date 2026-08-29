import type {LucideIcon} from 'lucide-react';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Sparkles,
  ShieldAlert,
  Video,
  Activity,
  ShieldCheck,
  User,
  Users,
  Users2,
  BookOpen,
  LifeBuoy
} from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles that can see this item. Omit for "every logged-in role". */
  roles?: string[];
}

const ATHLETE_ONLY = ['athlete'];
const REVIEW_ROLES = ['coach', 'medical_reviewer', 'platform_admin'];
const COACH_ONLY = ['coach'];
const PLATFORM_ADMIN_ONLY = ['platform_admin'];

export const dashboardNavItems: DashboardNavItem[] = [
  {label: 'Overview', href: '/dashboard', icon: LayoutDashboard},
  {label: 'Profile', href: '/dashboard/profile', icon: User, roles: ATHLETE_ONLY},
  {label: 'Training Plan', href: '/dashboard/training-plan', icon: Dumbbell, roles: ATHLETE_ONLY},
  {label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple, roles: ATHLETE_ONLY},
  {
    label: 'Sport Suggestion',
    href: '/dashboard/sport-suggestion',
    icon: Sparkles,
    roles: ATHLETE_ONLY
  },
  {label: 'Videos', href: '/dashboard/videos', icon: Video, roles: ATHLETE_ONLY},
  {label: 'Biomechanics', href: '/dashboard/biomechanics', icon: Activity, roles: ATHLETE_ONLY},
  {label: 'Injury Risk', href: '/dashboard/injury-risk', icon: ShieldCheck, roles: ATHLETE_ONLY},
  {label: 'Team', href: '/dashboard/team', icon: Users, roles: COACH_ONLY},
  {
    label: 'Review Queue',
    href: '/dashboard/admin/review-queue',
    icon: ShieldAlert,
    roles: REVIEW_ROLES
  },
  {
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: Users2,
    roles: PLATFORM_ADMIN_ONLY
  },
  {
    label: 'Knowledge Base',
    href: '/dashboard/admin/knowledge-base',
    icon: BookOpen,
    roles: PLATFORM_ADMIN_ONLY
  },
  // No `roles`: help is for everyone. A coach fielding "how do I film this?"
  // needs the same clips and the same assistant an athlete does.
  {label: 'Help', href: '/dashboard/help', icon: LifeBuoy}
  // Team and Admin screens are wired to the real API (/coach/* and /admin/*).
  // The few coach features with no endpoint - invites, private notes, the team
  // plan builder, body-part risk - still read lib/mocks/team-service.ts and are
  // labelled with <MockBadge /> wherever they render.
];

export function navItemsForRole(role: string | undefined): DashboardNavItem[] {
  if (!role) return dashboardNavItems.filter((item) => !item.roles);
  return dashboardNavItems.filter((item) => !item.roles || item.roles.includes(role));
}

/** Roles allowed on a dashboard path, derived from the nav table so the guard
 * and the sidebar can never disagree about who may see a page. The longest
 * matching href wins, so `/dashboard/admin/users` resolves to the Users entry
 * rather than the catch-all `/dashboard` overview. */
export function allowedRolesForPath(pathname: string): string[] | undefined {
  const match = dashboardNavItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  // A path under /dashboard/admin with no nav entry (a future admin page, or
  // the bare /dashboard/admin segment) must not fall through to the unguarded
  // overview entry - default it closed.
  if (!match?.roles && pathname.startsWith('/dashboard/admin')) return PLATFORM_ADMIN_ONLY;

  return match?.roles;
}
