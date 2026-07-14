import type {LucideIcon} from 'lucide-react';
import {LayoutDashboard, Dumbbell, Apple, Users, ShieldAlert, Video, Activity} from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {label: 'Overview', href: '/dashboard', icon: LayoutDashboard},
  {label: 'Training Plan', href: '/dashboard/training-plan', icon: Dumbbell},
  {label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple},
  {label: 'Team', href: '/dashboard/team', icon: Users},
  {label: 'Review Queue', href: '/dashboard/admin/review-queue', icon: ShieldAlert},
  {label: 'Videos', href: '/dashboard/videos', icon: Video},
  {label: 'Biomechanics', href: '/dashboard/biomechanics', icon: Activity}
];
