import { Moon, Sun, Monitor, Bell } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn, formatDate } from '../lib/utils';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Notification } from '../types';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolved, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const options = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Toggle theme"
      >
        {resolved === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 top-12 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-card-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {options.map((o) => (
              <button
                key={o.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(o.id as 'light' | 'dark' | 'system');
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
                  theme === o.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <o.icon className="h-4 w-4" />
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={toggle} className="sr-only">
        toggle
      </button>
    </div>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const { data } = useNotifications({ limit: 8 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  const goTo = (n: Notification) => {
    void markRead.mutateAsync(n._id);
    setOpen(false);
    if (n.data?.type === 'estimate') navigate('/account/service');
    else if (n.data?.type === 'invoice' || n.data?.type === 'payment') navigate('/account/invoices');
    else if (n.data?.type === 'booking') navigate('/account/bookings');
    else navigate('/account/notifications');
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h4 className="font-display text-sm font-bold text-slate-800 dark:text-white">Notifications</h4>
              {unread > 0 && (
                <button onClick={() => void markAll.mutateAsync()} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => goTo(n)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
                    !n.read && 'bg-brand-50/50 dark:bg-brand-500/5',
                  )}
                >
                  <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-brand-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{formatDate(n.createdAt, 'd MMM, h:mm a')}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                navigate('/account/notifications');
              }}
              className="w-full border-t border-slate-100 px-4 py-2.5 text-center text-xs font-semibold text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800/50"
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}