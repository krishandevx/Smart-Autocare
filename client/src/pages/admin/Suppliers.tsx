import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useParts } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import type { Supplier } from '../../types';

const empty = { name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' };

export default function Suppliers() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSuppliers({ q: q || undefined, page, limit: 12 });
  const createS = useCreateSupplier();
  const updateS = useUpdateSupplier();
  const deleteS = useDeleteSupplier();
  const { data: parts } = useParts({ limit: 500 });
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [busy, setBusy] = useState(false);

  const open = (s?: Supplier) => {
    setEditing(s ?? null);
    setForm(s ? { name: s.name, contactPerson: s.contactPerson ?? '', phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '', gstin: s.gstin ?? '' } : empty);
    setModal(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error('Supplier name is required');
      return;
    }
    setBusy(true);
    try {
      if (editing) await updateS.mutateAsync({ id: editing._id, data: form });
      else await createS.mutateAsync(form);
      toast.success(editing ? 'Supplier updated' : 'Supplier added');
      setModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteS.mutateAsync(deleting._id);
      toast.success('Supplier removed');
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const suppliedParts = (s: Supplier) => (parts?.data ?? []).filter((p) => p.supplier === s._id);

  const columns: Column<Supplier>[] = [
    { key: 'name', header: 'Supplier', render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
            <p className="text-xs text-slate-400">{s.contactPerson || s.email || s.phone}</p>
          </div>
        </div>
      ), sortValue: (s) => s.name },
    { key: 'contact', header: 'Contact', render: (s) => <span className="text-slate-500">{s.phone || s.email || '—'}</span> },
    { key: 'gstin', header: 'GSTIN', render: (s) => <span className="font-mono text-xs text-slate-500">{s.gstin || '—'}</span> },
    { key: 'parts', header: 'Parts supplied', render: (s) => <span className="text-slate-500">{suppliedParts(s).length}</span> },
    { key: 'outstanding', header: 'Outstanding', render: (s) => <span className="font-bold text-slate-700 dark:text-slate-200">{s.outstandingAmount?.toLocaleString() ?? 0}</span> },
    { key: 'actions', header: '', render: (s) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => open(s)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Suppliers</title>
      </Helmet>
      <PageHeader
        title="Suppliers"
        subtitle="Vendors you buy parts from"
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" /> Add supplier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Supplier[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search suppliers…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit supplier' : 'Add a supplier'} size="md">
        <Field label="Company name" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person">
            <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="GSTIN">
            <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void save()}>{editing ? 'Save changes' : 'Add supplier'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title="Remove supplier"
        message={`Remove ${deleting?.name}? Parts referencing this supplier will keep their records.`}
        confirmLabel="Remove"
        loading={busy}
      />
    </>
  );
}