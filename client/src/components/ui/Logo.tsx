import { APP_NAME } from '../../constants';
import { cn } from '../../lib/utils';

export function Logo({ className, dark, onClick }: { className?: string; dark?: boolean; onClick?: () => void }) {
  return (
    <a href="/" onClick={onClick} className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-md shadow-brand-500/30">
        <svg viewBox="0 0 64 64" className="h-6 w-6">
          <path d="M19 40l2-7 3-8h16l3 8 2 7h-5.5v-4.5h-12V40z" fill="#fff" />
          <circle cx="24.5" cy="41.5" r="3.2" fill="#0f172a" />
          <circle cx="39.5" cy="41.5" r="3.2" fill="#0f172a" />
        </svg>
      </span>
      <span className={cn('font-display text-lg font-extrabold tracking-tight', dark ? 'text-white' : 'text-slate-900 dark:text-white')}>
        {APP_NAME}
      </span>
    </a>
  );
}