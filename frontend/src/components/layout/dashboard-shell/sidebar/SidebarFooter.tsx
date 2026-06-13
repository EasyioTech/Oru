/**
 * Settings link + optional user info when expanded.
 */

import { NavLink } from 'react-router-dom';
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings } from 'lucide-react';
import type { PageConfig } from '@/utils/rolePages';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  settingsPage: PageConfig | null;
  profile: { full_name?: string; position?: string } | null;
  effectiveRole: string | null;
  collapsed: boolean;
  isMobile: boolean;
}

function getNavCls({ isActive }: { isActive: boolean }) {
  return cn(
    'relative rounded-md transition-all duration-150',
    isActive
      ? 'bg-sidebar-primary/15 text-white'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  );
}

export function SidebarFooterSection({
  settingsPage,
  profile,
  effectiveRole,
  collapsed,
  isMobile,
}: SidebarFooterProps) {
  if (!settingsPage && !(profile && (!collapsed || isMobile))) return null;

  return (
    <>
      {settingsPage && (
        <>
          <SidebarSeparator className={cn(collapsed && !isMobile ? 'mx-2' : 'mx-2 sm:mx-4')} />
          <SidebarFooter className={cn('flex-shrink-0', collapsed && !isMobile ? 'p-2 flex justify-center' : 'p-2')}>
            <SidebarGroup className={cn(collapsed && !isMobile && 'w-full')}>
              <SidebarGroupContent className={cn(collapsed && !isMobile && 'flex justify-center')}>
                <SidebarMenu className={cn(collapsed && !isMobile && 'w-full')}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <SidebarMenuItem className={cn(collapsed && !isMobile && 'flex justify-center')}>
                        <SidebarMenuButton asChild className={cn(collapsed && !isMobile ? 'w-auto justify-center' : 'w-full')}>
                          <NavLink to={settingsPage.path} className={getNavCls}>
                            <div
                              className={cn(
                                'flex items-center',
                                collapsed && !isMobile
                                  ? 'justify-center px-0 py-2.5 w-full'
                                  : 'w-full gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5'
                              )}
                            >
                              <Settings
                                className={cn(
                                  'flex-shrink-0',
                                  collapsed && !isMobile ? 'h-5 w-5' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
                                )}
                              />
                              {(!collapsed || isMobile) && (
                                <span className="text-xs sm:text-sm font-medium flex-1 text-left truncate">
                                  {settingsPage.title}
                                </span>
                              )}
                            </div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    {collapsed && !isMobile && (
                      <TooltipContent side="right" sideOffset={8} className="z-[100]">
                        <p className="font-medium">{settingsPage.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>
        </>
      )}

      {(!collapsed || isMobile) && profile && (
        <>
          <SidebarSeparator className="mx-2 sm:mx-4" />
          <SidebarFooter className="p-3 border-t border-sidebar-border/50 flex-shrink-0">
            <div className="flex items-center gap-3 px-1 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20 ring-1 ring-sidebar-primary/30 flex items-center justify-center text-sidebar-primary text-xs font-semibold flex-shrink-0">
                {(profile.full_name || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-sidebar-foreground/90 truncate">
                  {profile.full_name || 'User'}
                </div>
                <div className="text-[10px] text-sidebar-foreground/45 truncate">
                  {profile.position || (effectiveRole ? effectiveRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Member')}
                </div>
              </div>
            </div>
          </SidebarFooter>
        </>
      )}
    </>
  );
}
