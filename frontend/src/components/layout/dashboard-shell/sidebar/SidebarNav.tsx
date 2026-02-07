/**
 * Renders nav groups (receives data from SidebarRoot / useSidebarNav).
 */

import { NavLink } from 'react-router-dom';
import { useSidebar, SidebarSeparator } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarNavGroup } from './SidebarNavGroup';
import type { PageConfig } from '@/utils/rolePages';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  pagesByCategory: Record<string, PageConfig[]>;
  currentPath: string;
  setupComplete: boolean | null;
}

export function SidebarNav({ pagesByCategory, currentPath, setupComplete }: SidebarNavProps) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === 'collapsed';

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 sm:py-3 px-1" data-sidebar="content">
      {/* Setup Progress – uses sidebar hierarchy (accent surface, primary accent) */}
      {setupComplete === false && (
        <div
          className={cn(
            'mb-3 sm:mb-4',
            collapsed && !isMobile ? 'px-0 flex justify-center' : 'px-2 sm:px-3'
          )}
        >
          <NavLink
            to="/agency-setup-progress"
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg transition-colors border border-sidebar-border',
                collapsed && !isMobile ? 'justify-center px-0 py-2 w-full' : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5',
                'bg-sidebar-accent text-sidebar-foreground',
                'hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent ring-2 ring-sidebar-ring ring-offset-2 ring-offset-sidebar-background'
              )
            }
          >
            <div className="relative flex-shrink-0">
              <TrendingUp
                className={cn(
                  'text-sidebar-primary',
                  collapsed && !isMobile ? 'h-5 w-5' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
                )}
              />
              {(!collapsed || isMobile) && (
                <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-sidebar-primary rounded-full" />
              )}
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-sidebar-foreground truncate">
                  Setup Progress
                </div>
                <div className="text-[10px] sm:text-xs text-sidebar-foreground/70 truncate">
                  Complete your setup
                </div>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {/* Category-based Navigation Groups */}
      {Object.entries(pagesByCategory).map(([category, pages], index) => (
        <div key={category}>
          {index > 0 && <SidebarSeparator className="my-2 mx-2" />}
          <SidebarNavGroup
            category={category}
            pages={pages}
            currentPath={currentPath}
            collapsed={collapsed}
            isMobile={isMobile}
          />
        </div>
      ))}
    </div>
  );
}
