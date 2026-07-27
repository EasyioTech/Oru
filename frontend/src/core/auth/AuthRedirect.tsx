import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthRedirect() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!user) setHasRedirected(false);
  }, [user]);

  // Redirect sauth subdomain root to sauth path
  useEffect(() => {
    const subdomain = import.meta.env.VITE_SAUTH_SUBDOMAIN;
    if (!subdomain || typeof subdomain !== 'string') return;
    const hostname = window.location.hostname;
    const pathname = location.pathname || '/';
    const sauthPath = import.meta.env.VITE_SAUTH_PATH || '/sauth';
    const matchesSubdomain = hostname === subdomain || hostname.startsWith(subdomain + '.');
    if (matchesSubdomain && pathname === '/') {
      navigate(sauthPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!user || !userRole || loading || hasRedirected || location.pathname !== '/auth') return;

    setHasRedirected(true);
    if (userRole === 'super_admin') {
      navigate('/system', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, userRole, loading, hasRedirected, location.pathname, navigate]);

  return null;
}
