import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarCheck, Wrench } from 'lucide-react';
import { useBookings, useCreateJobCard, useEmployees } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatTime, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import type { Booking, JobCard } from '../../types';

export default function AdminBookings() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useBookings({ q: q || undefined, page, limit: 12, status: status || undefined });
  const createJobCard = useCreateJobCard();
  const { data: advisors } = useEmployees({ role: ['service_advisor', 'workshop_manager'], limit: 50 });
  const toast = useToast();
  const [jobModal, setJobModal] = useState<Booking | null>(null);
  const [advisor, setAdvisor] = useState('');
  const [loading, setLoading] = useState(false);

  const makeJobCard = async () => {
    if (!jobModal) return;
    setLoading(true);
    try {
      const jc: JobCard = await createJobCard.mutateAsync({ booking: jobModal._id, serviceAdvisor: advisor || undefined });
      toast.success(`Job card ${jc.jobCardId} created`);
      setJobModal(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (b: Booking) => {
    try {
      const current = b.status === 'Requested' ? 'Confirmed' : b.status === 'Estimate Pending' ? 'Awaiting Customer Approval' : 'Confirmed';
      toast.info(`${b.bookingId} moved to ${current}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const columns: Column<Booking>[] = [
    { key: 'bookingId', header: 'ID', render: (b) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{b.bookingId}</span> },
    { key: 'customer', header: 'Customer', render: (b) => unuser(b.customer)?.name, sortValue: (b) => unuser(b.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (b) => `${unvehicle(b.vehicle)?.brand} ${unvehicle(b.vehicle)?.model}`, sortValue: (b) => `${unvehicle(b.vehicle)?.brand} ${unvehicle(b.vehicle)?.model}` },
    { key: 'serviceName', header: 'Service', render: (b) => b.serviceName || 'Multiple' },
    { key: 'scheduledDate', header: 'Scheduled', render: (b) => <span className="whitespace-nowrap">{formatDate(b.scheduledDate)} <span className="text-slate-400">{formatTime(b.scheduledDate)}</span></span>, sort: (a, b) => a.scheduledDate.localeCompare(b.scheduledDate) },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'actions', header: '', render: (b) => (
        <div className="flex gap-1">
          {['Requested', 'Confirmed'].includes(b.status) && (
            <Button size="sm" variant="outline" onClick={() => setJobModal(b)}>
              <Wrench className="h-3.5 w-3.5" /> Open job card
            </Button>
          )}
        </div>
      ) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Bookings</title>
      </Helmet>
      <PageHeader
        title="Bookings"
        subtitle="Incoming service requests from customers"
        actions={
          <Link to="/admin/appointments" className="btn-secondary">
            <CalendarCheck className="h-4 w-4" /> Appointments
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'Requested', 'Confirmed', 'Vehicle Received', 'Inspection', 'Service In Progress', 'Quality Check', 'Ready for Delivery', 'Completed', 'Cancelled'].map((s) => (
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
        data={(data?.data ?? []) as unknown as Booking[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by id, customer, vehicle…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
      />

      <Modal open={!!jobModal} onClose={() => setJobModal(null)} title="Open job card" size="sm">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Create a job card for booking <strong className="font-mono">{jobModal?.bookingId}</strong> ({unvehicle(jobModal?.vehicle)?.brand} {unvehicle(jobModal?.vehicle)?.model}). The customer complaint and vehicle mileage will be recorded on the card.
        </p>
        <Field label="Service advisor">
          <Select value={advisor} onChange={(e) => setAdvisor(e.target.value)}>
            <option value="">Select advisor…</option>
            {(advisors?.data ?? []).map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setJobModal(null)}>Cancel</Button>
          <Button loading={loading} onClick={() => void makeJobCard()}>Create job card</Button>
        </div>
      </Modal>
    </>
  );
}