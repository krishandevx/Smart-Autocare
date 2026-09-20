import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, CheckCircle2, X, ShoppingCart } from 'lucide-react';
import { usePurchaseOrders, useCreatePO, useReceivePO, useSuppliers, useParts } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils';
import type { PurchaseOrder } from '../../types';

interface Line { part: string; name: string; qty: number; rate: number }

function supName(po: PurchaseOrder): string {
  return typeof po.supplier === 'string' ? po.supplier : po.supplier.name;
}

export default function PurchaseOrders() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePurchaseOrders({ page, limit: 12 });
  const createPO = useCreatePO();
  const receivePO = useReceivePO();
  const { data: suppliers } = useSuppliers({ limit: 200 });
  const { data: parts } = useParts({ limit: 500 });
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);

  const addLine = () => setLines((l) => [...l, { part: '', name: '', qty: 1, rate: 0 }]);
  const setLine = (i: number, patch: Partial<Line>) => setLines((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeLine = (i: number) => setLines((l) => l.filter((_, j) => j !== i));

  const pickPart = (i: number, partId: string) => {
    const p = (parts?.data ?? []).find((x) => x._id === partId);
    if (p) setLine(i, { part: p._id, name: `${p.name} (${p.partNumber})`, rate: p.costPrice });
  };

  const save = async () => {
    if (!supplier) {
      toast.error('Select a supplier');
      return;
    }
    if (lines.some((l) => !l.name || l.qty <= 0)) {
      toast.error('Each line needs a part and quantity');
      return;
    }
    setBusy(true);
    try {
      await createPO.mutateAsync({ supplier, items: lines });
      toast.success('Purchase order created');
      setCreateOpen(false);
      setSupplier('');
      setLines([]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const receive = async () => {
    if (!receiving) return;
    setBusy(true);
    try {
      await receivePO.mutateAsync(receiving._id);
      toast.success(`PO ${receiving.poId} received. Stock updated.`);
      setReceiving(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const canReceive = (po: PurchaseOrder) => ['Sent', 'Partial'].includes(po.status);

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poId', header: 'PO number', render: (po) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{po.poId}</span> },
    { key: 'supplier', header: 'Supplier', render: (po) => supName(po), sortValue: (po) => supName(po) },
    { key: 'items', header: 'Items', render: (po) => <span className="text-slate-500">{po.items.length}</span> },
    { key: 'total', header: 'Total', render: (po) => <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(po.total)}</span>, sort: (a, b) => a.total - b.total },
    { key: 'orderDate', header: 'Ordered', render: (po) => <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(po.orderDate)}</span> },
    { key: 'status', header: 'Status', render: (po) => <StatusBadge status={po.status} /> },
    { key: 'actions', header: '', render: (po) => canReceive(po) ? (
        <Button size="sm" variant="outline" onClick={() => setReceiving(po)}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Receive
        </Button>
      ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span> },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Purchase Orders</title>
      </Helmet>
      <PageHeader
        title="Purchase Orders"
        subtitle="Orders placed with suppliers for stock"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New purchase order
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as PurchaseOrder[]}
        loading={isLoading}
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create purchase order" size="lg">
        <Field label="Supplier" required>
          <Select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option value="">Select supplier…</option>
            {(suppliers?.data ?? []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
        </Field>
        <div className="space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 items-end gap-2">
              <Field label={i === 0 ? 'Part' : ''} required className="col-span-12 mb-0 sm:col-span-6">
                <Select value={l.part} onChange={(e) => pickPart(i, e.target.value)}>
                  <option value="">Select part…</option>
                  {(parts?.data ?? []).map((p) => <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock)</option>)}
                </Select>
              </Field>
              <Field label={i === 0 ? 'Qty' : ''} required className="col-span-4 mb-0 sm:col-span-2">
                <Input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
              </Field>
              <Field label={i === 0 ? 'Rate' : ''} required className="col-span-5 mb-0 sm:col-span-3">
                <Input type="number" min={0} value={l.rate} onChange={(e) => setLine(i, { rate: Number(e.target.value) })} />
              </Field>
              <div className="col-span-3 pb-1 sm:col-span-1 sm:pb-0">
                <Button size="sm" variant="ghost" onClick={() => removeLine(i)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {lines.length === 0 && <p className="text-sm text-slate-400">No line items yet. Add parts to order.</p>}
        </div>
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={addLine}>
            <Plus className="h-3.5 w-3.5" /> Add line
          </Button>
        </div>
        <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void save()}>Create purchase order</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!receiving}
        onClose={() => setReceiving(null)}
        onConfirm={() => void receive()}
        title="Receive purchase order"
        message={`Mark ${receiving?.poId} as received? Line items will be added to inventory stock.`}
        confirmLabel="Receive & restock"
        loading={busy}
        danger={false}
      />

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <ShoppingCart className="h-3.5 w-3.5" /> Receiving a PO adds each line item to the part's stock.
      </p>
    </>
  );
}