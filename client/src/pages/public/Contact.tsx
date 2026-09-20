import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';
import { useToast } from '../../components/ui/Toast';

const contact = {
  phone: '1800 123 4567',
  email: 'care@smartautocare.com',
  address: 'Smart AutoCare, 12 Auto Park Plaza, MG Road, Bengaluru 560001',
  hours: 'Mon–Sat 9:00–19:00, Sun closed',
};

export default function Contact() {
  const { success } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    success('Message received! Our team will reach out within 2 hours.');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us</title>
        <meta name="description" content="Reach Smart AutoCare — support, sales, fleet partnerships and workshop locations." />
      </Helmet>
      <section className="container-page py-14">
        <Reveal className="max-w-3xl">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            We answer fast
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Booking, billing, fleet or partnerships — drop us a line and a real human replies within 2 working hours.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            {[
              { icon: Phone, label: 'Call us', value: contact.phone, sub: 'Mon–Sat, 9am–7pm' },
              { icon: Mail, label: 'Email', value: contact.email, sub: 'Replies within 2 hours' },
              { icon: MapPin, label: 'Head office', value: contact.address, sub: 'Workshops in 12 cities' },
              { icon: Clock, label: 'Workshop hours', value: contact.hours, sub: 'Doorstep pickup six days a week' },
            ].map((c) => (
              <div key={c.label} className="card flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{c.value}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <Reveal>
            <form onSubmit={submit} className="card p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-base">Your name</label>
                  <input className="input-base" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" />
                </div>
                <div>
                  <label className="label-base">Email</label>
                  <input type="email" required className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="label-base">Phone</label>
                  <input className="input-base" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXXXXXXX" />
                </div>
                <div>
                  <label className="label-base">Topic</label>
                  <select className="input-base">
                    <option>Booking support</option>
                    <option>Billing & invoices</option>
                    <option>Fleet partnership</option>
                    <option>Something else</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="label-base">Message</label>
                <textarea required rows={5} className="input-base" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you need…" />
              </div>
              <button type="submit" className="btn-primary mt-6 px-6 py-3">
                Send message <Send className="h-4 w-4" />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}