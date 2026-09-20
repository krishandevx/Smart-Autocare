import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Bike, Truck, Bus, Zap, Radar, PackageCheck, Shovel, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Reveal, SectionLabel } from '../../components/marketing';

const vehicleTabs = [
  { id: 'car', label: 'Cars' },
  { id: 'motorcycle', label: 'Two-Wheelers' },
  { id: 'truck', label: 'Trucks & LCVs' },
  { id: 'bus', label: 'Buses' },
  { id: 'ev', label: 'EV Cars' },
  { id: 'ev-2wheeler', label: 'EV 2-Wheelers' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'other', label: 'Other' },
];

const typeDetails: Record<string, { icon: typeof Car; blurb: string; specialties: string[] }> = {
  car: { icon: Car, blurb: 'Hatches, sedans, SUVs and MPVs get comprehensive multipoint checks from certified car technicians.', specialties: ['Multipoint health scans', 'Engine & transmission care', 'Detailing & ceramic coating'] },
  motorcycle: { icon: Bike, blurb: 'Everything for bikes and scooters — from oil changes to full-engine overhauls and valve adjustments.', specialties: ['Chain & sprocket care', 'Carburettor & FI servicing', 'Brake & clutch rebuilds'] },
  truck: { icon: Truck, blurb: 'LCVs, trucks and trailers serviced with fleet-grade turnaround and downtime minimisation.', specialties: ['Scheduled fleet maintenance', 'BS-VI emission care', 'Multiplex braking systems'] },
  bus: { icon: Bus, blurb: 'City, school and tourist buses maintained to PUC and operator compliance standards.', specialties: ['Brake & steering safety', 'Air suspension systems', 'Compliance documentation'] },
  ev: { icon: Zap, blurb: 'Certified high-voltage EV technicians perform live battery health scans — never a converted petrol garage job.', specialties: ['Battery health diagnostics', 'High-voltage system care', 'Charging port maintenance'] },
  'ev-2wheeler': { icon: Zap, blurb: 'Electric scooters and bikes get battery-specific care, motor diagnostics and range checks.', specialties: ['BMS calibration', 'Motor & controller checks', 'Regen brake care'] },
  commercial: { icon: PackageCheck, blurb: 'Delivery vans, logistics and ride-hailing fleets managed through a single administration dashboard with SLAs.', specialties: ['Planned preventive maintenance', '24/7 breakdown support', 'Driver handoff logs'] },
  other: { icon: Shovel, blurb: 'Tractors, three-wheelers and specialised vehicles handled by the right partner workshop near you.', specialties: ['Specialist routing', 'Spare availability checks', 'Honest estimates'] },
};

export default function VehicleTypes() {
  const [params] = useSearchParams();
  const active = params.get('type') ?? 'car';
  const details = typeDetails[active] ?? typeDetails.car;

  return (
    <>
      <Helmet>
        <title>Vehicle Types We Service</title>
        <meta name="description" content="Smart AutoCare services cars, motorcycles, trucks, buses, electric vehicles and commercial fleets with certified specialists." />
      </Helmet>
      <section className="container-page py-14">
        <Reveal className="max-w-3xl">
          <SectionLabel>Vehicle types</SectionLabel>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Specialist care for every wheel
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Choose your vehicle type to see what specialist care looks like.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-3">
          {vehicleTabs.map((v) => (
            <Link
              key={v.id}
              to={`/vehicle-types?type=${v.id}`}
              className={
                active === v.id
                  ? 'rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30'
                  : 'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }
            >
              {v.label}
            </Link>
          ))}
        </div>

        <Reveal key={active} className="mt-10">
          <div className="card grid overflow-hidden lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-gradient-to-br from-brand-600 to-accent-600 p-8 lg:p-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
                <details.icon className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-extrabold text-white">{vehicleTabs.find((v) => v.id === active)?.label ?? 'Specialist care'}</h2>
              <p className="mt-3 text-lg leading-relaxed text-brand-50">{details.blurb}</p>
            </div>
            <div className="p-8 lg:p-12">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">We specialise in</h3>
              <ul className="mt-4 space-y-3">
                {details.specialties.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {s}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link to="/book" className="btn-primary px-6">Book this service</Link>
                <Link to="/services" className="btn-secondary px-6">View services</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}