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
import type { PageConfig } from '@/utils/navPages';
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

  return (
    <SidebarGroup
      key={category}
      className={cn(collapsed && !isMobile ? 'px-0' : 'px-1 sm:px-2', 'mb-2 sm:mb-3')}
    >
      {(!collapsed || isMobile) && (
        <SidebarGroupLabel className="px-2 mb-1">
          <span className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest truncate">
            {config.label}
          </span>
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
