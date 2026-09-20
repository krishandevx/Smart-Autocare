import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, CheckCircle2, ArrowLeft, Zap } from 'lucide-react';
import { useServices } from '../../api/hooks';
import { PageLoader } from '../../components/ui/Feedback';
import { formatCurrency } from '../../lib/utils';

export default function ServiceDetails() {
  const { id } = useParams();
  const { data, isLoading } = useServices();
  const service = (data ?? []).find((s) => s._id === id);

  if (isLoading) return <PageLoader />;
  if (!service) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <Link to="/services" className="btn-outline mt-6">Browse all services</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.name}</title>
        <meta name="description" content={service.description} />
      </Helmet>
      <div className="container-page py-12">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> All services
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Zap className="h-3.5 w-3.5" /> {service.category}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{service.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{service.description}</p>

            <h2 className="mt-10 font-display text-xl font-bold text-slate-900 dark:text-white">What's included</h2>
            <ul className="mt-4 space-y-2.5">
              {service.includes?.map((inc) => (
                <li key={inc} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {inc}
                </li>
              ))}
            </ul>

            {service.vehicleTypes?.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-xl font-bold text-slate-900 dark:text-white">Supported vehicles</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.vehicleTypes.map((v) => (
                    <span key={v} className="badge bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                      {v}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="card sticky top-20 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Starting at</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(service.basePrice)}</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" /> Takes about {service.estimatedHours}h
              </p>
              <p className="mt-1 text-xs text-slate-400">Doorstep pickup available. No hidden charges.</p>
              <Link to="/book" className="btn-primary mt-6 w-full px-6 py-3">
                Book this service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}