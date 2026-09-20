import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  sub,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: 'brand' | 'green' | 'amber' | 'red' | 'violet' | 'sky';
  sub?: string;
  href?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  };

  const content = (
    <div className="card group relative p-5 transition-shadow hover:shadow-card-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }
  return content;
}