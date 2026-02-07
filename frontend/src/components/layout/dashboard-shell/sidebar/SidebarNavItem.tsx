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
      'relative rounded-lg transition-colors duration-150',
      isActive || linkActive
        ? 'bg-sidebar-accent text-sidebar-primary font-semibold border-l-2 border-sidebar-primary shadow-sm'
        : 'hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground'
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
            : 'w-full gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5',
          isActive && !collapsed && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 sm:before:w-1 before:bg-sidebar-primary before:rounded-r-full'
        )}
      >
        <IconComponent
          className={cn(
            'flex-shrink-0 transition-colors',
            collapsed && !isMobile ? 'h-5 w-5' : 'h-4 w-4 sm:h-4 sm:w-4',
            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/80'
          )}
        />
        {(!collapsed || isMobile) && (
          <span className="text-xs sm:text-sm font-medium flex-1 text-left truncate min-w-0">
            {page.title}
          </span>
        )}
        {isActive && (!collapsed || isMobile) && (
          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-sidebar-primary flex-shrink-0" />
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
