import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarCheck, Scan, FileCheck, Wrench, Camera, Home, BadgeCheck, ArrowRight } from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';

const phases = [
  { step: '01', icon: CalendarCheck, title: 'Book & schedule', desc: 'Choose your vehicle and service online. Pick a time slot, or request doorstep pickup. Confirmation takes seconds.' },
  { step: '02', icon: Scan, title: 'Health scan', desc: 'A certified technician runs a digital multipoint health scan and captures photos. You get a health score out of 100.' },
  { step: '03', icon: FileCheck, title: 'Locked estimate', desc: 'Every recommended repair is itemised with parts and labour costs. Nothing starts until you approve the estimate.' },
  { step: '04', icon: Wrench, title: 'Service in progress', desc: 'Your approved work happens with live status updates — you can see exactly where the job is at any time.' },
  { step: '05', icon: Camera, title: 'Photo proof', desc: 'Completed work is documented with before/after photos on the invoice. No more "trust me" repairs.' },
  { step: '06', icon: Home, title: 'Doorstep delivery', desc: 'Your vehicle is returned clean and tested, with a digital service record and warranty saved to your account.' },
];

const guarantees = [
  { icon: BadgeCheck, title: 'Warranty on work', desc: '12 months or 12,000 km workmanship warranty on approved repairs.' },
  { icon: FileCheck, title: 'Price-lock promise', desc: 'Once you approve an estimate, it can never change mid-job.' },
  { icon: CalendarCheck, title: 'On-time delivery', desc: 'If we\'re late due to our mistake, the next service is on us.' },
];

export default function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How It Works</title>
        <meta name="description" content="The Smart AutoCare service journey — booking, digital health scan, locked estimate, live updates and doorstep delivery." />
      </Helmet>
      <section className="container-page py-14">
        <Reveal className="max-w-3xl">
          <SectionLabel>How it works</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your vehicle's journey, in six honest steps
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            No surprises, no guesswork, no unapproved work. Here's exactly what happens from booking to delivery.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.06}>
              <div className="card relative h-full p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-slate-100 dark:text-slate-800">{p.step}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/20">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="card p-8">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Backed by three promises</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {guarantees.map((g) => (
                <div key={g.title}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <g.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{g.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{g.desc}</p>
                </div>
              ))}
            </div>
            <Link to="/book" className="btn-primary mt-8 px-6 py-3">
              Start your first service <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}