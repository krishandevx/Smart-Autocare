import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useAdminEstimates, useAdminEstimateDecision } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import type { Estimate } from '../../types';

export default function Estimates() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminEstimates({ q: q || undefined, page, limit: 12, status: status || undefined });
  const decide = useAdminEstimateDecision();
  const toast = useToast();
  const [viewing, setViewing] = useState<Estimate | null>(null);
  const [deciding, setDeciding] = useState<Estimate | null>(null);
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [busy, setBusy] = useState(false);

  const runDecision = async () => {
    if (!deciding) return;
    setBusy(true);
    try {
      await decide.mutateAsync({ id: deciding._id, decision });
      toast.success(`Estimate ${decision.toLowerCase()}. Job card updates accordingly.`);
      setDeciding(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Estimate>[] = [
    { key: 'estimateId', header: 'Estimate', render: (e) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{e.estimateId}</span> },
    { key: 'customer', header: 'Customer', render: (e) => unuser(e.customer)?.name, sortValue: (e) => unuser(e.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (e) => `${unvehicle(e.vehicle)?.brand} ${unvehicle(e.vehicle)?.model}`, sortValue: (e) => `${unvehicle(e.vehicle)?.brand} ${unvehicle(e.vehicle)?.model}` },
    { key: 'items', header: 'Lines', render: (e) => <span className="text-slate-500">{e.items.length}</span> },
    { key: 'total', header: 'Total', render: (e) => <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(e.total)}</span>, sort: (a, b) => a.total - b.total },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'actions', header: 'Actions', render: (e) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setViewing(e)}>
            <FileText className="h-3.5 w-3.5" /> View
          </Button>
          {canDecide(e.status) && (
            <>
              <Button size="sm" variant="outline" onClick={() => { setDeciding(e); setDecision('Approved'); }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => { setDeciding(e); setDecision('Rejected'); }}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
        </div>
      ) },
  ];

  function canDecide(s: string) {
    return ['Sent', 'Draft', 'Partially Approved'].includes(s);
  }

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Estimates</title>
      </Helmet>
      <PageHeader
        title="Estimates"
        subtitle="Work estimates sent to customers for approval"
        actions={
          <Link to="/admin/reports" className="btn-secondary">Reports</Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'Draft', 'Sent', 'Partially Approved', 'Approved', 'Rejected'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1); }}
            className={
              status === s
                ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Estimate[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search estimates…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={`Estimate ${viewing?.estimateId ?? ''}`} size="lg">
        {viewing && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{unuser(viewing.customer)?.name}</p>
                <p className="text-xs text-slate-400">{unvehicle(viewing.vehicle)?.brand} {unvehicle(viewing.vehicle)?.model} · {unvehicle(viewing.vehicle)?.regNumber}</p>
              </div>
              <StatusBadge status={viewing.status} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {viewing.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-100">{it.description}</td>
                    <td className="py-2 text-center text-slate-600 dark:text-slate-300">{it.qty}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-300">{formatCurrency(it.rate)}</td>
                    <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
              <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>{formatCurrency(viewing.subtotal)}</span></p>
              <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Tax ({viewing.taxRate}%)</span><span>{formatCurrency(viewing.tax)}</span></p>
              <p className="flex justify-between font-display text-lg font-extrabold text-slate-900 dark:text-white"><span>Total</span><span>{formatCurrency(viewing.total)}</span></p>
            </div>
            {viewing.customerNote && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                Customer note: {viewing.customerNote}
              </p>
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deciding}
        onClose={() => setDeciding(null)}
        onConfirm={() => void runDecision()}
        title={`${decision} estimate`}
        message={
          decision === 'Approved'
            ? `Approve ${deciding?.estimateId}? The linked job card will move to "In Progress".`
            : `Reject ${deciding?.estimateId}? The job card will stay at "Awaiting Approval".`
        }
        confirmLabel={decision === 'Approved' ? 'Approve estimate' : 'Reject estimate'}
        loading={busy}
      />
    </>
  );
}