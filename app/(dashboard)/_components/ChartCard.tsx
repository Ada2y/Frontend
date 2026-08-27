import {cn} from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  accentColor,
  children,
  className
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10',
        className
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{background: accentColor}}
      />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
