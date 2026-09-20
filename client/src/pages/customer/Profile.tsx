import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { getErrorMessage } from '../../lib/utils';

export default function CustomerProfile() {
  const { user, updateProfile, refresh } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [companyName, setCompanyName] = useState(user?.companyName ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({ name, phone, address, companyName: companyName || undefined });
      toast.success('Profile updated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <PageHeader title="Profile" subtitle="Your personal details across Smart AutoCare." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.name} src={user?.avatar} size="xl" />
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="mt-1 text-xs text-slate-400">Member since {user ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : ''}</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle>Edit details</CardTitle>
          <CardDescription>These details appear on invoices and service records.</CardDescription>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Phone" required>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email" hint="Email cannot be changed here.">
              <Input value={user?.email ?? ''} disabled />
            </Field>
            <Field label="Company / business">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="For fleet accounts" />
            </Field>
          </div>
          <Field label="Address" className="sm:col-span-2 mt-4">
            <textarea className="input-base" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address for delivery and pickup" rows={3} />
          </Field>
          <div className="flex justify-end">
            <Button loading={busy} onClick={() => void save()}>Save changes</Button>
          </div>
        </Card>
      </div>
    </>
  );
}