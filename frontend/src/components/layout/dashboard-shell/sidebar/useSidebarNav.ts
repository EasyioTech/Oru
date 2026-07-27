import { useMemo } from 'react';
import { getPagesForRole, type PageConfig } from '@/utils/navPages';
import { type AppRole } from '@/utils/roleUtils';
import { canAccessRouteSync } from '@/utils/routePermissions';
import { getCategoryOrder } from '../config/nav-categories';

export type { PageConfig };

export interface UseSidebarNavResult {
  loading: boolean;
  mainPages: PageConfig[];
  pagesByCategory: Record<string, PageConfig[]>;
  settingsPage: PageConfig | null;
  effectiveRole: string | null;
}

export function useSidebarNav(
  effectiveRole: string | null,
  loading: boolean
): UseSidebarNavResult {
  return useMemo(() => {
    if (loading || !effectiveRole) {
      return { loading: true, mainPages: [], pagesByCategory: {}, settingsPage: null, effectiveRole: null };
    }

    const role = effectiveRole as AppRole;
    const rolePages = getPagesForRole(role);

    const mainPages = rolePages
      .filter(page => page.exists && page.category !== 'settings' && canAccessRouteSync(role, page.path))
      .sort((a, b) => {
        const orderA = getCategoryOrder(a.category);
        const orderB = getCategoryOrder(b.category);
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });

    const pagesByCategory = mainPages.reduce<Record<string, PageConfig[]>>((acc, page) => {
      const cat = page.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(page);
      return acc;
    }, {});

    const settingsPage =
      rolePages.find(page => page.path === '/settings' && page.exists && canAccessRouteSync(role, '/settings')) ?? null;

    return { loading: false, mainPages, pagesByCategory, settingsPage, effectiveRole };
  }, [loading, effectiveRole]);
}
