import { Helmet } from 'react-helmet-async';
import { BookingFlow } from '../../components/BookingFlow';
import { PageHeader } from '../../components/ui/PageHeader';

export default function BookServicePortal() {
  return (
    <>
      <Helmet>
        <title>Book a Service</title>
      </Helmet>
      <PageHeader
        title="Book a Service"
        subtitle="Choose a vehicle, pick a service and a slot that works for you."
      />
      <div className="max-w-3xl">
        <BookingFlow />
      </div>
    </>
  );
}