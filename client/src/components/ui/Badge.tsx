import { cn, statusTone } from '../../lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Info, CircleDot } from 'lucide-react';

const tones: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300',
};

function IconFor({ tone }: { tone: string }) {
  const cls = 'h-3 w-3';
  switch (tone) {
    case 'green':
      return <CheckCircle2 className={cls} />;
    case 'amber':
      return <Clock className={cls} />;
    case 'red':
      return <XCircle className={cls} />;
    case 'blue':
      return <Info className={cls} />;
    case 'purple':
      return <CircleDot className={cls} />;
    default:
      return <AlertTriangle className={cls} />;
  }
}

export function Badge({ className, children, tone = 'slate' }: { className?: string; children: React.ReactNode; tone?: string }) {
  return (
    <span className={cn('badge ring-1 ring-inset', tones[tone] || tones.slate, className)}>
      <IconFor tone={tone} />
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone(status || '');
  return <Badge tone={tone}>{status || 'Unknown'}</Badge>;
}

export function HealthScoreBadge({ score }: { score?: number | null }) {
  if (score === undefined || score === null) return <Badge tone="slate">Not assessed</Badge>;
  const tone = score >= 90 ? 'green' : score >= 70 ? 'blue' : score >= 50 ? 'amber' : 'red';
  return <Badge tone={tone}>{score} / 100</Badge>;
}