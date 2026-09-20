import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarCheck, XCircle, CalendarClock } from 'lucide-react';
import { useBookings, useCancelBooking, useRescheduleBooking } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Modal } from '../../components/ui/Modal';
import { Field, Input } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { formatDate, getErrorMessage } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { unvehicle } from '../admin/shared';
import type { Booking } from '../../types';

export default function MyBookings() {
  const { data, isLoading } = useBookings({ limit: 100 });
  const cancel = useCancelBooking();
  const rescheduleMutation = useRescheduleBooking();
  const toast = useToast();
  const location = useLocation();
  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const [reschedule, setReschedule] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [busy, setBusy] = useState(false);

  const bookings = data?.data ?? [];
  const highlight = (location.state as { highlight?: string } | null)?.highlight;

  useEffect(() => {
    if (highlight) {
      document.getElementById(`b-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, bookings.length]);

  const doCancel = async () => {
    if (!toCancel) return;
    setBusy(true);
    try {
      await cancel.mutateAsync(toCancel._id);
      toast.success('Booking cancelled');
      setToCancel(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doReschedule = async () => {
    if (!reschedule || !newDate || !newSlot) return;
    setBusy(true);
    try {
      await rescheduleMutation.mutateAsync({ id: reschedule._id, date: newDate, timeSlot: newSlot });
      toast.success('Booking rescheduled');
      setReschedule(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>My Bookings</title>
      </Helmet>
      <PageHeader title="My Bookings" subtitle={`${bookings.length} total booking${bookings.length === 1 ? '' : 's'}`} />

      {bookings.length === 0 ? (
        <Card>
          <EmptyState title="No bookings yet" description="When you book a service, it will appear here." />
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const vehicle = unvehicle(b.vehicle);
            const serviceName = b.services?.length ? `${b.services.length} service${b.services.length > 1 ? 's' : ''}` : 'Service booking';
            return (
              <Card key={b._id} className={highlight === b._id ? 'ring-2 ring-brand-500' : ''} id={`b-${b._id}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{b.bookingId}</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {serviceName} · {vehicle?.brand} {vehicle?.model}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.scheduledDate)} · {b.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {['Requested', 'Confirmed', 'Rescheduled'].includes(b.status) && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => { setReschedule(b); setNewDate(b.scheduledDate.slice(0, 10)); setNewSlot(b.timeSlot); }}>
                          <CalendarClock className="h-3.5 w-3.5" /> Reschedule
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setToCancel(b)}>
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                    {!['Requested', 'Confirmed', 'Rescheduled'].includes(b.status) && (
                      <Link to="/account/service" className="btn-secondary btn-sm px-3 py-1.5 text-xs">Track</Link>
                    )}
                  </div>
                </div>
                {b.issueDescription && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">Notes: {b.issueDescription}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={() => void doCancel()}
        title="Cancel booking"
        message={`Cancel ${toCancel?.bookingId}? This cannot be undone.`}
        confirmLabel="Cancel booking"
        loading={busy}
      />

      <Modal open={!!reschedule} onClose={() => setReschedule(null)} title={`Reschedule ${reschedule?.bookingId ?? ''}`} size="sm">
        <Field label="New date" required>
          <Input type="date" min={new Date().toISOString().slice(0, 10)} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        </Field>
        <Field label="New time slot" required>
          <div className="grid grid-cols-4 gap-2">
            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((s) => (
              <button
                key={s}
                onClick={() => setNewSlot(s)}
                className={
                  newSlot === s
                    ? 'rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-bold text-white'
                    : 'rounded-lg border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                }
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setReschedule(null)}>Cancel</Button>
          <Button loading={busy} onClick={() => void doReschedule()} disabled={!newDate || !newSlot}>Confirm</Button>
        </div>
      </Modal>
    </>
  );
}