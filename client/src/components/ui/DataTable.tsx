import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from './Feedback';
import { Skeleton } from './Feedback';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sort?: (a: T, b: T) => number;
  sortValue?: (row: T) => string | number;
  className?: string;
  thClass?: string;
}

export function DataTable<T extends { _id: string }>({
  columns,
  data,
  loading,
  searchable,
  searchPlaceholder = 'Search…',
  page,
  totalPages,
  onPageChange,
  onSearch,
  emptyTitle,
  emptyDescription,
  rowClick,
  keyField = '_id',
  footer,
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  onSearch?: (q: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  rowClick?: (row: T) => void;
  keyField?: keyof T;
  footer?: ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [q, setQ] = useState('');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return data;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => (col.sort as (a: T, b: T) => number)(a, b) * dir);
  }, [data, sortKey, sortDir, columns]);

  const toggleSort = (col: Column<T>) => {
    if (!col.sort) return;
    if (col.key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const handleSearch = (v: string) => {
    setQ(v);
    onSearch?.(v);
  };

  return (
    <div>
      {searchable && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="input-base pl-9"
            />
          </div>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sort && toggleSort(col)}
                      className={cn(
                        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
                        col.sort && 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-200',
                        col.thClass,
                      )}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {col.header}
                        {sortKey === col.key &&
                          (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((row) => (
                  <tr
                    key={String(row[keyField])}
                    onClick={() => rowClick?.(row)}
                    className={cn(
                      'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      rowClick && 'cursor-pointer',
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {(page !== undefined && totalPages !== undefined) && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page {page} of {Math.max(totalPages, 1)}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {footer}
      </div>
    </div>
  );
}