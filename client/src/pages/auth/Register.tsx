import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, KeyRound, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import { Logo } from '../../components/ui/Logo';
import { Field, Input } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { ThemeToggle } from '../../components/AppShell';
import { useLocation } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ name, email, password, phone, companyName: companyName || undefined });
      toast.success('Account created! Welcome to Smart AutoCare.');
      navigate(user.role === 'customer' ? from || '/account' : '/admin');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-950">
      <Helmet>
        <title>Create account</title>
      </Helmet>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="flex items-center justify-between">
          <Logo dark />
          <ThemeToggle className="dark:text-slate-200" />
        </div>
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start managing your vehicle care in seconds.</p>

          <form onSubmit={submit} className="mt-6 space-y-0">
            <Field label="Full name" required>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input required className="pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="email" required className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
              </Field>
              <Field label="Phone" required>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input required className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXXXXXXX" />
                </div>
              </Field>
            </div>
            <Field label="Password" required hint="At least 8 characters">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type={show ? 'text' : 'password'} required className="pl-9 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Company / business (optional)" hint="Fleet or business accounts get access to fleet features.">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ACME Logistics" />
            </Field>
            <Button type="submit" loading={loading} className="mt-2 w-full py-3">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}