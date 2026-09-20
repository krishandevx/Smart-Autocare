import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors',
            active === t.id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-xl border border-slate-200 p-0.5 dark:border-slate-700', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === o.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function useTabs(initial: string) {
  const [active, setActive] = useState(initial);
  return { active, setActive };
}