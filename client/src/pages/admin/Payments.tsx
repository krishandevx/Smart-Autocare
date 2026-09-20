import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Wallet, ArrowLeftRight } from 'lucide-react';
import { usePayments } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { unuser } from './shared';
import { PAYMENT_METHODS } from '../../constants';
import type { Payment } from '../../types';

function invLabel(p: Payment): string {
  return typeof p.invoice === 'string' ? p.invoice : p.invoice.invoiceNumber;
}

function invId(p: Payment): string {
  return typeof p.invoice === 'string' ? p.invoice : p.invoice._id;
}

export default function Payments() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePayments({ page, limit: 15 });

  const methodTone = (m: string): 'blue' | 'slate' => ((PAYMENT_METHODS as readonly string[]).includes(m) ? 'blue' : 'slate');

  const columns: Column<Payment>[] = [
    { key: 'date', header: 'Date', render: (p) => <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(p.date)}</span>, sort: (a, b) => String(a.date).localeCompare(String(b.date)) },
    { key: 'customer', header: 'Customer', render: (p) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{unuser(p.customer)?.name ?? '—'}</span>
      ), sortValue: (p) => unuser(p.customer)?.name ?? '' },
    { key: 'invoice', header: 'Invoice', render: (p) => (
        <Link to={`/admin/invoices/${invId(p)}`} className="font-mono text-xs font-bold text-brand-600 hover:underline dark:text-brand-400">
          {invLabel(p)}
        </Link>
      ) },
    { key: 'amount', header: 'Amount', render: (p) => <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(p.amount)}</span>, sort: (a, b) => a.amount - b.amount },
    { key: 'method', header: 'Method', render: (p) => <Badge tone={methodTone(p.method)}>{p.method}</Badge> },
    { key: 'reference', header: 'Reference', render: (p) => <span className="text-xs text-slate-500">{p.reference || '—'}</span> },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={p.status === 'Completed' ? 'green' : 'amber'}>{p.status}</Badge> },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Payments</title>
      </Helmet>
      <PageHeader
        title="Payments"
        subtitle="Every payment received against invoices"
      />
      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Payment[]}
        loading={isLoading}
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
      />
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Wallet className="h-3.5 w-3.5" /> Collected against <span className="inline-flex items-center gap-1"><ArrowLeftRight className="h-3 w-3" /> invoices</span> · ticking balance due down as it clears.
      </p>
    </>
  );
}