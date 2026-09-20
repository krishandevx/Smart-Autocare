import { Helmet } from 'react-helmet-async';
import { BookingFlow } from '../../components/BookingFlow';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal, SectionLabel } from '../../components/marketing';
import { useAuth } from '../../contexts/AuthContext';

export default function BookService() {
  const { user } = useAuth();
  return (
    <>
      <Helmet>
        <title>Book a Service</title>
        <meta name="description" content="Book doorstep vehicle service with Smart AutoCare in under a minute." />
      </Helmet>
      <section className="container-page py-10">
        <Reveal className="mx-auto max-w-3xl">
          <SectionLabel>Book service</SectionLabel>
          <PageHeader
            title={`Welcome${user ? `, ${user.name.split(' ')[0]}` : ''}`}
            subtitle="Tell us about your vehicle and pick a slot — we handle the rest."
          />
          <BookingFlow />
        </Reveal>
      </section>
    </>
  );
}