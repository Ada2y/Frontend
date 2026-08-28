import Link from 'next/link';
import {Upload, FileText, Apple, BarChart3} from 'lucide-react';

const actions = [
  {label: 'Upload Video', href: '/dashboard/videos', icon: Upload, color: '#3b82f6'},
  {label: 'View Reports', href: '/dashboard/biomechanics', icon: BarChart3, color: '#5e6ad2'},
  {label: 'Training Plan', href: '/dashboard/training-plan', icon: FileText, color: '#f59e0b'},
  {label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple, color: '#22c55e'}
] as const;

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:ring-foreground/20"
        >
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
            style={{backgroundColor: `${action.color}12`, color: action.color}}
          >
            <action.icon className="size-5" />
          </div>
          <span className="text-base font-medium text-foreground">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
