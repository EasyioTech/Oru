/**
 * Sidebar root: uses ui/sidebar; responsive width/collapse; composes Branding, Nav, Footer.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthWithViewAs } from '@/hooks/useAuthWithViewAs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarNav } from './useSidebarNav';
import { SidebarBranding } from './SidebarBranding';
import { SidebarNav } from './SidebarNav';
import { SidebarFooterSection } from './SidebarFooter';
import { AdaptiveNavigation } from '@/modules/core/components/AdaptiveNavigation';
import { Building } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function SidebarRoot() {
  const auth = useAuthWithViewAs();
  const effectiveRole = auth.userRole;
  const loading = auth.loading;
  const profile = auth.profile;
  const workspaceId = (profile as any)?.workspaceId || '';
  const location = useLocation();
  const { state, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const navResult = useSidebarNav(effectiveRole ?? null, loading);
  const collapsed = state === 'collapsed';

  // Auto-collapse sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && typeof setOpenMobile === 'function') {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  if (loading || !effectiveRole) {
    return (
      <Sidebar className="w-14" collapsible="icon">
        <SidebarContent className="flex flex-col">
          <SidebarHeader className="p-3 border-b border-sidebar-border/50">
            <div className="h-9 w-9 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-sidebar-primary" />
            </div>
          </SidebarHeader>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={200}>
      <Sidebar
        className={cn(
          'border-r border-sidebar-border/50 bg-sidebar transition-[width] duration-150 ease-out',
          isMobile && 'w-full'
        )}
        collapsible={isMobile ? 'offcanvas' : 'icon'}
        variant={isMobile ? 'floating' : 'sidebar'}
        side="left"
      >
        <SidebarContent className="flex flex-col overflow-hidden">
          <SidebarHeader
            className={cn(
              'border-b border-sidebar-border/50 flex-shrink-0',
              collapsed && !isMobile ? 'p-2 flex justify-center' : 'p-3 sm:p-4'
            )}
          >
            <SidebarBranding collapsed={collapsed} isMobile={isMobile} />
          </SidebarHeader>

          {workspaceId ? (
            <AdaptiveNavigation workspaceId={workspaceId} />
          ) : (
            <SidebarNav
              pagesByCategory={navResult.pagesByCategory}
              currentPath={location.pathname}
            />
          )}

          <SidebarFooterSection
            settingsPage={navResult.settingsPage}
            profile={profile}
            effectiveRole={navResult.effectiveRole}
            collapsed={collapsed}
            isMobile={isMobile}
          />
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
