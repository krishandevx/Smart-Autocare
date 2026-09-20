import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useVehiclesList } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { unuser } from './shared';
import type { Vehicle } from '../../types';

export default function AdminVehicles() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useVehiclesList({ q: q || undefined, page, limit: 12 });

  const columns: Column<Vehicle>[] = [
    { key: 'regNumber', header: 'Registration', render: (v) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{v.regNumber}</span>, sortValue: (v) => v.regNumber },
    { key: 'vehicle', header: 'Vehicle', render: (v) => `${v.brand} ${v.model} (${v.year})`, sortValue: (v) => `${v.brand} ${v.model}` },
    { key: 'owner', header: 'Owner', render: (v) => unuser(v.owner)?.name, sortValue: (v) => unuser(v.owner)?.name ?? '' },
    { key: 'category', header: 'Type', render: (v) => <span className="text-slate-500">{v.category || v.type}</span> },
    { key: 'fuelType', header: 'Fuel', render: (v) => <span className="text-slate-500">{v.fuelType}</span> },
    { key: 'mileage', header: 'Mileage', render: (v) => <span className="whitespace-nowrap">{v.mileage?.toLocaleString() ?? '—'} km</span>, sort: (a, b) => (a.mileage || 0) - (b.mileage || 0) },
    { key: 'isActive', header: 'Status', render: (v) => <Badge tone={v.isActive ? 'green' : 'slate'}>{v.isActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Vehicles</title>
      </Helmet>
      <PageHeader
        title="Vehicles"
        subtitle="Every vehicle registered across the workshop"
      />

      <DataTable
        columns={columns}
        data={(data?.data ?? []) as Vehicle[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by brand, model or registration…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
        rowClick={(v) => navigate(`/admin/vehicles/${v._id}`)}
      />
    </>
  );
}