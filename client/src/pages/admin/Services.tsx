import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdminServices, useCreateService, useUpdateService, useDeleteService } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select, Textarea, Toggle } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import { SERVICE_CATEGORIES } from '../../constants';
import type { Service } from '../../types';

const empty = { name: '', category: 'General Service', description: '', basePrice: 0, estimatedHours: 1, includes: '', vehicleTypes: '', isPopular: false, isActive: true, icon: 'Wrench' };

export default function AdminServices() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminServices({ q: q || undefined, page, limit: 12 });
  const createS = useCreateService();
  const updateS = useUpdateService();
  const deleteS = useDeleteService();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  const open = (s?: Service) => {
    setEditing(s ?? null);
    setForm(s
      ? { name: s.name, category: s.category, description: s.description, basePrice: s.basePrice, estimatedHours: s.estimatedHours, includes: (s.includes ?? []).join(', '), vehicleTypes: (s.vehicleTypes ?? []).join(', '), isPopular: s.isPopular, isActive: s.isActive, icon: s.icon || 'Wrench' }
      : empty);
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.category) {
      toast.error('Name and category are required');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        basePrice: Number(form.basePrice),
        estimatedHours: Number(form.estimatedHours),
        includes: form.includes.split(',').map((x) => x.trim()).filter(Boolean),
        vehicleTypes: form.vehicleTypes.split(',').map((x) => x.trim()).filter(Boolean),
        isPopular: form.isPopular,
        isActive: form.isActive,
        icon: form.icon,
      };
      if (editing) await updateS.mutateAsync({ id: editing._id, data: payload });
      else await createS.mutateAsync(payload);
      toast.success(editing ? 'Service updated' : 'Service created');
      setModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteS.mutateAsync(deleting._id);
      toast.success('Service deactivated');
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Service>[] = [
    { key: 'name', header: 'Service', render: (s) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
          <p className="max-w-xs truncate text-xs text-slate-400">{s.description}</p>
        </div>
      ), sortValue: (s) => s.name },
    { key: 'category', header: 'Category', render: (s) => <span className="text-slate-500">{s.category}</span> },
    { key: 'basePrice', header: 'Base price', render: (s) => <span className="font-bold text-slate-700 dark:text-slate-200">{s.basePrice.toLocaleString()}</span>, sort: (a, b) => a.basePrice - b.basePrice },
    { key: 'estimatedHours', header: 'Hours', render: (s) => <span className="text-slate-500">{s.estimatedHours} h</span> },
    { key: 'status', header: 'Status', render: (s) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={s.isActive ? 'Active' : 'Inactive'} />
          {s.isPopular && <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Popular</span>}
        </div>
      ) },
    { key: 'actions', header: '', render: (s) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => open(s)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          {s.isActive && <Button size="sm" variant="danger" onClick={() => setDeleting(s)}><Trash2 className="h-3.5 w-3.5" /> Deactivate</Button>}
        </div>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Services</title>
      </Helmet>
      <PageHeader
        title="Services"
        subtitle="Your service catalogue shown to customers"
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" /> Add service
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Service[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search services…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit service' : 'Add a service'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Annual Service" />
          </Field>
          <Field label="Category" required>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Base price (₹)" required>
            <Input type="number" min={0} value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          </Field>
          <Field label="Estimated hours" required>
            <Input type="number" min={0} step="0.5" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="What's included (comma separated)" className="sm:col-span-2">
            <Input value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} placeholder="Interior cleaning, oil check…" />
          </Field>
          <Field label="Compatible vehicle types (comma separated)" className="sm:col-span-2">
            <Input value={form.vehicleTypes} onChange={(e) => setForm({ ...form, vehicleTypes: e.target.value })} placeholder="Four Wheeler, Two Wheeler…" />
          </Field>
          <div className="flex items-center gap-8">
            <Toggle checked={form.isPopular} onChange={(v) => setForm({ ...form, isPopular: v })} label="Mark as popular" />
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void save()}>{editing ? 'Save changes' : 'Add service'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void deactivate()}
        title="Deactivate service"
        message={`Deactivate "${deleting?.name}"? It will be hidden from new bookings but kept for history.`}
        confirmLabel="Deactivate"
        loading={busy}
      />
    </>
  );
}