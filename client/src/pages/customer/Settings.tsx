import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Form';
import { Field, Input } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../lib/utils';
import { put } from '../../api/client';

export default function CustomerSettings() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [notify, setNotify] = useState<boolean>(user?.preferences?.notifications ?? true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const savePrefs = async () => {
    try {
      await updateProfile({ preferences: { ...(user?.preferences ?? {}), notifications: notify } });
      toast.success('Preferences saved');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await put('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed');
      setOldPassword('');
      setNewPassword('');
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
      <PageHeader title="Settings" subtitle="Appearance, notifications and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how Smart AutoCare looks.</CardDescription>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={
                    theme === t
                      ? 'rounded-xl border-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm font-semibold capitalize text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium capitalize text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control what we send you.</CardDescription>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Booking & service updates</p>
                <p className="text-xs text-slate-400">In-app notifications for estimates, approvals and job progress.</p>
              </div>
              <Toggle checked={notify} onChange={(v) => { setNotify(v); setTimeout(() => void savePrefs(), 0); }} />
            </div>
          </Card>
        </div>

        <Card>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password. Use at least 8 characters.</CardDescription>
          <div className="mt-4">
            <Field label="Current password" required>
              <Input type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </Field>
            <Field label="New password" required>
              <Input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <Button loading={busy} onClick={() => void changePassword()}>Update password</Button>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
            <CardTitle>Session</CardTitle>
            <p className="mt-1 text-sm text-slate-400">Log out of this device.</p>
            <button
              className="btn-secondary mt-4 text-red-600 dark:text-red-400"
              onClick={() => { void logout(); window.location.href = '/'; }}
            >
              Log out
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}