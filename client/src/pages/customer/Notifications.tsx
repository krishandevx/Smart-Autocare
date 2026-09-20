import { Helmet } from 'react-helmet-async';
import { CheckCheck } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import Button from '../../components/ui/Button';

export default function CustomerNotifications() {
  const { data, isLoading } = useNotifications({ limit: 100 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Notifications</title>
      </Helmet>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread === 1 ? '' : 's'}`}
        actions={
          unread > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => void markAll.mutateAsync()}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <EmptyState title="No notifications" description="Updates about your bookings, estimates and invoices will appear here." />
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={cn('flex items-start gap-3', !n.read && 'border-brand-300 bg-brand-50/40 dark:border-brand-500/30 dark:bg-brand-500/5')}
            >
              <div className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-brand-500')} />
              <button className="min-w-0 flex-1 text-left" onClick={() => void markRead.mutateAsync(n._id)}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt, 'd MMM yyyy, h:mm a')}</p>
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}