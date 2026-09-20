import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/vehicle-types', label: 'Vehicle Types' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function PublicHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {user ? (
            <Link
              to={user.role === 'customer' ? '/account' : '/admin'}
              className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 hover:border-brand-400 dark:border-slate-700"
            >
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Book Service
              </Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 lg:hidden dark:border-slate-800"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <ThemeToggle />
                {user ? (
                  <Link to={user.role === 'customer' ? '/account' : '/admin'} onClick={() => setOpen(false)} className="btn-primary flex-1 text-center">
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center">
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center">
                      Book Service
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Smarter vehicle care, built around you. Transparent estimates, certified mechanics, doorstep service,
              and live updates for every vehicle in your life.
            </p>
          </div>
          {[
            {
              title: 'Platform',
              links: [
                { to: '/services', label: 'Services' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/book', label: 'Book a Service' },
              ],
            },
            {
              title: 'Company',
              links: [
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/faq', label: 'FAQ' },
                { to: '/vehicle-types', label: 'Vehicle Types' },
              ],
            },
            {
              title: 'Contact',
              links: [
                { to: '/contact', label: '1800-123-4567' },
                { to: '/contact', label: 'care@smartautocare.com' },
                { to: '/contact', label: 'Bangalore, India' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Smart AutoCare. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-brand-600">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}