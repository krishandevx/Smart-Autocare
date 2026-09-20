import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Phone, Mail, MapPin, Car, CalendarCheck, Wallet } from 'lucide-react';
import { useCustomer } from '../../api/hooks';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { unvehicle } from './shared';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: c, isLoading } = useCustomer(id);

  if (isLoading) return <PageLoader />;
  if (!c) return <EmptyState title="Customer not found" />;

  return (
    <>
      <Helmet>
        <title>{c.name}</title>
      </Helmet>
      <div className="mb-1">
        <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Customers
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-xl font-extrabold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{c.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {c.email}</span>
                {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {c.phone}</span>}
                {c.address && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.address}</span>}
              </div>
            </div>
          </div>
          <StatusBadge status={c.status ?? 'active'} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>Registered on this account</CardDescription>
          <div className="mt-4 space-y-3">
            {(c.vehicles ?? []).length === 0 && <p className="text-sm text-slate-400">No vehicles registered.</p>}
            {(c.vehicles ?? []).map((v) => (
              <Link key={v._id} to={`/admin/vehicles/${v._id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-brand-300 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Car className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{v.brand} {v.model} ({v.year})</p>
                  <p className="text-xs text-slate-400">{v.regNumber} · {v.category || v.type} · {v.fuelType}</p>
                </div>
                <span className="text-xs text-slate-400">{v.mileage?.toLocaleString() ?? '—'} km</span>
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Recent bookings</CardTitle>
            <div className="mt-4 space-y-3">
              {(c.recentBookings ?? []).length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
              {(c.recentBookings ?? []).map((b) => (
                <div key={b._id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{b.bookingId}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {unvehicle(b.vehicle)?.brand} {unvehicle(b.vehicle)?.model} · {formatDate(b.scheduledDate)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Recent invoices</CardTitle>
            <div className="mt-4 space-y-3">
              {(c.recentInvoices ?? []).length === 0 && <p className="text-sm text-slate-400">No invoices yet.</p>}
              {(c.recentInvoices ?? []).map((i) => (
                <Link key={i._id} to={`/admin/invoices/${i._id}`} className="flex items-center justify-between gap-2 text-sm rounded-lg hover:bg-slate-50 p-2 -m-2 dark:hover:bg-slate-800/60">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{i.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{formatDate(i.issuedDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100"><Wallet className="h-3.5 w-3.5" /> {formatCurrency(i.grandTotal)}</p>
                    <div><StatusBadge status={i.paymentStatus} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}