import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCustomers } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import type { Customer2 } from '../../api/hooks';

export default function Customers() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomers({ q: q || undefined, page, limit: 12 });

  const columns: Column<Customer2>[] = [
    { key: 'name', header: 'Customer', render: (c) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
          <p className="text-xs text-slate-400">{c.email}</p>
        </div>
      ), sortValue: (c) => c.name },
    { key: 'phone', header: 'Phone', render: (c) => <span className="whitespace-nowrap">{c.phone || '—'}</span> },
    { key: 'vehicleCount', header: 'Vehicles', render: (c) => <Badge tone="blue">{c.vehicleCount ?? 0}</Badge>, sort: (a, b) => (a.vehicleCount ?? 0) - (b.vehicleCount ?? 0) },
    { key: 'bookingCount', header: 'Bookings', render: (c) => c.bookingCount ?? 0, sort: (a, b) => (a.bookingCount ?? 0) - (b.bookingCount ?? 0) },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={c.status === 'active' ? 'green' : 'slate'}>{c.status ?? 'active'}</Badge> },
    { key: 'createdAt', header: 'Joined', render: (c) => <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(c.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Customers</title>
      </Helmet>
      <PageHeader
        title="Customers"
        subtitle="Everyone registered on the Smart AutoCare platform"
      />

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Customer2[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by name, email or phone…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
        rowClick={(c) => navigate(`/admin/customers/${c._id}`)}
      />
    </>
  );
}