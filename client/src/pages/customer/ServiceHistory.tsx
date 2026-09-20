import { Helmet } from 'react-helmet-async';
import { FileText, Phone, Wrench } from 'lucide-react';
import { useServiceRecords } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { formatDate, formatCurrency } from '../../lib/utils';
import { unvehicle } from '../admin/shared';

export default function ServiceHistory() {
  const { data, isLoading } = useServiceRecords({ limit: 100 });
  const records = data?.data ?? [];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Service History</title>
      </Helmet>
      <PageHeader
        title="Service History"
        subtitle="A complete digital log of everything done on your vehicles"
        actions={
          <a href="tel:18001234567" className="btn-secondary">
            <Phone className="h-4 w-4" /> Call for details
          </a>
        }
      />

      {records.length === 0 ? (
        <Card>
          <EmptyState title="No service records yet" description="Completed services will appear here with full detail." />
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((r) => {
            const vehicle = unvehicle(r.vehicle);
            return (
              <Card key={r._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {vehicle?.brand} {vehicle?.model} <span className="text-slate-400">({vehicle?.regNumber})</span>
                      </p>
                      <p className="text-xs text-slate-400">Serviced on {formatDate(r.date)} {r.mileage ? `· ${r.mileage.toLocaleString()} km` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrency(r.total)}</p>
                    <p className="text-xs text-slate-400">{r.technician ? `by ${r.technician}` : ''}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Wrench className="h-3.5 w-3.5" /> Service
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.serviceName || 'Workshop service'}</p>
                  {r.parts.length > 0 && (
                    <p className="mt-2 text-xs text-slate-400">Parts: {r.parts.map((p) => `${p.name} ×${p.qty}`).join(', ')}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}