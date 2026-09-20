import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useMyVehicles, useServices, useTimeSlots, useCreateBooking } from '../api/hooks';
import { useToast } from './ui/Toast';
import { formatCurrency, getErrorMessage } from '../lib/utils';
import { Field } from './ui/Form';
import { EmptyState } from './ui/Feedback';
import type { Booking } from '../types';

const steps = ['Vehicle & service', 'Pick a slot', 'Confirm'];

export function BookingFlow() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState('');
  const [service, setService] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [preferPickup, setPreferPickup] = useState(true);

  const { data: vehiclesData } = useMyVehicles();
  const { data: servicesData } = useServices();
  const vehicles = vehiclesData?.data ?? [];
  const services = servicesData ?? [];

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const { data: slots, isLoading: slotsLoading } = useTimeSlots(date, serviceName);
  const createBooking = useCreateBooking();

  useEffect(() => {
    if (!date) setDate(tomorrow);
  }, [tomorrow, date]);

  const selectedService = services.find((s) => s._id === service);
  const selectedVehicle = vehicles.find((v) => v._id === vehicle);

  const canNext =
    step === 0
      ? !!vehicle && !!service
      : step === 1
        ? !!date && !!timeSlot
        : true;

  const submit = async () => {
    try {
      const booking = await createBooking.mutateAsync({
        vehicle,
        services: [service],
        scheduledDate: new Date(`${date}T${timeSlot}:00`).toISOString(),
        timeSlot,
        pickup: {
          enabled: preferPickup,
          mode: preferPickup ? 'Pickup and Drop' : 'Workshop Visit',
          address: preferPickup ? address : '',
        },
        issueDescription: notes,
      });
      toast.success(`Booking ${(booking as Booking).bookingId} confirmed`);
      navigate('/account/bookings', { state: { highlight: (booking as Booking)._id } });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not create booking'));
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={
                i < step
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white'
                  : i === step
                    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white'
                    : 'flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800'
              }
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={i < step ? 'h-0.5 flex-1 bg-emerald-500' : 'h-0.5 flex-1 bg-slate-100 dark:bg-slate-800'} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Select your vehicle" required>
                {vehicles.length === 0 ? (
                  <EmptyState
                    title="No vehicles yet"
                    description="Add a vehicle before booking a service — takes 10 seconds."
                    action={
                      <button className="btn-primary" onClick={() => navigate('/account/vehicles')}>
                        Add vehicle
                      </button>
                    }
                  />
                ) : (
                  <div className="grid gap-2">
                    {vehicles.map((v) => (
                      <button
                        key={v._id}
                        onClick={() => setVehicle(v._id)}
                        className={
                          vehicle === v._id
                            ? 'rounded-xl border-2 border-brand-600 bg-brand-50/50 px-4 py-3 text-left dark:bg-brand-500/10'
                            : 'rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-brand-400 dark:border-slate-700'
                        }
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {v.brand} {v.model} <span className="text-slate-400">{v.year}</span>
                        </p>
                        <p className="text-xs text-slate-400">{v.regNumber} · {v.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Choose a service" required>
                <select value={service} onChange={(e) => { setService(e.target.value); setServiceName(e.target.selectedOptions[0].textContent || ''); }} className="input-base">
                  <option value="">Select service…</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {formatCurrency(s.basePrice)}
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <p className="font-semibold">{selectedService.description}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> About {selectedService.estimatedHours}h
                    </p>
                  </div>
                )}
              </Field>
            </div>
          )}

          {step === 1 && (
            <div>
              <Field label="Pickup preference">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreferPickup(true)}
                    className={preferPickup ? 'rounded-xl border-2 border-brand-600 px-4 py-3 text-sm font-semibold text-brand-700 dark:text-brand-300' : 'rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700'}
                  >
                    🚚 Doorstep pickup
                  </button>
                  <button
                    onClick={() => setPreferPickup(false)}
                    className={!preferPickup ? 'rounded-xl border-2 border-brand-600 px-4 py-3 text-sm font-semibold text-brand-700 dark:text-brand-300' : 'rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700'}
                  >
                    🏢 Drop at workshop
                  </button>
                </div>
              </Field>
              {preferPickup && (
                <Field label="Pickup address" required>
                  <input className="input-base" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, street, area, city" />
                </Field>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Preferred date" required>
                  <input type="date" min={tomorrow} className="input-base" value={date} onChange={(e) => { setDate(e.target.value); setTimeSlot(''); }} />
                </Field>
                <Field label="Time slot" required hint="Choose from available slots for the selected date and service.">
                  {slotsLoading ? (
                    <p className="text-sm text-slate-400">Checking availability…</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {(slots?.slots ?? []).map((s) => (
                        <button
                          key={s}
                          disabled={!slots?.available}
                          onClick={() => setTimeSlot(s)}
                          className={
                            timeSlot === s
                              ? 'rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-bold text-white'
                              : slots?.available
                                ? 'rounded-lg border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:text-slate-200'
                                : 'cursor-not-allowed rounded-lg bg-slate-50 px-2 py-2 text-center text-xs text-slate-300 line-through dark:bg-slate-800 dark:text-slate-600'
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
              <Field label="Notes for the technician">
                <textarea className="input-base" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. slight noise while braking, AC not cooling…" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/60">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Review your booking</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Vehicle</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-100">
                      {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.regNumber})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Service</dt>
                    <dd className="text-right font-semibold text-slate-800 dark:text-slate-100">{selectedService?.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Date</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-100">{date}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Slot</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-100">{timeSlot}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Pickup</dt>
                    <dd className="font-semibold text-slate-800 dark:text-slate-100">{preferPickup ? (address || 'Doorstep pickup') : 'Drop at workshop'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                    <dt className="font-semibold text-slate-900 dark:text-white">Estimated price</dt>
                    <dd className="font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(selectedService?.basePrice ?? 0)}*
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-400">*Final price may vary with a detailed estimate after the health scan — and never without your approval.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < 2 ? (
          <button className={canNext ? 'btn-primary px-6' : 'btn-primary px-6 opacity-40'} disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="btn-primary px-6" disabled={createBooking.isPending} onClick={() => void submit()}>
            <CalendarCheck className="h-4 w-4" /> {createBooking.isPending ? 'Booking…' : 'Confirm booking'}
          </button>
        )}
      </div>
    </div>
  );
}