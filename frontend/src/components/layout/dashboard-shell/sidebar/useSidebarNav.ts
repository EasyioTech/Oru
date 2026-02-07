/**
 * Hook: role + agency access → filtered nav tree; loading/setup state.
 * Memoized to avoid recalculating on every render.
 */

import { useEffect, useState, useMemo } from 'react';
import { getApiBaseUrl } from '@/config/api';
import { logError } from '@/utils/consoleLogger';
import { getPagesForRole, type PageConfig } from '@/utils/rolePages';
import { type AppRole } from '@/utils/roleUtils';
import { getAccessiblePagePaths } from '@/utils/agencyPageAccess';
import { canAccessRouteSync } from '@/utils/routePermissions';
import { getCategoryOrder } from '../config/nav-categories';

export interface UseSidebarNavResult {
  loading: boolean;
  setupComplete: boolean | null;
  mainPages: PageConfig[];
  pagesByCategory: Record<string, PageConfig[]>;
  settingsPage: PageConfig | null;
  effectiveRole: string | null;
}

export function useSidebarNav(
  effectiveRole: string | null,
  loading: boolean
): UseSidebarNavResult {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [accessiblePagePaths, setAccessiblePagePaths] = useState<string[]>([]);
  const [pagesLoaded, setPagesLoaded] = useState(false);

  // Check setup status
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const agencyDatabase = localStorage.getItem('agency_database');
        if (!agencyDatabase) {
          setSetupComplete(true);
          return;
        }
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiBaseUrl}/api/agencies/check-setup?database=${encodeURIComponent(agencyDatabase)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              'X-Agency-Database': agencyDatabase || '',
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          setSetupComplete(result.setupComplete ?? false);
        } else {
          setSetupComplete(true);
        }
      } catch (error) {
        logError('Error checking setup status:', error);
        setSetupComplete(true);
      }
    };
    if (!loading && effectiveRole) {
      checkSetup();
    }
  }, [loading, effectiveRole]);

  // Load accessible pages for non-super-admin
  useEffect(() => {
    if (effectiveRole && effectiveRole !== 'super_admin') {
      getAccessiblePagePaths()
        .then((paths) => {
          setAccessiblePagePaths(paths);
          setPagesLoaded(true);
        })
        .catch(() => {
          setAccessiblePagePaths([]);
          setPagesLoaded(true);
        });
    } else {
      setPagesLoaded(true);
      setAccessiblePagePaths([]);
    }
  }, [effectiveRole]);

  const result = useMemo(() => {
    if (loading || !effectiveRole) {
      return {
        loading: true,
        setupComplete: null,
        mainPages: [],
        pagesByCategory: {} as Record<string, PageConfig[]>,
        settingsPage: null,
        effectiveRole: null,
      };
    }

    const role = effectiveRole as AppRole;
    const rolePages = getPagesForRole(role);

    const mainPages = rolePages
      .filter((page) => {
        if (!page.exists) return false;
        if (page.category === 'settings') return false;
        if (effectiveRole && effectiveRole !== 'super_admin') {
          if (!pagesLoaded) return false;
          if (accessiblePagePaths.length === 0) return false;
          const hasAccess = accessiblePagePaths.some((path) => {
            if (path === page.path) return true;
            const pathPattern = path.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${pathPattern}$`);
            return regex.test(page.path);
          });
          if (!hasAccess) return false;
        }
        if (effectiveRole && !canAccessRouteSync(effectiveRole, page.path)) return false;
        return true;
      })
      .sort((a, b) => {
        const orderA = getCategoryOrder(a.category);
        const orderB = getCategoryOrder(b.category);
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });

    const pagesByCategory = mainPages.reduce<Record<string, PageConfig[]>>((acc, page) => {
      const category = page.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(page);
      return acc;
    }, {});

    const settingsPage =
      rolePages.find((page) => {
        if (page.path !== '/settings' || !page.exists) return false;
        if (effectiveRole && effectiveRole !== 'super_admin' && pagesLoaded) {
          if (!accessiblePagePaths.includes('/settings')) return false;
        }
        if (effectiveRole && !canAccessRouteSync(effectiveRole, '/settings')) return false;
        return true;
      }) ?? null;

    return {
      loading: false,
      setupComplete,
      mainPages,
      pagesByCategory,
      settingsPage,
      effectiveRole,
    };
  }, [
    loading,
    effectiveRole,
    pagesLoaded,
    accessiblePagePaths,
    setupComplete,
  ]);

  return result;
}
