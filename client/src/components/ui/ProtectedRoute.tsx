import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from './Feedback';
import type { Role } from '../../types';

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader label="Loading your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    const destination = user.role === 'customer' ? '/account' : '/admin';
    return <Navigate to={destination} replace />;
  }
  return <>{children}</>;
}

export function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader label="Loading your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role === 'customer') return <Navigate to="/account" replace />;
  return <>{children}</>;
}