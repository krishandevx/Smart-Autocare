import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page not found</title>
      </Helmet>
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-5xl font-extrabold text-slate-900 dark:text-white">404</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">This road doesn't exist yet.</p>
        <div className="mt-8 flex gap-3">
          <Link to="/" className="btn-primary px-6">Back to home</Link>
          <Link to="/book" className="btn-secondary px-6">Book a service</Link>
        </div>
      </div>
    </>
  );
}