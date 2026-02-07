/**
 * SidebarTrigger + breadcrumbs or page title.
 */

import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HeaderBreadcrumbs } from './HeaderBreadcrumbs';
import { getPageIcon } from '../config/icons';
import type { BreadcrumbItem } from '../config/breadcrumbs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface HeaderLeadingProps {
  breadcrumbs: BreadcrumbItem[];
}

export function HeaderLeading({ breadcrumbs }: HeaderLeadingProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';
  const currentPath = location.pathname;
  const PageIcon = getPageIcon(currentPath);

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
      <SidebarTrigger className="flex-shrink-0 h-9 w-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center" />
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 overflow-hidden">
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <PageIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden justify-center">
          <h1 className="font-semibold text-foreground truncate text-sm leading-tight">
            {currentPageTitle}
          </h1>
          <HeaderBreadcrumbs breadcrumbs={breadcrumbs} compact={isMobile} />
        </div>
      </div>
    </div>
  );
}
