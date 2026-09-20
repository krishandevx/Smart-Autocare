import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Users, Package, Car, HeartPulse, IndianRupee } from 'lucide-react';
import { useReportsAll } from '../../api/hooks';
import { PageLoader, SkeletonGrid } from '../../components/ui/Feedback';
import { Card, CardTitle } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatCurrency } from '../../lib/utils';
import { REPORT_UNITS } from '../../constants';

interface ReportsPayload {
  revenue: { unit: string; series: { label: string; revenue: number; services: number }[]; total: { paid: number; billed: number; pending: number } };
  services: { totalServices: number; totalRevenue: number; mostRequested: { name: string; count: number; revenue: number }[]; timeline: { label: string; count: number }[] };
  customers: { totalCustomers: number; newThisMonth: number; activeCustomers: number; returningCustomers: number; retentionRate: number; vehicles: { type: string; count: number }[]; brands: { brand: string; count: number }[] };
  inventory: { totalParts: number; totalStockValue: number; lowStockCount: number; lowStock: { id: string; name: string; partNumber: string; stock: number; minStock: number }[]; fastMoving: { name: string; partNumber: string; qty: number }[] };
  vehicles: { types: { _id: string; count: number }[]; fuels: { _id: string; count: number }[]; brands: { name: string; count: number }[]; mostServiced: { name: string; regNumber: string; count: number }[] };
  crm: { bookingsTotal: number; openBookings: number; jobsTotal: number; revenueCollected: number; pendingRevenue: number };
}

interface KpiProps { label: string; value: string; sub?: string; icon: typeof TrendingUp; tone?: string }
function Kpi({ label, value, sub, icon: Icon, tone = 'brand' }: KpiProps) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className="font-display text-lg font-extrabold text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, tone = 'bg-brand-600' }: { label: string; value: number; max: number; tone?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate pr-2 text-slate-600 dark:text-slate-300">{label}</span>
        <span className="shrink-0 font-semibold text-slate-800 dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${max > 0 ? Math.max(4, (value / max) * 100) : 0}%` }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const [unit, setUnit] = useState('month');
  const { data, isFetching } = useReportsAll(unit);
  const d = (data ?? {}) as unknown as ReportsPayload;
  const rev = d.revenue ?? { series: [], total: { paid: 0, billed: 0, pending: 0 } };
  const maxRev = Math.max(1, ...rev.series.map((s) => s.revenue));

  if (!data && isFetching) return <PageLoader />;

  const srvs = d.services ?? { mostRequested: [], timeline: [] };
  const cust = d.customers ?? { vehicles: [], brands: [] };
  const inv = d.inventory ?? { lowStock: [], fastMoving: [] };
  const veh = d.vehicles ?? { types: [], fuels: [], brands: [], mostServiced: [] };
  const crm = d.crm ?? {};
  const maxFast = Math.max(1, ...inv.fastMoving.map((f) => f.qty));
  const maxBrand = Math.max(1, ...cust.brands.map((b) => b.count));
  const maxTimeline = Math.max(1, ...srvs.timeline.map((t) => t.count));

  return (
    <>
      <Helmet>
        <title>Reports</title>
      </Helmet>
      <PageHeader title="Reports & analytics" subtitle="Business-wide performance at a glance" />

      <div className="mb-5 flex flex-wrap gap-2">
        {REPORT_UNITS.map((u) => (
          <button
            key={u.id}
            onClick={() => setUnit(u.id)}
            className={
              unit === u.id
                ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }
          >
            {u.label}
          </button>
        ))}
      </div>

      {isFetching && <SkeletonGrid cards={4} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Collected" value={formatCurrency(rev.total.paid)} icon={IndianRupee} tone="green" />
        <Kpi label="Billed" value={formatCurrency(rev.total.billed)} icon={TrendingUp} tone="brand" />
        <Kpi label="Pending" value={formatCurrency(rev.total.pending)} icon={IndianRupee} tone="amber" />
        <Kpi label="Invoices" value={String(rev.series.reduce((s, x) => s + x.services, 0))} icon={HeartPulse} tone="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Revenue over time ({unit})</CardTitle>
          <div className="mt-4 space-y-3">
            {rev.series.length === 0 && <p className="text-sm text-slate-400">No revenue data for this period.</p>}
            {rev.series.map((s) => (
              <BarRow key={s.label} label={s.label} value={s.revenue} max={maxRev} />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Most requested services</CardTitle>
          <div className="mt-4 space-y-2">
            {srvs.mostRequested.length === 0 && <p className="text-sm text-slate-400">No service records yet.</p>}
            {srvs.mostRequested.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                <span className="text-xs text-slate-400">{s.count} × {formatCurrency(s.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Customer health</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Total" value={String(cust.totalCustomers ?? 0)} icon={Users} tone="brand" />
            <Kpi label="New this month" value={String(cust.newThisMonth ?? 0)} icon={Users} tone="green" />
            <Kpi label="Active" value={String(cust.activeCustomers ?? 0)} icon={Users} tone="sky" />
            <Kpi label="Retention" value={`${cust.retentionRate ?? 0}%`} icon={Users} tone="violet" />
          </div>
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            {cust.brands.map((b) => (
              <BarRow key={b.brand} label={b.brand} value={b.count} max={maxBrand} tone="bg-sky-500" />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Inventory</CardTitle>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Kpi label="Parts" value={String(inv.totalParts ?? 0)} icon={Package} tone="brand" />
            <Kpi label="Low stock" value={String(inv.lowStockCount ?? 0)} icon={Package} tone="amber" />
            <Kpi label="Stock value" value={formatCurrency(inv.totalStockValue ?? 0)} icon={IndianRupee} tone="green" />
          </div>
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fast-moving parts</p>
            {inv.fastMoving.map((f) => (
              <BarRow key={f.partNumber} label={`${f.name} (${f.partNumber})`} value={f.qty} max={maxFast} tone="bg-violet-500" />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Fleet composition</CardTitle>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Vehicle types</p>
              <div className="mt-2 space-y-1.5">
                {veh.types.map((t) => (
                  <p key={t._id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span className="capitalize">{t._id}</span><b>{t.count}</b></p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fuel types</p>
              <div className="mt-2 space-y-1.5">
                {veh.fuels.map((f) => (
                  <p key={f._id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300"><span className="capitalize">{f._id}</span><b>{f.count}</b></p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Most serviced</p>
              <div className="mt-2 space-y-1.5">
                {veh.mostServiced.map((m) => (
                  <p key={m.regNumber} className="text-sm text-slate-600 dark:text-slate-300">
                    <b className="mr-1">{m.name}</b><span className="mr-1 font-mono text-xs text-slate-400">{m.regNumber}</span>· {m.count}×
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Pipeline (CRM)</CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Kpi label="Bookings" value={String(crm.bookingsTotal ?? 0)} icon={Car} tone="brand" />
            <Kpi label="Open" value={String(crm.openBookings ?? 0)} icon={Car} tone="amber" />
            <Kpi label="Job cards" value={String(crm.jobsTotal ?? 0)} icon={HeartPulse} tone="sky" />
            <Kpi label="Collected" value={formatCurrency(crm.revenueCollected ?? 0)} icon={IndianRupee} tone="green" />
            <Kpi label="Pending" value={formatCurrency(crm.pendingRevenue ?? 0)} icon={IndianRupee} tone="red" />
          </div>
        </Card>
      </div>
    </>
  );
}