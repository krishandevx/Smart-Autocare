import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Download, Wallet } from 'lucide-react';
import { useInvoices, useDownloadInvoicePdf, useRecordPayment } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import { PAYMENT_METHODS, INVOICE_STATUSES } from '../../constants';
import type { Invoice } from '../../types';

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useInvoices({ q: q || undefined, page, limit: 12, paymentStatus: status || undefined });
  const pdf = useDownloadInvoicePdf();
  const recordP = useRecordPayment();
  const toast = useToast();
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);

  const runPdf = async (inv: Invoice) => {
    setBusy(true);
    try {
      await pdf.mutateAsync(inv._id);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const record = async () => {
    if (!payTarget) return;
    if (amount <= 0 || amount > payTarget.remaining) {
      toast.error(`Enter an amount between 1 and ${payTarget.remaining}`);
      return;
    }
    setBusy(true);
    try {
      await recordP.mutateAsync({ invoice: payTarget._id, amount, method, reference });
      toast.success('Payment recorded');
      setPayTarget(null);
      setAmount(0);
      setReference('');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice', render: (i) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{i.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (i) => unuser(i.customer)?.name, sortValue: (i) => unuser(i.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (i) => `${unvehicle(i.vehicle)?.brand} ${unvehicle(i.vehicle)?.model}` },
    { key: 'issuedDate', header: 'Issued', render: (i) => <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(i.issuedDate)}</span>, sort: (a, b) => a.issuedDate.localeCompare(b.issuedDate) },
    { key: 'grandTotal', header: 'Total', render: (i) => <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(i.grandTotal)}</span>, sort: (a, b) => a.grandTotal - b.grandTotal },
    { key: 'remaining', header: 'Due', render: (i) => <span className={i.remaining > 0 ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-400'}>{formatCurrency(i.remaining)}</span>, sort: (a, b) => a.remaining - b.remaining },
    { key: 'paymentStatus', header: 'Status', render: (i) => <StatusBadge status={i.paymentStatus} /> },
    { key: 'actions', header: '', render: (i) => (
        <div className="flex gap-1">
          {i.remaining > 0 && i.paymentStatus !== 'Void' && (
            <Button size="sm" variant="outline" onClick={() => {
              setPayTarget(i);
              setAmount(i.remaining);
            }}>
              <Wallet className="h-3.5 w-3.5" /> Pay
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => void runPdf(i)}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Link className="px-2 py-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400" to={`/admin/invoices/${i._id}`}>
            <FileText className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Invoices</title>
      </Helmet>
      <PageHeader
        title="Invoices"
        subtitle="Billing records for completed work"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...INVOICE_STATUSES].map((s) => (
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
        data={(data?.data ?? []) as Invoice[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by invoice number…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
        rowClick={(i) => navigate(`/admin/invoices/${i._id}`)}
      />

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={`Record payment — ${payTarget?.invoiceNumber ?? ''}`} size="sm">
        {payTarget && (
          <>
            <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm dark:bg-amber-500/10">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Total {formatCurrency(payTarget.grandTotal)}</p>
              <p className="text-amber-700/80 dark:text-amber-400/80">Paid {formatCurrency(payTarget.paidAmount)} · Due {formatCurrency(payTarget.remaining)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount" required className="mb-0">
                <Input type="number" min={1} step="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </Field>
              <Field label="Method" required className="mb-0">
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Reference (optional)" className="mt-4">
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI txn id / cheque no." />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setPayTarget(null)}>Cancel</Button>
              <Button loading={busy} onClick={() => void record()}>Record payment</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}