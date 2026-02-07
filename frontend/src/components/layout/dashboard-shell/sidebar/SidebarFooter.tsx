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
    'relative rounded-lg transition-all duration-200',
    isActive
      ? 'bg-sidebar-accent text-sidebar-primary font-semibold border-l-2 border-sidebar-primary shadow-sm'
      : 'hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground hover:translate-x-0.5'
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
          <SidebarFooter className="p-2 sm:p-3 border-t border-sidebar-border bg-sidebar-accent/50 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 min-w-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-[10px] sm:text-xs font-semibold flex-shrink-0">
                {(profile.full_name || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs font-semibold text-sidebar-foreground truncate">
                  {profile.full_name || 'User'}
                </div>
                <div className="text-[9px] sm:text-[10px] text-sidebar-foreground/70 truncate">
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
