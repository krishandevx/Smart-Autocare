import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bell, CheckCheck, Megaphone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useNotifyStaff } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Textarea } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, getErrorMessage } from '../../lib/utils';
import { can } from './shared';
import { useAuth } from '../../contexts/AuthContext';
import type { Notification } from '../../types';

const typeTone: Record<string, string> = {
  booking: 'blue',
  jobcard: 'amber',
  invoice: 'purple',
  reminder: 'blue',
  appointment: 'amber',
  estimate: 'purple',
  announcement: 'red',
};

export default function AdminNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { data, isLoading } = useNotifications({ page, limit: 15, unread: onlyUnread || undefined });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const broadcast = useNotifyStaff();
  const toast = useToast();
  const [bcast, setBcast] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const items = (data?.data ?? []).filter((n) => !onlyUnread || !n.read);
  const unreadCount = (data?.data ?? []).filter((n) => !n.read).length;

  const open = async (n: Notification) => {
    if (!n.read) {
      try {
        await markRead.mutateAsync(n._id);
        void qc.invalidateQueries({ queryKey: ['notifications'] });
        void qc.invalidateQueries({ queryKey: ['unread'] });
      } catch {
        /* noop */
      }
    }
    if (n.link) window.location.href = n.link;
  };

  const clearAll = async () => {
    setBusy(true);
    try {
      await markAll.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setBusy(true);
    try {
      await broadcast.mutateAsync({ title, message, link: '/admin' });
      toast.success('Notification sent to all staff');
      setBcast(false);
      setTitle('');
      setMessage('');
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Notifications</title>
      </Helmet>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread for you` : 'You are all caught up'}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setOnlyUnread((v) => !v)}>
              <Bell className="h-3.5 w-3.5" /> {onlyUnread ? 'All' : 'Unread'}
            </Button>
            {can(user?.role, ['admin', 'super_admin', 'workshop_manager']) && (
              <Button size="sm" onClick={() => setBcast(true)}>
                <Megaphone className="h-3.5 w-3.5" /> Broadcast
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-2">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" loading={busy} onClick={() => void clearAll()}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </Button>
          </div>
        )}
        {(items).length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-14 text-slate-400 dark:border-slate-700">
            <Bell className="h-8 w-8" />
            <p className="text-sm">{onlyUnread ? 'No unread notifications.' : 'No notifications yet.'}</p>
          </div>
        )}

        {items.map((n) => (
          <button
            key={n._id}
            onClick={() => void open(n)}
            className={`w-full rounded-2xl border p-4 text-left transition hover:border-brand-400 dark:hover:border-brand-500 ${
              n.read
                ? 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
                : 'border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone={typeTone[n.type] ?? 'slate'}>{n.type}</Badge>
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDate(n.createdAt)}</span>
            </div>
            <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
            {n.link && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                View <ArrowUpRight className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <span className="text-xs text-slate-400">Page {page} of {data?.meta.pages ?? 1}</span>
        <Button size="sm" variant="outline" disabled={page >= (data?.meta.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <Modal open={bcast} onClose={() => setBcast(false)} title="Broadcast to staff" size="sm">
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Workshop closing early Friday" />
        </Field>
        <Field label="Message" required>
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Details for all staff…" />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setBcast(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void send()}>Send</Button>
        </div>
      </Modal>
    </>
  );
}