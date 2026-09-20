import { Helmet } from 'react-helmet-async';
import { Bell, Car } from 'lucide-react';
import { useReminders } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { unvehicle } from '../admin/shared';

export default function MyReminders() {
  const { data, isLoading } = useReminders({ limit: 100 });
  const reminders = data?.data ?? [];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Reminders</title>
      </Helmet>
      <PageHeader title="Reminders" subtitle="Service due dates, insurance renewals and part replacements." />

      {reminders.length === 0 ? (
        <Card>
          <EmptyState title="No reminders" description="We'll nudge you when your vehicle is due for service." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((r) => (
            <Card key={r._id}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <Bell className="h-5 w-5" />
                </div>
                <StatusBadge status={r.status} />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">{r.title}</h3>
              {r.note && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.note}</p>}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                <Car className="h-3.5 w-3.5" />
                {unvehicle(r.vehicle)?.brand} {unvehicle(r.vehicle)?.model}
                <span className="ml-auto">Due {formatDate(r.dueDate)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}