import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Car, FileText, Gauge } from 'lucide-react';
import { useVehicle, useServiceRecords } from '../../api/hooks';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { formatDate, formatCurrency } from '../../lib/utils';
import { unuser } from './shared';

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value ?? '—'}</p>
    </div>
  );
}

export default function VehicleDetail() {
  const { id } = useParams();
  const { data: v, isLoading } = useVehicle(id);
  const { data: recordsData } = useServiceRecords({ vehicle: id, limit: 20 });

  if (isLoading) return <PageLoader />;
  if (!v) return <EmptyState title="Vehicle not found" />;

  const owner = unuser(v.owner);

  return (
    <>
      <Helmet>
        <title>{v.regNumber}</title>
      </Helmet>
      <div className="mb-1">
        <Link to="/admin/vehicles" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Vehicles
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{v.brand} {v.model}</h1>
              <p className="mt-0.5 font-mono text-sm font-bold text-brand-600 dark:text-brand-400">{v.regNumber}</p>
            </div>
          </div>
          {owner && (
            <Link to={`/admin/customers/${owner._id}`} className="btn-secondary">
              View owner · {owner.name}
            </Link>
          )}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Spec label="Category" value={v.category || v.type} />
        <Spec label="Type" value={v.type} />
        <Spec label="Fuel" value={v.fuelType} />
        <Spec label="Transmission" value={v.transmission} />
        <Spec label="Year" value={v.year} />
        <Spec label="VIN" value={v.vin} />
        <Spec label="Engine" value={v.engineNumber} />
        <Spec label="Notes" value={v.notes} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
          <Gauge className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Mileage</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{v.mileage?.toLocaleString() ?? '—'} km</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs text-slate-400">Insurance expiry</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{v.insuranceExpiry ? formatDate(v.insuranceExpiry) : '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs text-slate-400">PUC expiry</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{v.pucExpiry ? formatDate(v.pucExpiry) : '—'}</p>
        </div>
      </div>

      <div className="mt-8">
        <CardTitle>Service records</CardTitle>
        <CardDescription>Complete work history for this vehicle</CardDescription>
        <div className="mt-4 space-y-3">
          {(recordsData?.data ?? []).length === 0 && <p className="text-sm text-slate-400">No service records yet.</p>}
          {(recordsData?.data ?? []).map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{r.serviceName || 'Workshop service'}</p>
                  <p className="text-xs text-slate-400">{formatDate(r.date)} · {r.mileage?.toLocaleString() ?? '—'} km{r.technician ? ` · ${r.technician}` : ''}</p>
                </div>
              </div>
              <p className="font-display font-extrabold text-slate-900 dark:text-white">{formatCurrency(r.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}