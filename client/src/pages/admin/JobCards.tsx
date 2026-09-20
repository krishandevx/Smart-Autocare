import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Wrench } from 'lucide-react';
import { useJobCards, useBookings, useCreateJobCard, useVehiclesList } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import type { JobCard, Booking } from '../../types';

export default function JobCards() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useJobCards({ q: q || undefined, page, limit: 12, status: status || undefined });
  const { data: bookings } = useBookings({ limit: 200, status: 'Confirmed' });
  const create = useCreateJobCard();
  const { data: vehicles } = useVehiclesList({ limit: 150 });
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [source, setSource] = useState<'booking' | 'manual'>('booking');
  const [booking, setBooking] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [mileageIn, setMileageIn] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(50);
  const [complaint, setComplaint] = useState('');
  const [busy, setBusy] = useState(false);

  const openNew = () => {
    setModal(true);
    setSource('booking');
    setBooking('');
  };

  const createJob = async () => {
    if (source === 'manual' && !vehicle) {
      toast.error('Select a vehicle');
      return;
    }
    try {
      const payload: Record<string, unknown> = { vehicle, mileageIn, fuelLevel, customerComplaint: complaint };
      if (source === 'booking' && booking) payload.booking = booking;
      const jc = await create.mutateAsync(payload);
      toast.success(`Job card ${jc.jobCardId} created`);
      setModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<JobCard>[] = [
    { key: 'jobCardId', header: 'ID', render: (j) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{j.jobCardId}</span> },
    { key: 'customer', header: 'Customer', render: (j) => unuser(j.customer)?.name, sortValue: (j) => unuser(j.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (j) => `${unvehicle(j.vehicle)?.brand} ${unvehicle(j.vehicle)?.model}`, sortValue: (j) => `${unvehicle(j.vehicle)?.brand} ${unvehicle(j.vehicle)?.model}` },
    { key: 'assignedMechanic', header: 'Mechanic', render: (j) => unuser(j.assignedMechanic)?.name ?? '—' },
    { key: 'mileageIn', header: 'Mileage', render: (j) => j.mileageIn ? `${j.mileageIn.toLocaleString()} km` : '—' },
    { key: 'total', header: 'Total', render: (j) => j.total ? formatCurrency(j.total) : '—', sort: (a, b) => a.total - b.total },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'createdAt', header: 'Opened', render: (j) => formatDate(j.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: 'go', header: '', render: (j) => (
        <Link to={`/admin/job-cards/${j._id}`} className="btn-secondary btn-sm px-3 py-1.5 text-xs">
          Open
        </Link>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Job Cards</title>
      </Helmet>
      <PageHeader
        title="Job Cards"
        subtitle="Workshop floor work orders"
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New job card
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'Open', 'In Inspection', 'Estimate Pending', 'Awaiting Approval', 'In Progress', 'Parts Ordered', 'Quality Check', 'Completed', 'Closed'].map((s) => (
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
        data={(data?.data ?? []) as unknown as JobCard[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by id, customer, vehicle…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="New job card" size="md">
        <div className="mb-4 flex gap-2">
          <button onClick={() => setSource('booking')} className={source === 'booking' ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-700'}>
            From booking
          </button>
          <button onClick={() => setSource('manual')} className={source === 'manual' ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-700'}>
            Manual entry
          </button>
        </div>
        {source === 'booking' ? (
          <Field label="Confirmed booking" required>
            <Select value={booking} onChange={(e) => setBooking(e.target.value)}>
              <option value="">Select booking…</option>
              {(bookings?.data ?? []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bookingId} — {unuser(b.customer)?.name} · {unvehicle(b.vehicle)?.brand} {unvehicle(b.vehicle)?.model}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label="Vehicle" required>
            <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              <option value="">Select vehicle…</option>
              {(vehicles?.data ?? []).map((v) => (
                <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.regNumber})</option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Mileage in (km)">
            <Input type="number" value={mileageIn} onChange={(e) => setMileageIn(Number(e.target.value))} />
          </Field>
          <Field label="Fuel level (%)">
            <Input type="number" min={0} max={100} value={fuelLevel} onChange={(e) => setFuelLevel(Number(e.target.value))} />
          </Field>
          <Field label="Complaint">
            <Input value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Customer reported…" />
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void createJob()}>Create job card</Button>
        </div>
      </Modal>
    </>
  );
}