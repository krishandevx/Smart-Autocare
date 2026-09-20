import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Package, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePart, useUpdatePart, useDeletePart, useStockIn, useAdjustStock, useInventoryTransactions, useSuppliers } from '../../api/hooks';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, getErrorMessage } from '../../lib/utils';
import type { Part } from '../../types';

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value ?? '—'}</p>
    </div>
  );
}

export default function PartDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: p, isLoading } = usePart(id);
  const { data: tx } = useInventoryTransactions(id);
  const updateP = useUpdatePart();
  const deleteP = useDeletePart();
  const stockIn = useStockIn();
  const adjust = useAdjustStock();
  const { data: suppliers } = useSuppliers({ limit: 200 });
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockType, setStockType] = useState<'IN' | 'ADJUSTMENT'>('IN');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Part | null>(null);

  if (isLoading) return <PageLoader />;
  if (!p) return <EmptyState title="Part not found" />;

  const openEdit = () => {
    setForm({ ...p });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!form) return;
    setBusy(true);
    try {
      await updateP.mutateAsync({ id: p._id, data: { name: form.name, partNumber: form.partNumber, sku: form.sku, brand: form.brand, category: form.category, costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), minStock: Number(form.minStock), unit: form.unit, supplier: form.supplier || null, location: form.location, warrantyMonths: Number(form.warrantyMonths) } });
      toast.success('Part updated');
      setEditOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const runStock = async () => {
    if (qty <= 0) {
      toast.error('Enter a positive quantity');
      return;
    }
    setBusy(true);
    try {
      if (stockType === 'IN') await stockIn.mutateAsync({ part: p._id, quantity: qty, notes: reason });
      else await adjust.mutateAsync({ part: p._id, quantity: qty, reason });
      toast.success(stockType === 'IN' ? 'Stock received' : 'Stock adjusted');
      setStockOpen(false);
      setQty(1);
      setReason('');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteP.mutateAsync(p._id);
      setDeleting(false);
      navigate('/admin/inventory');
    } catch (e) {
      toast.error(getErrorMessage(e));
      setBusy(false);
    }
  };

  const txTypeIcon = (t: string) => t === 'USED' || t === 'OUT' ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;

  return (
    <>
      <Helmet>
        <title>{p.name}</title>
      </Helmet>
      <div className="mb-1">
        <Link to="/admin/inventory" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Inventory
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{p.name}</h1>
              <p className="mt-0.5 font-mono text-sm font-bold text-brand-600 dark:text-brand-400">{p.partNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={p.stock <= p.minStock ? 'amber' : 'green'}>{p.stock <= p.minStock ? 'Low stock' : 'In stock'}</Badge>
            <Button size="sm" variant="outline" onClick={() => { setStockType('IN'); setStockOpen(true); }}>
              <TrendingUp className="h-3.5 w-3.5" /> Stock in
            </Button>
            <Button size="sm" variant="outline" onClick={() => openEdit()}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => setDeleting(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Spec label="In stock" value={`${p.stock} ${p.unit}`} />
        <Spec label="Min stock" value={`${p.minStock} ${p.unit}`} />
        <Spec label="Cost price" value={p.costPrice.toLocaleString()} />
        <Spec label="Selling price" value={p.sellingPrice.toLocaleString()} />
        <Spec label="Category" value={p.category} />
        <Spec label="Brand" value={p.brand} />
        <Spec label="Location" value={p.location} />
        <Spec label="Warranty" value={p.warrantyMonths ? `${p.warrantyMonths} months` : '—'} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Stock movements</CardTitle>
          <CardDescription>Last 15 transactions for this part</CardDescription>
          <div className="mt-4 space-y-2">
            {(tx ?? []).length === 0 && <p className="text-sm text-slate-400">No transactions recorded.</p>}
            {(tx ?? []).map((t) => (
              <div key={t._id} className="flex items-center gap-3 text-sm">
                {txTypeIcon(t.type)}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{t.type}</p>
                  <p className="truncate text-xs text-slate-400">{t.reason || t.reference || '—'} · {formatDate(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{t.qty > 0 ? '+' : ''}{t.qty}</p>
                  <p className="text-xs text-slate-400">{t.before} → {t.after}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={stockOpen} onClose={() => setStockOpen(false)} title="Adjust stock" size="sm">
        <div className="flex gap-3">
          <Button size="sm" variant={stockType === 'IN' ? 'primary' : 'outline'} onClick={() => setStockType('IN')}>Stock in</Button>
          <Button size="sm" variant={stockType === 'ADJUSTMENT' ? 'primary' : 'outline'} onClick={() => setStockType('ADJUSTMENT')}>Adjust</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label="Quantity" required>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </Field>
          <Field label="Reason">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={stockType === 'IN' ? 'PO received, opening stock…' : 'Cycle count…'} />
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void runStock()}>{stockType === 'IN' ? 'Receive stock' : 'Apply adjustment'}</Button>
        </div>
      </Modal>

      {form && (
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit part" size="lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Part number" required>
              <Input value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} />
            </Field>
            <Field label="Brand">
              <Input value={form.brand ?? ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label="Cost price (₹)">
              <Input type="number" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
            </Field>
            <Field label="Selling price (₹)">
              <Input type="number" min={0} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
            </Field>
            <Field label="Min stock">
              <Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
            </Field>
            <Field label="Warranty (months)">
              <Input type="number" min={0} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })} />
            </Field>
            <Field label="Supplier">
              <Select value={form.supplier ?? ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                <option value="">No supplier</option>
                {(suppliers?.data ?? []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Location">
              <Input value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={() => void saveEdit()}>Save changes</Button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => void remove()}
        title="Delete part"
        message={`Delete ${p.name} (${p.partNumber})? This cannot be undone.`}
        confirmLabel="Delete"
        loading={busy}
      />
    </>
  );
}