import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Wallet, Eye } from 'lucide-react';
import { useInvoices, useRecordPayment, useDownloadInvoicePdf } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { Field, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { formatDate, formatCurrency, getErrorMessage } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { PAYMENT_METHODS } from '../../constants';
import type { Invoice } from '../../types';

export default function MyInvoices() {
  const { data, isLoading } = useInvoices({ limit: 100 });
  const recordPayment = useRecordPayment();
  const downloadPdf = useDownloadInvoicePdf();
  const toast = useToast();
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('UPI');
  const [busy, setBusy] = useState(false);

  const invoices = data?.data ?? [];

  const doPay = async () => {
    if (!paying) return;
    if (amount <= 0 || amount > paying.remaining) {
      toast.error(`Enter an amount between 1 and ${formatCurrency(paying.remaining)}`);
      return;
    }
    setBusy(true);
    try {
      await recordPayment.mutateAsync({ invoice: paying._id, amount, method });
      toast.success('Payment successful! Invoice updated.');
      setPaying(null);
      setAmount(0);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Payment failed'));
    } finally {
      setBusy(false);
    }
  };

  const doDownload = async (inv: Invoice) => {
    try {
      await downloadPdf.mutateAsync(inv._id);
      window.open(`/api/invoices/${inv._id}/pdf`, '_blank');
    } catch {
      toast.info('PDF will be emailed to you shortly');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Invoices</title>
      </Helmet>
      <PageHeader title="Invoices & Payments" subtitle="View and settle your invoices online" />

      {invoices.length === 0 ? (
        <Card>
          <EmptyState title="No invoices yet" description="Invoices from completed services will appear here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv._id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{inv.invoiceNumber}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {(inv.vehicle as unknown as { make?: string; model?: string })?.make}{' '}
                    {(inv.vehicle as unknown as { model?: string })?.model} · {formatDate(inv.issuedDate)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatCurrency(inv.grandTotal)} total · {formatCurrency(inv.paidAmount)} paid · {formatCurrency(inv.remaining)} due
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inv.paymentStatus} />
                <Button size="sm" variant="ghost" onClick={() => setViewing(inv)}>
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void doDownload(inv)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {inv.remaining > 0 && (
                  <Button size="sm" onClick={() => { setPaying(inv); setAmount(inv.remaining); }}>
                    Pay {formatCurrency(inv.remaining)}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? viewing.invoiceNumber : ''} size="md">
        {viewing && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Issued {formatDate(viewing.issuedDate)}</p>
                <p className="text-xs text-slate-400">Due {formatDate(viewing.dueDate ?? viewing.issuedDate)}</p>
              </div>
              <StatusBadge status={viewing.paymentStatus} />
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
                    <td className="py-2">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{it.description}</p>
                      <p className="text-xs text-slate-400">{it.type}</p>
                    </td>
                    <td className="py-2 text-center text-slate-600 dark:text-slate-300">{it.qty}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-300">{formatCurrency(it.rate)}</td>
                    <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex flex-col items-end gap-1 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
              <p className="flex w-56 justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span><span>{formatCurrency(viewing.subtotal)}</span>
              </p>
              <p className="flex w-56 justify-between text-slate-500 dark:text-slate-400">
                <span>Tax ({viewing.taxRate}%)</span><span>{formatCurrency(viewing.tax)}</span>
              </p>
              <p className="flex w-56 justify-between font-bold text-slate-900 dark:text-white">
                <span>Total</span><span>{formatCurrency(viewing.grandTotal)}</span>
              </p>
              <p className="flex w-56 justify-between text-emerald-600 dark:text-emerald-400">
                <span>Paid</span><span>{formatCurrency(viewing.paidAmount)}</span>
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!paying} onClose={() => setPaying(null)} title="Make a payment" size="sm">
        {paying && (
          <div>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Paying invoice <span className="font-mono font-bold">{paying.invoiceNumber}</span>. Amount due:{' '}
              <strong>{formatCurrency(paying.remaining)}</strong>
            </p>
            <Field label="Amount" required>
              <input type="number" className="input-base" min={1} max={paying.remaining} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </Field>
            <Field label="Payment method" required>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setPaying(null)}>Cancel</Button>
              <Button loading={busy} onClick={() => void doPay()}>
                <Wallet className="h-4 w-4" /> Pay {formatCurrency(amount)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}