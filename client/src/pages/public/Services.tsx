import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Clock, ArrowRight, Tag } from 'lucide-react';
import { useServices } from '../../api/hooks';
import { Reveal, SectionLabel } from '../../components/marketing';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Feedback';
import { formatCurrency } from '../../lib/utils';
import { SERVICE_CATEGORIES } from '../../constants';

export default function Services() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading } = useServices({ category: category || undefined });
  const services = (data ?? []).filter((s) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(term);
  });

  return (
    <>
      <Helmet>
        <title>Services & Pricing</title>
        <meta name="description" content="Browse Smart AutoCare services — periodic service, brakes, AC, EV care, detailing, tyres and fleet maintenance." />
      </Helmet>
      <section className="container-page py-14">
        <Reveal className="max-w-3xl">
          <SectionLabel>Services</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Every service, priced upfront
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Transparent rates with no hidden parts. Pick a category or search for exactly what your vehicle needs.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services…"
              className="input-base pl-9"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base sm:w-56">
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Reveal key={s._id}>
                <Link to={`/services/${s._id}`} className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-card-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
                      <Tag className="h-6 w-6" />
                    </div>
                    {s.isPopular && (
                      <span className="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.description}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{s.category}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(s.basePrice)}</span>
                      <p className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" /> ~{s.estimatedHours}h</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all dark:text-brand-400">
                      View <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
        {!isLoading && services.length === 0 && (
          <Card className="mt-8 py-12 text-center text-slate-400">No services match your search.</Card>
        )}
      </section>
    </>
  );
}