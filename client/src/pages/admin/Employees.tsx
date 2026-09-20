import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import { STAFF_ROLES, ROLE_LABELS } from '../../constants';
import type { Employee } from '../../types';

const empty = { name: '', phone: '', email: '', role: 'mechanic', specialization: '', experienceYears: 0, joiningDate: '', status: 'active', address: '', salary: 0 };

export default function Employees() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const { data, isLoading } = useEmployees({ q: q || undefined, page, limit: 12, role: role || undefined });
  const createE = useCreateEmployee();
  const updateE = useUpdateEmployee();
  const deleteE = useDeleteEmployee();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [busy, setBusy] = useState(false);

  const open = (e?: Employee) => {
    setEditing(e ?? null);
    setForm(e
      ? { name: e.name, phone: e.phone || '', email: e.email || '', role: e.role, specialization: e.specialization || '', experienceYears: e.experienceYears || 0, joiningDate: e.joiningDate ? String(e.joiningDate).slice(0, 10) : '', status: e.status || 'active', address: e.address || '', salary: e.salary || 0 }
      : empty);
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.role) {
      toast.error('Name and role are required');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears),
        salary: Number(form.salary),
        joiningDate: form.joiningDate || null,
      };
      if (editing) await updateE.mutateAsync({ id: editing._id, data: payload });
      else await createE.mutateAsync(payload);
      toast.success(editing ? 'Employee updated' : 'Employee added');
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
      await deleteE.mutateAsync(deleting._id);
      toast.success('Employee removed');
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Employee>[] = [
    { key: 'name', header: 'Name', render: (e) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{e.name}</p>
            <p className="text-xs text-slate-400">{e.email || e.phone}</p>
          </div>
        </div>
      ), sortValue: (e) => e.name },
    { key: 'role', header: 'Role', render: (e) => <span className="text-slate-500">{ROLE_LABELS[e.role] ?? e.role}</span> },
    { key: 'specialization', header: 'Specialization', render: (e) => <span className="text-slate-500">{e.specialization || '—'}</span> },
    { key: 'experienceYears', header: 'Exp', render: (e) => <span className="text-slate-500">{e.experienceYears || 0} yrs</span> },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status ?? 'active'} /> },
    { key: 'actions', header: '', render: (e) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => open(e)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Employees</title>
      </Helmet>
      <PageHeader
        title="Employees"
        subtitle="Workshop staff and their roles"
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...STAFF_ROLES].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => { setRole(r); setPage(1); }}
            className={
              role === r
                ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }
          >
            {r ? ROLE_LABELS[r] : 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Employee[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search employees…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit employee' : 'Add an employee'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Role" required>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Specialization">
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Engine, Electrical…" />
          </Field>
          <Field label="Years of experience">
            <Input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </Field>
          <Field label="Joining date">
            <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          </Field>
          <Field label="Monthly salary (₹)">
            <Input type="number" min={0} value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On leave</option>
            </Select>
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void save()}>{editing ? 'Save changes' : 'Add employee'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title="Remove employee"
        message={`Remove ${deleting?.name}? This cannot be undone.`}
        confirmLabel="Remove"
        loading={busy}
      />
    </>
  );
}