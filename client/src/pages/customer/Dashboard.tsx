import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, CalendarCheck, Wallet, Bell, ArrowRight, Wrench } from 'lucide-react';
import { useCustomerDashboard } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { StatusBadge, HealthScoreBadge } from '../../components/ui/Badge';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { unvehicle } from '../admin/shared';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useCustomerDashboard();

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Couldn't load your dashboard"
        description="We couldn't reach the server. Check your connection and try again."
        action={
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        }
      />
    );
  }

  const day = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dueReminders = data.reminders.filter((r) => ['Due Soon', 'Overdue'].includes(r.status)).length;
  const pendingInvoice = data.invoices.find((i) => i.remaining > 0);

  return (
    <>
      <Helmet>
        <title>My Dashboard</title>
      </Helmet>
      <PageHeader
        title={`${day}, ${user?.name.split(' ')[0]}`}
        subtitle="Here's what's happening with your vehicles."
        actions={
          <Link to="/account/book" className="btn-primary">
            <CalendarCheck className="h-4 w-4" /> Book a service
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My vehicles" value={data.vehicleCount} icon={Car} tone="brand" href="/account/vehicles" />
        <StatCard label="Lifetime spend" value={formatCurrency(data.totalSpend, true)} icon={Wallet} tone="sky" href="/account/invoices" />
        <StatCard label="Pending payments" value={formatCurrency(data.pendingPayments, true)} icon={Wallet} tone="amber" href="/account/invoices" />
        <StatCard label="Due reminders" value={dueReminders} icon={Bell} tone="red" href="/account/reminders" />
      </div>

      {data.pendingPayments > 0 && pendingInvoice && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-amber-800 dark:text-amber-300">
                Outstanding balance: {formatCurrency(data.pendingPayments)}
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                Invoice {pendingInvoice.invoiceNumber} has {formatCurrency(pendingInvoice.remaining)} due.
              </p>
            </div>
            <Link to="/account/invoices" className="btn bg-white text-amber-800 shadow-sm hover:bg-amber-100 dark:bg-slate-900 dark:text-amber-300">
              Pay now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Active service</CardTitle>
          <CardDescription>Work currently in progress</CardDescription>
          <div className="mt-4">
            {data.active ? (
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {data.active.bookingId} · {unvehicle(data.active.vehicle)?.brand} {unvehicle(data.active.vehicle)?.model}
                  </p>
                  <p className="text-xs text-slate-400">Estimate and inspection updates will appear here.</p>
                </div>
                <StatusBadge status={data.active.status} />
              </div>
            ) : (
              <EmptyState title="No active service" description="Nothing is being serviced right now." />
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Upcoming appointment</CardTitle>
          <CardDescription>Your next scheduled service visit</CardDescription>
          <div className="mt-4">
            {data.upcoming ? (
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {data.upcoming.bookingId} · {unvehicle(data.upcoming.vehicle)?.brand} {unvehicle(data.upcoming.vehicle)?.model}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(data.upcoming.scheduledDate)} at {data.upcoming.timeSlot} · {data.upcoming.services?.length ? 'Service booked' : 'Workshop visit'}
                  </p>
                </div>
                <StatusBadge status={data.upcoming.status} />
              </div>
            ) : (
              <EmptyState title="No upcoming appointment" description="Book a service to see it here." />
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Recent bookings</CardTitle>
          <CardDescription>Your most recent service bookings</CardDescription>
          <div className="mt-4 space-y-3">
            {data.recentBookings.length === 0 && (
              <EmptyState title="No bookings yet" description="Book a service to see it here." />
            )}
            {data.recentBookings.map((b) => (
              <div key={b._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{b.bookingId}</p>
                  <p className="truncate text-xs text-slate-400">
                    {unvehicle(b.vehicle)?.brand} {unvehicle(b.vehicle)?.model} · {formatDate(b.scheduledDate)}{b.timeSlot ? ` · ${b.timeSlot}` : ''}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Invoices & reminders</CardTitle>
          <CardDescription>Payments due and upcoming maintenance</CardDescription>
          <div className="mt-4 space-y-3">
            {data.invoices.length === 0 && data.reminders.length === 0 && (
              <EmptyState title="Nothing here yet" description="Invoices and service reminders will appear here." />
            )}
            {data.invoices.slice(0, 3).map((i) => (
              <div key={i._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{i.invoiceNumber}</p>
                  <p className="truncate text-xs text-slate-400">{formatDate(i.issuedDate)} · {unvehicle(i.vehicle)?.regNumber ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(i.grandTotal)}</p>
                  <StatusBadge status={i.paymentStatus} />
                </div>
              </div>
            ))}
            {data.reminders.slice(0, 3).map((r) => (
              <div key={r._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                  <p className="truncate text-xs text-slate-400">Due {formatDate(r.dueDate)}{r.vehicle ? ` · ${unvehicle(r.vehicle)?.regNumber}` : ''}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {data.vehicles.length > 0 && (
        <div className="mt-8">
          <CardTitle>Your vehicles</CardTitle>
          <CardDescription>Health scores from the latest inspections</CardDescription>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.vehicles.map((v) => (
              <Link
                key={v._id}
                to="/account/vehicles"
                className="rounded-xl border border-slate-100 p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{v.brand} {v.model}</p>
                      <p className="text-xs text-slate-400">{v.regNumber} · {v.year}</p>
                    </div>
                  </div>
                  <HealthScoreBadge score={v.healthScore} />
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {v.lastServiceDate ? `Last serviced ${formatDate(v.lastServiceDate)}` : 'No service history yet'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}