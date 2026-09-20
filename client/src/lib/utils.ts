import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number | undefined | null, compact = false): string {
  const value = n ?? 0;
  if (compact) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(d?: string | Date | null, pattern = 'd MMM yyyy'): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, pattern);
}

export function formatTime(d?: string | Date | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'h:mm a');
}

export function initials(name?: string): string {
  if (!name) return 'NA';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function titleCase(s: string): string {
  return s
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function pageTitle(base: string): string {
  return `${base} · Smart AutoCare`;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message || anyErr?.message || fallback;
}

export function toQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function healthLabel(score: number | undefined | null): string {
  if (score === undefined || score === null) return 'Not assessed';
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs attention';
}

export function statusTone(status: string): string {
  const s = status.toLowerCase();
  if (/paid|completed|approved|closed|delivered|confirmed|active|received|ready|released/.test(s)) return 'green';
  if (/pending|book|waiting|scheduled|awaiting|open|inspection|check/.test(s)) return 'amber';
  if (/progress|estimate|parts|quality|invoiced|new|processing/.test(s)) return 'blue';
  if (/cancelled|void|failed|rejected|overdue|due|danger|attention/.test(s)) return 'red';
  if (/partially|hold|rescheduled/.test(s)) return 'purple';
  return 'slate';
}

export function calculateAgeYears(manufactureYear: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - manufactureYear);
}