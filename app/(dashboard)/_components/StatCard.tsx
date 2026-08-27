import type {LucideIcon} from 'lucide-react';
import {cn} from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  accentColor: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accentColor,
  className
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:ring-foreground/20',
        className
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{background: accentColor}}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="text-4xl font-bold tracking-tight text-foreground">{value}</span>
          {description && (
            <span className="mt-1 text-sm text-muted-foreground">{description}</span>
          )}
        </div>
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{backgroundColor: `${accentColor}10`, color: accentColor}}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </div>
  );
}
