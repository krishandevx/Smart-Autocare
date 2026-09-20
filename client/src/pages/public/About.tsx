import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, HeartHandshake, Leaf, Zap, Target, Eye } from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';

const values = [
  { icon: ShieldCheck, title: 'Radical transparency', desc: 'Every estimate itemised, every part shown, every price locked before we start.' },
  { icon: HeartHandshake, title: 'Certified, vetted talent', desc: 'Mechanics are background-checked, trained and rated after every single job.' },
  { icon: Zap, title: 'EV-native, future-ready', desc: 'Live battery health scans and certified EV technicians — not an afterthought.' },
  { icon: Leaf, title: 'Sustainable operations', desc: 'Recycled parts, waterless washes and route-optimised doorstep pickups.' },
];

const milestones = [
  { year: '1', title: 'One platform', desc: 'Every vehicle — car, bike, truck, bus, EV or fleet — booked, estimated and tracked in one workspace.' },
  { year: '2', title: 'Two guarantees', desc: 'You approve the price before work starts, and you follow every step live from your phone.' },
  { year: '3', title: 'Three ways to care', desc: 'Walk-in workshop visits, doorstep pickup & delivery, and scheduled reminders so nothing slips.' },
  { year: '4', title: 'Four checks, certified', desc: 'Certified technicians, honest estimates, verified parts and a clear invoice after every job.' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us</title>
        <meta name="description" content="Smart AutoCare's story — transparent, certified, tech-first vehicle care for every vehicle type." />
      </Helmet>
      <section className="container-page py-14 lg:py-20">
        <Reveal className="max-w-3xl">
          <SectionLabel>Our story</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            We believed vehicle service could be <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">honest.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Smart AutoCare started from a simple frustration: nobody could tell us exactly what was wrong with our car,
            or exactly what it would cost to fix. We rebuilt the workshop around that question — with digital health
            scans, locked estimates and live updates on every job.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Today we're a tech-first service network for cars, bikes, trucks, buses, EVs and commercial fleets. The
            conviction hasn't changed: <strong className="text-slate-900 dark:text-white">you should never approve a charge you don't understand.</strong>
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.07}>
              <div className="card h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <Reveal className="mb-8 text-center">
            <SectionLabel>Timeline</SectionLabel>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">The road so far</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-4">
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.08}>
                <div className="relative border-l-2 border-brand-200 pl-5 dark:border-brand-500/30">
                  <span className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-500/20" />
                  <p className="font-display text-xl font-extrabold text-brand-600 dark:text-brand-400">{m.year}</p>
                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{m.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-20">
          <div className="card grid gap-8 p-8 md:grid-cols-2">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Our mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Make owning any vehicle — electric or diesel, personal or fleet — effortless by pairing certified
                human expertise with honest, real-time technology.
              </p>
            </div>
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Our vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                A world where no driver is ever held hostage by guesswork — where every service has a transparent
                price, a live timeline and a guaranteed outcome.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-8 py-12 text-center shadow-card-lg">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Make your next service this easy</h2>
            <Link to="/register" className="btn mt-6 bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-base">
              Create your account
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}