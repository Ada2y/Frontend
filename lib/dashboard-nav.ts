import type {LucideIcon} from 'lucide-react';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Sparkles,
  ShieldAlert,
  Video,
  Activity,
  User
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
  {
    label: 'Review Queue',
    href: '/dashboard/admin/review-queue',
    icon: ShieldAlert,
    roles: REVIEW_ROLES
  }
  // "Team" is intentionally not listed - there's no backend for it yet
  // (only a local, non-persistent mock), so it's not a real nav destination.
];

export function navItemsForRole(role: string | undefined): DashboardNavItem[] {
  if (!role) return dashboardNavItems.filter((item) => !item.roles);
  return dashboardNavItems.filter((item) => !item.roles || item.roles.includes(role));
}
