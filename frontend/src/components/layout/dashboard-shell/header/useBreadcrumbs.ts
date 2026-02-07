/**
 * Hook: pathname → breadcrumbs array (memoized).
 */

import { useMemo } from 'react';
import { getBreadcrumbsFromPath, type BreadcrumbItem } from '../config/breadcrumbs';

export function useBreadcrumbs(pathname: string): BreadcrumbItem[] {
  return useMemo(() => getBreadcrumbsFromPath(pathname), [pathname]);
}
