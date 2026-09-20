import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Reveal, SectionLabel } from '../../components/marketing';

const faqs = [
  { question: 'Which vehicles do you service?', answer: 'Cars, motorcycles, trucks, buses, EVs (both 4-wheeler and 2-wheeler), and commercial fleets. Every vehicle type is serviced by specialists trained for it.' },
  { question: 'How do I pay?', answer: 'Cash, cards, UPI, bank transfer, cheques and wallets. Pay online against your invoice in the portal, or at delivery — whichever you prefer.' },
  { question: 'Is service under warranty safe?', answer: 'Yes. We use manufacturer-spec parts and document everything. A service at Smart AutoCare will not void your vehicle warranty.' },
  { question: 'Do you handle insurance claims?', answer: 'We assist with cashless insurance claims for repairs on approved policies and keep full documentation for your insurer.' },
  { question: 'What happens if you find extra damage?', answer: 'We stop, send an itemised estimate, and wait for your approval before touching anything. We never start unapproved work.' },
  { question: 'Can I track my service live?', answer: 'Yes — the portal and mobile app show real-time status of every step: received, scanned, estimated, approved, in progress, and ready.' },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Helmet>
        <title>FAQ</title>
        <meta name="description" content="Frequently asked questions about Smart AutoCare — booking, estimates, payments, EVs, insurance and warranties." />
      </Helmet>
      <section className="container-page mx-auto max-w-3xl py-14">
        <Reveal className="text-center">
          <SectionLabel>FAQ</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Everything you'd want to know before trusting us with your vehicle.
          </p>
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-display font-bold text-slate-900 dark:text-white">{f.question}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.answer}</p>}
            </div>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Still have questions?</p>
          <Link to="/contact" className="btn-outline mt-4 px-6">
            Talk to us
          </Link>
        </Reveal>
      </section>
    </>
  );
}