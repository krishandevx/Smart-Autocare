import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminDashboard, useAppointments, useParts, useCustomers } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Wrench, CalendarCheck, Hourglass, Car, Wallet, Package, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { unuser, unvehicle } from './shared';

export default function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard();
  const { data: apptsData } = useAppointments({ limit: 6, date: new Date().toISOString().slice(0, 10) });
  const { data: partsData } = useParts({ lowStock: true, limit: 6 });
  const { data: customersData } = useCustomers({ limit: 5 });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Couldn't load the dashboard"
        description="We couldn't reach the server. Check your connection and try again."
        action={
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        }
      />
    );
  }

  const chartData = data.revenueSeries?.map((s) => ({ label: s.label, Revenue: s.revenue, Services: s.services })) ?? [];

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <PageHeader
        title="Workshop Dashboard"
        subtitle={`${formatDate(new Date().toISOString(), 'EEEE, d MMM yyyy')} · ${data.activeJobs} active jobs`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's appointments" value={data.todayAppointments} icon={CalendarCheck} tone="sky" href="/admin/appointments" />
        <StatCard label="Open job cards" value={data.activeJobs} icon={Wrench} tone="brand" href="/admin/job-cards" />
        <StatCard label="Awaiting approval" value={data.pendingApprovals} icon={Hourglass} tone="amber" href="/admin/estimates" />
        <StatCard label="Vehicles in shop" value={data.inShopVehicles} icon={Car} tone="sky" href="/admin/bookings" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month revenue" value={formatCurrency(data.thisMonthRevenue, true)} icon={TrendingUp} tone="green" href="/admin/reports" />
        <StatCard label="Pending payments" value={formatCurrency(data.pendingPaymentTotal, true)} icon={Wallet} tone="red" href="/admin/invoices" />
        <StatCard label="Low stock parts" value={data.lowStockCount} icon={Package} tone="amber" href="/admin/inventory" />
        <StatCard label="New customers" value={data.newCustomersThisMonth} icon={Users} tone="violet" href="/admin/customers" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Today's appointments</CardTitle>
          <CardDescription>Who's coming in today</CardDescription>
          <div className="mt-4 space-y-3">
            {(apptsData?.data ?? []).length === 0 && <p className="text-sm text-slate-400">No appointments today.</p>}
            {(apptsData?.data ?? []).slice(0, 5).map((a) => (
              <Link key={a._id} to="/admin/appointments" className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{unuser(a.customer)?.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {unvehicle(a.vehicle)?.brand} {unvehicle(a.vehicle)?.model} · {a.timeSlot}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>
                Paid {formatCurrency(data.revenueTotal.paid, true)} · Outstanding {formatCurrency(data.revenueTotal.pending, true)}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b66f5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1b66f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="Revenue" stroke="#1b66f5" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Low stock alert</CardTitle>
          <CardDescription>Parts below minimum stock</CardDescription>
          <div className="mt-4 space-y-2">
            {(partsData?.data ?? []).length === 0 && <p className="text-sm text-slate-400">All parts sufficiently stocked.</p>}
            {(partsData?.data ?? []).map((p) => (
              <Link
                key={p._id}
                to={`/admin/inventory/${p._id}`}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/5"
              >
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-300">{p.name}</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-500/70">{p.partNumber}</p>
                </div>
                <p className="font-bold text-amber-800 dark:text-amber-400">
                  {p.stock} / {p.minStock}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Recent customers</CardTitle>
          <CardDescription>Latest account sign-ups</CardDescription>
          <div className="mt-4 space-y-3">
            {(customersData?.data ?? []).length === 0 && <p className="text-sm text-slate-400">No customers yet.</p>}
            {(customersData?.data ?? []).slice(0, 5).map((c) => (
              <Link key={c._id} to={`/admin/customers/${c._id}`} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                  <p className="truncate text-xs text-slate-400">{c.phone} · {c.email}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">{c.vehicleCount ?? 0} vehicles</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}