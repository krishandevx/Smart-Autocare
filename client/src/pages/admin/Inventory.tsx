import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Package } from 'lucide-react';
import { useParts, useCreatePart, useSuppliers } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import type { Part } from '../../types';

const empty = { name: '', partNumber: '', sku: '', brand: '', category: 'General', costPrice: 0, sellingPrice: 0, stock: 0, minStock: 5, unit: 'pcs', supplier: '', location: '', warrantyMonths: 0 };

export default function Inventory() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [lowOnly, setLowOnly] = useState(false);
  const { data, isLoading } = useParts({ q: q || undefined, page, limit: 12, lowStock: lowOnly || undefined });
  const createP = useCreatePart();
  const { data: suppliers } = useSuppliers({ limit: 200 });
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.name || !form.partNumber) {
      toast.error('Name and part number are required');
      return;
    }
    setBusy(true);
    try {
      await createP.mutateAsync({ ...form, costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), stock: Number(form.stock), minStock: Number(form.minStock), warrantyMonths: Number(form.warrantyMonths) });
      toast.success('Part added to inventory');
      setModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Part>[] = [
    { key: 'name', header: 'Part', render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
            <p className="font-mono text-xs text-slate-400">{p.partNumber}</p>
          </div>
        </div>
      ), sortValue: (p) => p.name },
    { key: 'category', header: 'Category', render: (p) => <span className="text-slate-500">{p.category}</span> },
    { key: 'stockQty', header: 'In stock', render: (p) => (
        <span className={p.stock <= p.minStock ? 'font-bold text-amber-600 dark:text-amber-400' : 'font-semibold text-slate-700 dark:text-slate-200'}>
          {p.stock} {p.unit}
        </span>
      ), sort: (a, b) => a.stock - b.stock },
    { key: 'minStock', header: 'Min', render: (p) => <span className="text-slate-400">{p.minStock}</span> },
    { key: 'costPrice', header: 'Cost', render: (p) => <span className="text-slate-500">{p.costPrice.toLocaleString()}</span> },
    { key: 'sellingPrice', header: 'Selling', render: (p) => <span className="font-semibold text-slate-700 dark:text-slate-200">{p.sellingPrice.toLocaleString()}</span> },
    { key: 'stockStatus', header: 'Status', render: (p) => <Badge tone={p.stock <= p.minStock ? 'amber' : 'green'}>{p.stock <= p.minStock ? 'Low stock' : 'In stock'}</Badge> },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Inventory</title>
      </Helmet>
      <PageHeader
        title="Inventory"
        subtitle="Spare parts and stock levels"
        actions={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Add part
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setLowOnly(false)}
          className={!lowOnly ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300'}
        >
          All parts
        </button>
        <button
          onClick={() => setLowOnly(true)}
          className={lowOnly ? 'rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300'}
        >
          Low stock only
        </button>
      </div>

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Part[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search parts…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
        rowClick={(p) => navigate(`/admin/inventory/${p._id}`)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Add a part" size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brake pads" />
          </Field>
          <Field label="Part number" required>
            <Input value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} placeholder="BP-001" />
          </Field>
          <Field label="Brand">
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
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
          <Field label="Opening stock">
            <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </Field>
          <Field label="Min stock">
            <Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
          </Field>
          <Field label="Supplier">
            <Select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              <option value="">No supplier</option>
              {(suppliers?.data ?? []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Shelf 2A" />
          </Field>
          <Field label="Warranty (months)">
            <Input type="number" min={0} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void save()}>Add part</Button>
        </div>
      </Modal>
    </>
  );
}