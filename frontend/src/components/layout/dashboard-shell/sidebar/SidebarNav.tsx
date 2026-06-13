/**
 * Renders nav groups (receives data from SidebarRoot / useSidebarNav).
 */

import { NavLink } from 'react-router-dom';
import { useSidebar, SidebarSeparator } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarNavGroup } from './SidebarNavGroup';
import type { PageConfig } from '@/utils/rolePages';
import { TrendingUp, ChevronDown, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';

const PRIMARY_CATEGORIES = ['dashboard', 'management', 'hr', 'personal'];

interface SidebarNavProps {
  pagesByCategory: Record<string, PageConfig[]>;
  currentPath: string;
  setupComplete: boolean | null;
}

export function SidebarNav({ pagesByCategory, currentPath, setupComplete }: SidebarNavProps) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === 'collapsed';

  const primaryEntries = Object.entries(pagesByCategory).filter(([cat]) => PRIMARY_CATEGORIES.includes(cat));
  const secondaryEntries = Object.entries(pagesByCategory).filter(([cat]) => !PRIMARY_CATEGORIES.includes(cat));

  const hasActiveSecondary = secondaryEntries.some(([_, pages]) => 
    pages.some(page => currentPath.startsWith(page.path))
  );

  const [secondaryOpen, setSecondaryOpen] = useState(hasActiveSecondary);

  // Keep it open if a secondary page becomes active
  useEffect(() => {
    if (hasActiveSecondary) {
      setSecondaryOpen(true);
    }
  }, [hasActiveSecondary]);

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
                'flex items-center rounded-md transition-colors border border-sidebar-primary/20 bg-sidebar-primary/10',
                collapsed && !isMobile ? 'justify-center px-0 py-2 w-full' : 'gap-2 px-2.5 py-2',
                'text-sidebar-foreground/80 hover:bg-sidebar-primary/15 hover:text-white',
                isActive && 'bg-sidebar-primary/15 text-white'
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

      {/* Primary Navigation Groups */}
      {primaryEntries.map(([category, pages], index) => (
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

      {/* Secondary ERP Modules Dropdown */}
      {secondaryEntries.length > 0 && (
        <>
          {primaryEntries.length > 0 && <SidebarSeparator className="my-2 mx-2" />}
          
          <Collapsible open={secondaryOpen} onOpenChange={setSecondaryOpen} className="mb-2">
            <div className={cn("px-1 sm:px-2", collapsed && !isMobile ? 'px-0' : '')}>
              <CollapsibleTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors",
                    collapsed && !isMobile && "justify-center px-0 py-2 mx-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Layers className={cn("h-4 w-4 flex-shrink-0 text-sidebar-foreground/40")} strokeWidth={1.75} />
                    {(!collapsed || isMobile) && (
                      <span className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">More modules</span>
                    )}
                  </div>
                  {(!collapsed || isMobile) && (
                    <ChevronDown className={cn("h-3.5 w-3.5 text-sidebar-foreground/30 transition-transform", secondaryOpen && "rotate-180")} />
                  )}
                </div>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pt-2 border-l-2 border-sidebar-border/30 ml-4 pl-2 mr-2">
              {secondaryEntries.map(([category, pages], index) => (
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
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
