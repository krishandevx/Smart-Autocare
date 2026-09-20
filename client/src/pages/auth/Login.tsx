import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import { Logo } from '../../components/ui/Logo';
import { Field, Input } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { ThemeToggle } from '../../components/AppShell';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'customer' ? from || '/account' : (from && from.startsWith('/admin')) ? from : '/account');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Helmet>
        <title>Log in</title>
      </Helmet>
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 lg:flex">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative max-w-md">
          <Logo dark />
          <h2 className="mt-8 font-display text-4xl font-extrabold leading-tight text-white">
            Your vehicles, one dashboard.
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Book services, approve estimates, track jobs live and manage every invoice — for all your vehicles, in one place.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-brand-100">
            <li>• Doorstep pickup on every plan</li>
            <li>• Estimates locked until you approve</li>
            <li>• Live updates on every job</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>
          <h1 className="mt-8 font-display text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to manage your service.</p>

          <form onSubmit={submit} className="mt-8">
            <Field label="Email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" required className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type={show ? 'text' : 'password'} required className="pl-9 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" loading={loading} className="mt-2 w-full py-3">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New to Smart AutoCare?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}