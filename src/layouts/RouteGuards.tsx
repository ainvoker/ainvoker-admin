import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullScreenLoader } from '../components/auth/AuthUI';
import AccessDenied from '../pages/AccessDenied';
import BootstrapFailed from '../pages/BootstrapFailed';

/** Login / signup: signed-in users are sent on to the console (or the verify step). */
export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (user && !isLoading) {
    return <Navigate to={user.emailVerified ? '/' : '/verify-email'} replace />;
  }

  return <Outlet />;
}

/** Email verification: only for signed-in, unverified users. */
export function VerifyEmailRoute() {
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) return <Navigate to="/login" replace />;
  if (user && !isLoading && user.emailVerified) return <Navigate to="/" replace />;

  return <Outlet />;
}

/** Console: requires a verified session whose bootstrap marks the user as a platform admin. */
export function PlatformAdminRoute() {
  const { user, isLoading, appBootstrap, bootstrapError, isPlatformAdmin } = useAuth();

  if (isLoading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  if (!appBootstrap) {
    return bootstrapError ? <BootstrapFailed message={bootstrapError} /> : <FullScreenLoader />;
  }
  if (!isPlatformAdmin) return <AccessDenied />;

  return <Outlet />;
}
