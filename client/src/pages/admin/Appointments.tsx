import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, CalendarCheck } from 'lucide-react';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useCustomers, useVehiclesList, useServices, useEmployees } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatTime, getErrorMessage } from '../../lib/utils';
import { APPOINTMENT_STATUSES } from '../../constants';
import { unuser, unvehicle, serviceName } from './shared';
import type { Appointment } from '../../types';

export default function AdminAppointments() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAppointments({ q: q || undefined, page, limit: 12, status: status || undefined });
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const { data: customers } = useCustomers({ limit: 300 });
  const { data: vehicles } = useVehiclesList({ limit: 300 });
  const { data: services } = useServices();
  const { data: employees } = useEmployees({ role: 'mechanic', limit: 50 });
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ customer: '', vehicle: '', service: '', date: new Date().toISOString().slice(0, 10), time: '10:00', duration: 60, mechanic: '', notes: '', status: 'Scheduled' });

  const open = (a?: Appointment) => {
    setEditing(a ?? null);
    if (a) {
      const c = unuser(a.customer);
      const v = unvehicle(a.vehicle);
      setForm({ customer: c?._id ?? '', vehicle: v?._id ?? '', service: typeof a.service === 'string' ? a.service : (a.service?._id ?? ''), date: a.date.slice(0, 10), time: a.timeSlot?.slice(0, 5), duration: a.duration, mechanic: (unuser(a.mechanic) as { _id?: string } | undefined)?._id ?? '', notes: a.notes ?? '', status: a.status });
    } else {
      setForm({ customer: '', vehicle: '', service: '', date: new Date().toISOString().slice(0, 10), time: '10:00', duration: 60, mechanic: '', notes: '', status: 'Scheduled' });
    }
    setModal(true);
  };

  const save = async () => {
    if (!form.customer || !form.vehicle || !form.service) {
      toast.error('Customer, vehicle and service are required');
      return;
    }
    try {
      if (editing) await update.mutateAsync({ id: editing._id, data: form });
      else await create.mutateAsync(form);
      toast.success(editing ? 'Appointment updated' : 'Appointment scheduled');
      setModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const updateStatus = async (a: Appointment, status: string) => {
    try {
      await update.mutateAsync({ id: a._id, data: { status } });
      toast.success(`Marked as ${status}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const columns: Column<Appointment>[] = [
    { key: 'date', header: 'Date', render: (a) => <span className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">{formatDate(a.date)}</span>, sort: (a, b) => a.date.localeCompare(b.date) },
    { key: 'time', header: 'Time', render: (a) => formatTime(a.timeSlot), sort: (a, b) => a.timeSlot.localeCompare(b.timeSlot) },
    { key: 'customer', header: 'Customer', render: (a) => <span className="font-medium">{unuser(a.customer)?.name}</span>, sortValue: (a) => unuser(a.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (a) => `${unvehicle(a.vehicle)?.brand} ${unvehicle(a.vehicle)?.model}`, sortValue: (a) => `${unvehicle(a.vehicle)?.brand} ${unvehicle(a.vehicle)?.model}` },
    { key: 'service', header: 'Service', render: (a) => serviceName(a.service) },
    { key: 'mechanic', header: 'Mechanic', render: (a) => unuser(a.mechanic)?.name ?? '—' },
    { key: 'status', header: 'Status', render: (a) => (
        <select value={a.status} onChange={(e) => updateStatus(a, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      ) },
    { key: 'actions', header: '', render: (a) => <Button size="sm" variant="ghost" onClick={() => open(a)}>Edit</Button> },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Appointments</title>
      </Helmet>
      <PageHeader
        title="Appointments"
        subtitle="Schedule and manage customer visits"
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" /> New appointment
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...APPOINTMENT_STATUSES].map((s) => (
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
        data={(data?.data ?? []) as unknown as Appointment[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by customer or vehicle…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit appointment' : 'Schedule appointment'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer" required>
            <Select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
              <option value="">Select customer…</option>
              {customers?.data?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle" required>
            <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
              <option value="">Select vehicle…</option>
              {(vehicles?.data ?? []).map((v) => (
                <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.regNumber})</option>
              ))}
            </Select>
          </Field>
          <Field label="Service" required>
            <Select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="">Select service…</option>
              {(services ?? []).map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mechanic">
            <Select value={form.mechanic} onChange={(e) => setForm({ ...form, mechanic: e.target.value })}>
              <option value="">Unassigned</option>
              {(employees?.data ?? []).map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date" required>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time" required>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
            <Field label="Duration (min)">
              <Input type="number" min={15} step={15} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {APPOINTMENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea className="input-base" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={() => void save()}>{editing ? 'Save changes' : 'Schedule'}</Button>
        </div>
      </Modal>
    </>
  );
}