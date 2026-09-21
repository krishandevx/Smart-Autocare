import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Car,
  CalendarCheck,
  Wrench,
  Search,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  ChevronDown,
  FileText,
  Receipt,
  Wallet,
  Package,
  Truck,
  ShoppingCart,
  LineChart,
  Star,
  Users,
  ClipboardX,
  Percent,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle, NotificationBell } from '../AppShell';
import { getErrorMessage, cn } from '../../lib/utils';
import { useGlobalSearch } from '../../api/hooks';
import { ROLE_LABELS } from '../../constants';
import type { Role } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

export interface ShellConfig {
  name: string;
  nav: NavItem[];
  allowedRoles: Role[];
  base: string;
}

export function AppShell({ config, children }: { config: ShellConfig; children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState('');
  const search = useGlobalSearch({ q });

  const doLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out');
      navigate('/');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const searchEnabled = config.base === '/admin';

  const isStaff = user && user.role !== 'customer';

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Logo />
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {config.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} src={user?.avatar} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.role ? ROLE_LABELS[user.role] : ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/85 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
            <Menu className="h-5 w-5" />
          </button>

          {searchEnabled && (
            <div className="hidden flex-1 items-center sm:flex">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search vehicles, bookings, invoices, parts…"
                  className="input-base py-2 pl-9"
                />{(() => {
                  const results = (search.data as { data?: { id: string; type: string; label: string; subtitle: string }[] } | undefined)?.data;
                  return search.isSuccess && results && results.length > 0 ? (
                    <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-lg dark:border-slate-700 dark:bg-slate-900">
                      {results.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            navigate(`/admin/${r.type === 'jobcard' ? 'job-cards' : r.type === 'customer' ? 'customers' : r.type === 'vehicle' ? 'vehicles' : r.type === 'invoice' ? 'invoices' : r.type === 'part' ? 'inventory' : 'bookings'}/${r.id}`);
                            setQ('');
                          }}
                          className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.label}</span>
                          <span className="text-xs text-slate-400">{r.subtitle}</span>
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {user && (
              <>
                {config.base === '/account' && <NotificationBell className="hidden sm:block" />}
                <ThemeToggle />
              </>
            )}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 hover:border-brand-400 dark:border-slate-700"
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {isStaff && (
                        <NavLink to={config.base === '/admin' ? '/account' : '/admin'} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}>
                          <ShieldCheck className="h-4 w-4" />
                          {config.base === '/admin' ? 'Customer Portal' : 'Admin Panel'}
                        </NavLink>
                      )}
                      <NavLink to="/account/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Bell className="h-4 w-4" /> Notifications
                      </NavLink>
                      <NavLink to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Settings className="h-4 w-4" /> Website
                      </NavLink>
                      <button onClick={() => void doLogout()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export const customerNav: NavItem[] = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/vehicles', label: 'My Vehicles', icon: Car },
  { to: '/account/book', label: 'Book Service', icon: CalendarCheck },
  { to: '/account/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/account/service', label: 'Active Service', icon: Wrench },
  { to: '/account/history', label: 'Service History', icon: FileText },
  { to: '/account/invoices', label: 'Invoices & Payments', icon: Receipt },
  { to: '/account/reminders', label: 'Reminders', icon: Bell },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/profile', label: 'Profile & Settings', icon: Settings },
];

export const adminNav: NavItem[] = [
  // At a glance
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  // Today's work
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/job-cards', label: 'Job Cards', icon: Wrench },
  // During service
  { to: '/admin/inspections', label: 'Inspections', icon: ClipboardX },
  { to: '/admin/estimates', label: 'Estimates', icon: Percent },
  // Billing
  { to: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  // Resources
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  // Stock
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/admin/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  // Insights
  { to: '/admin/reports', label: 'Reports', icon: LineChart },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  // Admin
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];