/**
 * Category label + list of nav links.
 */

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { getCategoryConfig } from '../config/nav-categories';
import type { PageConfig } from '@/utils/rolePages';
import { SidebarNavItem } from './SidebarNavItem';
import { cn } from '@/lib/utils';

interface SidebarNavGroupProps {
  category: string;
  pages: PageConfig[];
  currentPath: string;
  collapsed: boolean;
  isMobile: boolean;
}

function isActive(path: string, currentPath: string): boolean {
  if (path === '/dashboard') return currentPath === '/dashboard';
  return currentPath.startsWith(path);
}

export function SidebarNavGroup({
  category,
  pages,
  currentPath,
  collapsed,
  isMobile,
}: SidebarNavGroupProps) {
  const config = getCategoryConfig(category);
  if (!config || pages.length === 0) return null;

  const Icon = config.icon;

  return (
    <SidebarGroup
      key={category}
      className={cn(collapsed && !isMobile ? 'px-0' : 'px-1 sm:px-2', 'mb-2 sm:mb-3')}
    >
      {(!collapsed || isMobile) && (
        <SidebarGroupLabel className="px-2 sm:px-3 py-2 sm:py-2.5 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-sidebar-foreground/70" />
            <span className="text-[10px] sm:text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider truncate">
              {config.label}
            </span>
          </div>
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent className={cn(collapsed && !isMobile && 'flex items-center justify-center')}>
        <SidebarMenu className={cn('space-y-1 sm:space-y-1.5', collapsed && !isMobile && 'space-y-1.5 w-full')}>
          {pages.map((page) => (
            <SidebarNavItem
              key={page.path}
              page={page}
              isActive={isActive(page.path, currentPath)}
              collapsed={collapsed}
              isMobile={isMobile}
              categoryConfig={config}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
