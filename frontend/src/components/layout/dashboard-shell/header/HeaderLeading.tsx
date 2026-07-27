/**
 * HeaderLeading — Sidebar trigger + page icon pill + title + breadcrumbs.
 * Single row, works at any viewport width.
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
  const PageIcon = getPageIcon(location.pathname);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">

      {/* Hamburger — styled as a subtle pill button */}
      <SidebarTrigger
        className={cn(
          'flex-shrink-0 rounded-lg h-10 w-10 sm:h-9 sm:w-9',
          'text-muted-foreground hover:text-foreground',
          'bg-transparent hover:bg-muted/70',
          'border border-transparent hover:border-border/50',
          'transition-all duration-150 ease-out',
          'flex items-center justify-center'
        )}
      />

    </div>
  );
}
