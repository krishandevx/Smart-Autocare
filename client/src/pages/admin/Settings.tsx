import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save } from 'lucide-react';
import { useGetSettings, useUpdateSettings } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription, SectionHeading } from '../../components/ui/Card';
import { Field, Input, Select, Toggle } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage, cn } from '../../lib/utils';
import type { BusinessSettings } from '../../types';

const CURRENCIES = ['₹', '$', '€', '£', 'AED', 'SAR'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminSettings() {
  const { data, isLoading } = useGetSettings();
  const updateS = useUpdateSettings();
  const toast = useToast();
  const [form, setForm] = useState<BusinessSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data && !form) {
      setForm({
        ...data,
        businessHours: { ...data.businessHours, days: Array.isArray(data.businessHours?.days) ? data.businessHours.days : [1, 2, 3, 4, 5, 6] },
        notificationSettings: data.notificationSettings ?? { email: true, sms: true, inApp: true },
      });
    }
  }, [data]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const f = form;

  if (isLoading) return <PageLoader />;
  if (!f) return null;

  const set = (patch: Partial<BusinessSettings>) => setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  const setBH = (patch: Partial<BusinessSettings['businessHours']>) => setForm((prev) => (prev ? { ...prev, businessHours: { ...prev.businessHours, ...patch } } : prev));
  const setNS = (patch: Partial<BusinessSettings['notificationSettings']>) => setForm((prev) => (prev ? { ...prev, notificationSettings: { ...prev.notificationSettings, ...patch } } : prev));
  const toggleDay = (d: number) => setBH({ days: f.businessHours.days.includes(d) ? f.businessHours.days.filter((x) => x !== d) : [...f.businessHours.days, d].sort() });

  const save = async () => {
    setBusy(true);
    try {
      await updateS.mutateAsync({
        companyName: f.companyName,
        tagline: f.tagline,
        email: f.email,
        phone: f.phone,
        address: f.address,
        gstin: f.gstin,
        invoicePrefix: f.invoicePrefix,
        bookingPrefix: f.bookingPrefix,
        jobCardPrefix: f.jobCardPrefix,
        estimatePrefix: f.estimatePrefix,
        taxRate: Number(f.taxRate),
        currency: f.currency,
        pickupFee: Number(f.pickupFee ?? 0),
        businessHours: {
          open: f.businessHours.open,
          close: f.businessHours.close,
          days: f.businessHours.days,
          slotDuration: Number(f.businessHours.slotDuration),
        },
        notificationSettings: f.notificationSettings,
      });
      toast.success('Settings saved');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <PageHeader
        title="Settings"
        subtitle="Workshop identity, prefixes, taxes and operating hours"
        actions={<Button loading={busy} onClick={() => void save()}><Save className="h-4 w-4" /> Save changes</Button>}
      />

      <div className="space-y-6">
        <SectionHeading title="Business profile" subtitle="Shown on invoices, estimates and the public site" />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required>
              <Input value={f.companyName} onChange={(e) => set({ companyName: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <Input value={f.tagline ?? ''} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={f.address} onChange={(e) => set({ address: e.target.value })} />
            </Field>
            <Field label="GSTIN">
              <Input value={f.gstin ?? ''} onChange={(e) => set({ gstin: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Currency">
              <Select value={f.currency} onChange={(e) => set({ currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <SectionHeading title="Document numbering & tax" subtitle="Prefixes used for generated document IDs" />
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Invoice prefix">
              <Input value={f.invoicePrefix} onChange={(e) => set({ invoicePrefix: e.target.value })} />
            </Field>
            <Field label="Booking prefix">
              <Input value={f.bookingPrefix} onChange={(e) => set({ bookingPrefix: e.target.value })} />
            </Field>
            <Field label="Job card prefix">
              <Input value={f.jobCardPrefix} onChange={(e) => set({ jobCardPrefix: e.target.value })} />
            </Field>
            <Field label="Estimate prefix">
              <Input value={f.estimatePrefix} onChange={(e) => set({ estimatePrefix: e.target.value })} />
            </Field>
            <Field label="Default tax rate (%)">
              <Input type="number" min={0} max={40} value={f.taxRate} onChange={(e) => set({ taxRate: Number(e.target.value) })} />
            </Field>
            <Field label="Pickup & delivery fee">
              <Input type="number" min={0} value={f.pickupFee ?? 0} onChange={(e) => set({ pickupFee: Number(e.target.value) })} />
            </Field>
          </div>
        </Card>

        <SectionHeading title="Operating hours" subtitle="Used by booking slots and appointment validation" />
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Opens at">
              <Input value={f.businessHours.open} onChange={(e) => setBH({ open: e.target.value })} />
            </Field>
            <Field label="Closes at">
              <Input value={f.businessHours.close} onChange={(e) => setBH({ close: e.target.value })} />
            </Field>
            <Field label="Slot duration (minutes)">
              <Input type="number" min={15} step={15} value={f.businessHours.slotDuration} onChange={(e) => setBH({ slotDuration: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Working days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold',
                    f.businessHours.days.includes(i)
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        <SectionHeading title="Notifications" subtitle="Channels used to reach customers for booking & reminders" />
        <Card>
          <CardTitle>Channels</CardTitle>
          <CardDescription>Only channels your business actually uses will send attempts</CardDescription>
          <div className="mt-4 space-y-4">
            <Toggle checked={f.notificationSettings.email} onChange={(v) => setNS({ email: v })} label="Email notifications" />
            <Toggle checked={f.notificationSettings.sms} onChange={(v) => setNS({ sms: v })} label="SMS notifications" />
            <Toggle checked={f.notificationSettings.inApp} onChange={(v) => setNS({ inApp: v })} label="In-app notifications" />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button loading={busy} onClick={() => void save()}><Save className="h-4 w-4" /> Save changes</Button>
        </div>
      </div>
    </>
  );
}