import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Download, Wallet, XCircle, FileText } from 'lucide-react';
import { useInvoice, useDownloadInvoicePdf, useRecordPayment, useVoidInvoice } from '../../api/hooks';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import { PAYMENT_METHODS } from '../../constants';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { data: inv, isLoading } = useInvoice(id);
  const pdf = useDownloadInvoicePdf();
  const recordP = useRecordPayment();
  const voidI = useVoidInvoice();
  const toast = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [voidOpen, setVoidOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!inv) return <EmptyState title="Invoice not found" />;

  const isVoid = inv.paymentStatus === 'Void';

  const download = async () => {
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
    if (amount <= 0 || amount > inv.remaining) {
      toast.error(`Enter an amount up to ${inv.remaining}`);
      return;
    }
    setBusy(true);
    try {
      await recordP.mutateAsync({ invoice: inv._id, amount, method, reference });
      toast.success('Payment recorded');
      setPayOpen(false);
      setAmount(0);
      setReference('');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doVoid = async () => {
    setBusy(true);
    try {
      await voidI.mutateAsync(inv._id);
      toast.success('Invoice voided');
      setVoidOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{inv.invoiceNumber}</title>
      </Helmet>
      <div className="mb-1">
        <Link to="/admin/invoices" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Invoices
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{inv.invoiceNumber}</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Issued {formatDate(inv.issuedDate)} · {unuser(inv.customer)?.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={inv.paymentStatus} />
            {!isVoid && <Button size="sm" variant="outline" onClick={() => void download()}><Download className="h-3.5 w-3.5" /> PDF</Button>}
            {!isVoid && inv.remaining > 0 && (
              <Button size="sm" onClick={() => { setPayOpen(true); setAmount(inv.remaining); }}>
                <Wallet className="h-3.5 w-3.5" /> Record payment
              </Button>
            )}
            {!isVoid && (
              <Button size="sm" variant="danger" onClick={() => setVoidOpen(true)}>
                <XCircle className="h-3.5 w-3.5" /> Void
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>Line items</CardTitle>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inv.items.map((it, i) => (
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
              <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>{formatCurrency(inv.subtotal)}</span></p>
              {inv.discount > 0 && <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Discount</span><span>- {formatCurrency(inv.discount)}</span></p>}
              <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Tax ({inv.taxRate}%)</span><span>{formatCurrency(inv.tax)}</span></p>
              <p className="flex justify-between font-display text-lg font-extrabold text-slate-900 dark:text-white"><span>Grand total</span><span>{formatCurrency(inv.grandTotal)}</span></p>
              <p className="flex justify-between text-slate-500 dark:text-slate-400"><span>Paid</span><span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(inv.paidAmount)}</span></p>
              <p className="flex justify-between font-semibold text-amber-600 dark:text-amber-400"><span>Balance due</span><span>{formatCurrency(inv.remaining)}</span></p>
            </div>
            {inv.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{inv.notes}</p>}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Customer</CardTitle>
            <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{unuser(inv.customer)?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{unuser(inv.customer)?.phone} · {unuser(inv.customer)?.email}</p>
          </Card>
          <Card>
            <CardTitle>Vehicle</CardTitle>
            <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{unvehicle(inv.vehicle)?.brand} {unvehicle(inv.vehicle)?.model}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{unvehicle(inv.vehicle)?.regNumber} · {unvehicle(inv.vehicle)?.year}</p>
          </Card>
          <Card>
            <CardTitle>Linked records</CardTitle>
            <div className="mt-2 space-y-1 text-sm">
              {inv.jobCard && <p className="text-slate-500 dark:text-slate-400">Job card: <span className="font-mono text-brand-600 dark:text-brand-400">{unuser(inv.jobCard)?.name ?? '—'}</span></p>}
              {inv.booking && <p className="text-slate-500 dark:text-slate-400">Booking: <span className="font-mono text-brand-600 dark:text-brand-400">{unuser(inv.booking)?.name ?? '—'}</span></p>}
              {!inv.jobCard && !inv.booking && <p className="text-slate-400">None</p>}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title={`Record payment — ${inv.invoiceNumber}`} size="sm">
        <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm dark:bg-amber-500/10">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Due {formatCurrency(inv.remaining)}</p>
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
          <Input value={reference} onChange={(e) => setReference(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void record()}>Record payment</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        onConfirm={() => void doVoid()}
        title="Void invoice"
        message={`Void ${inv.invoiceNumber}? This marks it invalid and sets balance to zero.`}
        confirmLabel="Void invoice"
        loading={busy}
      />
    </>
  );
}