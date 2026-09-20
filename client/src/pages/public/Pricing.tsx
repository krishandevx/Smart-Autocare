import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Zap, PackageCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';

const plans = [
  {
    icon: Car,
    name: 'Personal',
    tagline: 'For cars, bikes and EVs you own.',
    price: 'Free',
    per: 'forever',
    highlight: false,
    features: [
      'Online booking & free doorstep pickup',
      'Digital health score on every service',
      'Transparent locked estimates',
      'Live job updates & photos',
      'Service history & reminders',
    ],
  },
  {
    icon: PackageCheck,
    name: 'Family',
    tagline: 'Multiple vehicles, one account.',
    price: '₹499',
    per: 'year',
    highlight: true,
    features: [
      'Everything in Personal',
      'Up to 5 vehicles under one account',
      '15% off on the 3rd+ vehicle service',
      'Priority service slots',
      'Annual multi-vehicle service planner',
      'Dedicated relationship advisor',
    ],
  },
  {
    icon: Zap,
    name: 'Fleet',
    tagline: 'Delivery, logistics & ride-hailing.',
    price: 'Custom',
    per: 'per vehicle/month',
    highlight: false,
    features: [
      'Dedicated fleet dashboard',
      'Preventive maintenance schedules',
      'Guaranteed downtime SLAs',
      'Net-30 invoicing & reports',
      '24/7 roadside assistance',
      'Bulk parts & tyre management',
    ],
  },
];

const faqs = [
  { q: 'Are estimates really locked?', a: 'Yes. Once approved, the price you see is the price you pay. If we discover additional work, a new itemised estimate is sent for your approval first.' },
  { q: 'Do you offer free pickup?', a: 'Free doorstep pickup is included with Personal and higher plans within city limits. Our technicians carry the vehicle to a certified workshop and return it to your door.' },
  { q: 'How do EV services work?', a: 'Certified high-voltage EV technicians run a live battery and software health scan first. Any high-voltage work is done only after you approve an itemised estimate.' },
  { q: 'What happens if my vehicle isn\u2019t ready on time?', a: 'We hold the delivery time as a promise. If a job overruns for any reason, we notify you in real time and never charge for delays caused by us.' },
];

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing</title>
        <meta name="description" content="Smart AutoCare plans — Personal (free), Family (₹499/yr) and Fleet plans with transparent service pricing." />
      </Helmet>
      <section className="container-page py-14">
        <Reveal className="max-w-3xl">
          <SectionLabel>Pricing</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Every plan starts with free doorstep pickup and transparent, locked estimates. Upgrade for multiple
            vehicles or fleet management.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={
                  p.highlight
                    ? 'relative flex h-full flex-col rounded-3xl border-2 border-brand-600 bg-white p-8 shadow-card-lg dark:bg-slate-900'
                    : 'card flex h-full flex-col p-8'
                }
              >
                {p.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <p.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{p.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">{p.price}</span>
                  <span className="text-sm text-slate-400">/ {p.per}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/book" className={p.highlight ? 'btn-primary mt-8 w-full px-6 py-3' : 'btn-secondary mt-8 w-full px-6 py-3'}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <Reveal className="mb-8">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Pricing questions</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="card h-full p-6">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}