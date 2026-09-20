import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { useJobCards } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { unvehicle, unuser } from './shared';
import type { JobCard } from '../../types';

const STAGES = ['In Inspection', 'Estimate Pending', 'Awaiting Approval', 'In Progress'];

export default function Inspections() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useJobCards({ q: q || undefined, page, limit: 12, status: status || undefined });

  const columns: Column<JobCard>[] = [
    { key: 'jobCardId', header: 'Job card', render: (j) => <Link className="font-mono text-xs font-bold text-brand-600 hover:underline dark:text-brand-400" to={`/admin/job-cards/${j._id}`}>{j.jobCardId}</Link> },
    { key: 'customer', header: 'Customer', render: (j) => unuser(j.customer)?.name, sortValue: (j) => unuser(j.customer)?.name ?? '' },
    { key: 'vehicle', header: 'Vehicle', render: (j) => `${unvehicle(j.vehicle)?.brand} ${unvehicle(j.vehicle)?.model}`, sortValue: (j) => `${unvehicle(j.vehicle)?.brand} ${unvehicle(j.vehicle)?.model}` },
    { key: 'mileageIn', header: 'Mileage in', render: (j) => <span className="whitespace-nowrap">{j.mileageIn.toLocaleString()} km</span>, sortValue: (j) => j.mileageIn },
    { key: 'status', header: 'Stage', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'createdAt', header: 'Opened', render: (j) => <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(j.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Inspections</title>
      </Helmet>
      <PageHeader
        title="Inspections"
        subtitle="Vehicles going through the digital health inspection and estimate cycle"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...STAGES, 'Invoiced', 'Closed'].map((s) => (
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
        data={(data?.data ?? []) as JobCard[]}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by job card, customer or vehicle…"
        page={page}
        totalPages={data?.meta.pages ?? 1}
        onPageChange={setPage}
        onSearch={(v) => { setQ(v); setPage(1); }}
        emptyTitle="No job cards matching"
        emptyDescription="Inspections live on job cards. Create a job card from a booking to start one."
        rowClick={(j) => navigate(`/admin/job-cards/${j._id}`)}
      />

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Search className="h-3.5 w-3.5" />
        Inspection forms, health scores and estimates are managed inside each job card.
      </div>
    </>
  );
}