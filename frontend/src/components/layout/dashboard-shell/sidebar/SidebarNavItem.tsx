/**
 * Single nav link with icon, active state, tooltip when collapsed.
 */

import { NavLink } from 'react-router-dom';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getIcon } from '../config/icons';
import type { PageConfig } from '@/utils/rolePages';
import type { NavCategoryConfig } from '../config/nav-categories';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  page: PageConfig;
  isActive: boolean;
  collapsed: boolean;
  isMobile: boolean;
  categoryConfig?: NavCategoryConfig;
}

export function SidebarNavItem({
  page,
  isActive,
  collapsed,
  isMobile,
  categoryConfig,
}: SidebarNavItemProps) {
  const IconComponent = getIcon(page.icon);

  const getNavCls = ({ isActive: linkActive }: { isActive: boolean }) =>
    cn(
      'relative rounded-md transition-all duration-150',
      isActive || linkActive
        ? 'bg-sidebar-primary/15 text-sidebar-primary-foreground'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    );

  const content = (
    <NavLink
      to={page.path}
      end={page.path === '/'}
      className={({ isActive: linkActive }) => getNavCls({ isActive: isActive || linkActive })}
    >
      <div
        className={cn(
          'flex items-center min-w-0 transition-colors duration-150',
          collapsed && !isMobile
            ? 'justify-center px-0 py-2.5 sm:py-3 w-full'
            : 'w-full gap-2.5 px-2.5 py-2 sm:py-2',
        )}
      >
        <IconComponent
          className={cn(
            'flex-shrink-0 transition-colors',
            collapsed && !isMobile ? 'h-[18px] w-[18px]' : 'h-4 w-4',
            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'
          )}
          strokeWidth={1.75}
        />
        {(!collapsed || isMobile) && (
          <span className={cn(
            'text-sm flex-1 text-left truncate min-w-0',
            isActive ? 'font-medium text-white' : 'font-normal'
          )}>
            {page.title}
          </span>
        )}
      </div>
    </NavLink>
  );

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <SidebarMenuItem className={cn(collapsed && !isMobile && 'flex justify-center')}>
          <SidebarMenuButton asChild className={cn(collapsed && !isMobile ? 'w-auto justify-center' : 'w-full')}>
            {content}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </TooltipTrigger>
      {collapsed && !isMobile && (
        <TooltipContent
          side="right"
          sideOffset={8}
          className="z-[100]"
        >
          <p className="font-medium">{page.title}</p>
          {categoryConfig && (
            <p className="text-xs text-sidebar-foreground/70 mt-0.5">{categoryConfig.label}</p>
          )}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
