/**
 * Hook to check maintenance mode status
 */

import { useState, useEffect } from 'react';
import { getApiRoot } from '@/config/api';
import { useAuth } from './useAuth';

interface MaintenanceStatus {
  maintenance_mode: boolean;
  maintenance_message: string | null;
}

// Only warn once per session when backend is unreachable (avoid spam on 30s retry)
let hasWarnedBackendUnreachable = false;

export function useMaintenanceMode() {
  const { user, userRole, isSystemSuperAdmin } = useAuth();
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Super admins bypass maintenance mode check
    if (isSystemSuperAdmin || userRole === 'super_admin') {
      setMaintenanceStatus({ maintenance_mode: false, maintenance_message: null });
      setLoading(false);
      return;
    }

    // Check maintenance mode from API
    const checkMaintenanceMode = async () => {
      try {
        const apiRoot = getApiRoot();
        const response = await fetch(`${apiRoot}/system/maintenance-status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 503) {
          // Maintenance mode is active (backend returns 503 with error body)
          const body = await response.json().catch(() => ({}));
          setMaintenanceStatus({
            maintenance_mode: true,
            maintenance_message: body.message || body.error?.message || null,
          });
        } else if (response.ok) {
          const body = await response.json().catch(() => ({}));
          // Backend returns { success, data: { maintenance_mode, maintenance_message }, message }
          const payload = body.data ?? body;
          setMaintenanceStatus({
            maintenance_mode: Boolean(payload.maintenance_mode),
            maintenance_message: payload.maintenance_message ?? null,
          });
        } else {
          // Assume no maintenance mode if check fails
          setMaintenanceStatus({ maintenance_mode: false, maintenance_message: null });
        }
      } catch (error) {
        // On error (e.g. backend down, network), assume no maintenance mode (fail open)
        const isUnreachable = error instanceof TypeError && error.message === 'Failed to fetch';
        if (import.meta.env.DEV && process.env.NODE_ENV !== 'test') {
          if (isUnreachable && !hasWarnedBackendUnreachable) {
            hasWarnedBackendUnreachable = true;
            console.warn('[Maintenance] Backend unreachable — is the API server running on port 3000? Login will fail until it is started.');
          } else if (!isUnreachable) {
            console.warn('[Maintenance] Could not check maintenance mode:', error);
          }
        }
        setMaintenanceStatus({ maintenance_mode: false, maintenance_message: null });
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceMode();

    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);
    return () => clearInterval(interval);
  }, [user, userRole, isSystemSuperAdmin]);

  return {
    maintenanceMode: maintenanceStatus?.maintenance_mode || false,
    maintenanceMessage: maintenanceStatus?.maintenance_message,
    loading,
  };
}

