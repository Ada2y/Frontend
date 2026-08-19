import type {LucideIcon} from 'lucide-react';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Sparkles,
  ShieldAlert,
  Video,
  Activity,
  User,
  Users,
  Users2,
  BookOpen
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
  }
  // Team screens (US-C01-C05) and Admin Users/Knowledge Base (US-AD01/AD02)
  // run on mock data (lib/mocks/team-service.ts, lib/mocks/admin-service.ts)
  // until their backend endpoints ship - see Ada2y_Backend_AI_TODO.md #6/#7.
];

export function navItemsForRole(role: string | undefined): DashboardNavItem[] {
  if (!role) return dashboardNavItems.filter((item) => !item.roles);
  return dashboardNavItems.filter((item) => !item.roles || item.roles.includes(role));
}
