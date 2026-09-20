import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Car,
  Bike,
  Truck,
  Bus,
  Zap,
  Sparkles,
  ShieldCheck,
  Clock,
  Wallet,
  CloudLightning,
  Wrench,
  CalendarCheck,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';
import { APP_TAGLINE } from '../../constants';
import { StatusBadge } from '../../components/ui/Badge';

const vehicleTypes = [
  { icon: Car, title: 'Cars', desc: 'Hatchbacks to luxury SUVs', to: '/vehicle-types?type=car' },
  { icon: Bike, title: 'Two-Wheelers', desc: 'Bikes & scooters', to: '/vehicle-types?type=motorcycle' },
  { icon: Truck, title: 'Trucks & LCVs', desc: 'Commercial hauling', to: '/vehicle-types?type=truck' },
  { icon: Bus, title: 'Buses', desc: 'City, school & tourism', to: '/vehicle-types?type=bus' },
  { icon: Zap, title: 'EV Care', desc: 'Electric cars & e-bikes', to: '/vehicle-types?type=ev' },
  { icon: PackageCheck, title: 'Fleet', desc: 'Delivery & logistics', to: '/vehicle-types?type=commercial' },
];

const steps = [
  {
    icon: CalendarCheck,
    title: 'Book in 60 seconds',
    desc: 'Pick your vehicle, choose a service, and slot a time. Doorstep pickup is available.',
  },
  {
    icon: Wrench,
    title: 'Certified mechanics',
    desc: 'A certified specialist runs a health scan and sends you a transparent estimate.',
  },
  {
    icon: CloudLightning,
    title: 'Live updates',
    desc: 'Follow your service in real time. Approve work only when the price is clear.',
  },
];

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Smart AutoCare — Smarter Vehicle Care, Built Around You</title>
        <meta name="description" content="Book doorstep car, bike, EV and commercial vehicle service with transparent estimates and live updates." />
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
        </div>
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <SectionLabel>
                <Sparkles className="h-3.5 w-3.5" /> India's smartest vehicle service
              </SectionLabel>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Smarter Vehicle Care, <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">Built Around You.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {APP_TAGLINE} Car, bike, EV or commercial fleet — book doorstep service, get transparent estimates, and
                follow every step live with certified mechanics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/book" className="btn-primary px-6 py-3 text-base">
                  Book a Service <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/services" className="btn-secondary px-6 py-3 text-base">
                  Explore Services
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="mb-24 grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, label: 'Certified mechanics', tone: 'from-brand-500 to-brand-600' },
                { icon: Wallet, label: 'Upfront pricing', tone: 'from-emerald-500 to-emerald-600' },
                { icon: Clock, label: 'On-time pickup', tone: 'from-amber-500 to-amber-600' },
                { icon: Zap, label: 'EV-native', tone: 'from-violet-500 to-violet-600' },
              ].map((c) => (
                <div key={c.label} className="card p-5">
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-md`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.label}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Included in every job</p>
                </div>
              ))}
            </div>
            <div className="card absolute -bottom-6 left-1/2 flex w-[92%] -translate-x-1/2 flex-wrap items-center justify-center gap-x-6 gap-y-2 p-4 text-center shadow-card-lg">
              {[
                { icon: ShieldCheck, label: 'Certified mechanics' },
                { icon: Wallet, label: 'Upfront pricing' },
                { icon: Clock, label: 'Doorstep pickup' },
              ].map((t) => (
                <span key={t.label} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <t.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" /> {t.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <Reveal className="mb-10 text-center">
          <SectionLabel>Every vehicle, one platform</SectionLabel>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From hatchbacks to electric fleets
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            Specialist care for every wheel you own — manufactured to the vehicle type, not a one-size-fits-all garage.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {vehicleTypes.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <Link
                to={v.to}
                className="card group flex h-full flex-col items-center gap-3 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-card-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
                  <v.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{v.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{v.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900 lg:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Service without the stress
              </h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400">
                We stripped every decision point, surprise charge, and phone call from vehicle maintenance.
              </p>
            </Reveal>
            <div className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/20">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <Link to="/how-it-works" className="btn-outline mt-8 px-6 py-3">
                See the full journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="card p-6 shadow-card-lg">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Example · your job card in the app</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status="Service In Progress" />
                    <span className="text-xs text-slate-400">Live status per vehicle</span>
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="space-y-3">
                {[
                  { step: 'Vehicle received', time: '09:15', done: true },
                  { step: 'Health scan completed', time: '09:40', done: true },
                  { step: 'Estimate approved by you', time: '10:02', done: true },
                  { step: 'Brake pads replacement', time: 'In progress', done: false },
                  { step: 'Quality check & delivery', time: 'Pending', done: false },
                ].map((s2, i) => (
                  <div key={s2.step} className="flex items-center gap-3">
                    <div
                      className={
                        s2.done
                          ? 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white'
                          : 'flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700'
                      }
                    >
                      {s2.done && <CheckCircle2 className="h-4 w-4" />}
                      {!s2.done && i === 3 && <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />}
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <p className={s2.done ? 'text-sm text-slate-700 dark:text-slate-200' : 'text-sm font-semibold text-slate-900 dark:text-white'}>{s2.step}</p>
                      <span className="text-xs text-slate-400">{s2.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 px-8 py-14 text-center shadow-card-lg sm:px-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Ready for smarter car care?</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Book your first service in under a minute. Transparent estimates, certified mechanics, doorstep pickup.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/book" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-base">
                Book Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn border border-white/40 text-white hover:bg-white/10 px-6 py-3 text-base">
                Create Account
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}