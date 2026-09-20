import { cn } from '../../lib/utils';
import { SpinnerMini } from './Button';
import { Inbox } from 'lucide-react';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
      <SpinnerMini className="h-8 w-8 text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800', className)} />;
}

export function SkeletonGrid({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-7 w-1/2" />
          <Skeleton className="mt-3 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}