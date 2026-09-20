import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Wrench, FileCheck, CheckCircle2 } from 'lucide-react';
import { useJobCards } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';

const jobFlow = ['Open', 'In Inspection', 'Estimate Pending', 'Awaiting Approval', 'In Progress', 'Parts Ordered', 'Quality Check', 'Completed', 'Closed'];

export default function ActiveService() {
  const { data, isLoading } = useJobCards({ limit: 50 });
  const jobs = (data?.data ?? []).filter((j) => !['Completed', 'Closed', 'Cancelled'].includes(j.status));

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Active Service</title>
      </Helmet>
      <PageHeader
        title="Active Service"
        subtitle="Track your in-progress work in real time"
        actions={
          <Link to="/account/book" className="btn-primary">
            Book new service
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            title="No active service right now"
            description="Your vehicle is all caught up. Book your next service whenever you're ready."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {jobs.map((j) => {
            const vehicle = j.vehicle as unknown as { make?: string; model?: string; registrationNumber?: string };
            const currentIdx = Math.max(jobFlow.indexOf(j.status), 0);
            return (
              <Card key={j._id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{j.jobCardId}</p>
                    <h3 className="mt-0.5 font-display text-lg font-bold text-slate-900 dark:text-white">
                      {vehicle?.make} {vehicle?.model}
                    </h3>
                    <p className="text-xs text-slate-400">{vehicle?.registrationNumber} · Job opened {formatDate(j.createdAt)}</p>
                  </div>
                  <StatusBadge status={j.status} />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    {jobFlow.slice(0, 8).map((s, i) => (
                      <div key={s} className="flex flex-1 flex-col items-center">
                        <div
                          className={
                            i < currentIdx
                              ? 'flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white'
                              : i === currentIdx
                                ? 'flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-500/20'
                                : 'flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }
                        >
                          {i < currentIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        {i < 7 && <div className={i < currentIdx ? 'mt-2 h-0.5 w-full bg-emerald-500' : 'mt-2 h-0.5 w-full bg-slate-100 dark:bg-slate-800'} />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {j.status === 'Awaiting Approval' ? 'Awaiting your approval' : `Current step: ${jobFlow[currentIdx]}`}
                  </p>
                </div>

                {j.status === 'Awaiting Approval' && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-50 p-3 text-sm dark:bg-brand-500/10">
                    <FileCheck className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                    <p className="text-brand-700 dark:text-brand-300">
                      There's an estimate waiting for your approval. <Link to="/account/bookings" className="font-bold underline">Review it</Link>.
                    </p>
                  </div>
                )}

                {j.assignedMechanic && (
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <Wrench className="h-4 w-4 text-slate-400" />
                    Assigned to <strong className="text-slate-700 dark:text-slate-200">{(j.assignedMechanic as unknown as { name?: string })?.name ?? 'workshop'}</strong>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}