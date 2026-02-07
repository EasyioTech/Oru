/**
 * Logo (agency or default) + app name; respects collapsed state.
 */

import { useAgencySettings } from '@/hooks/useAgencySettings';
import { ThemeLogo } from '@/components/shared/ThemeLogo';
import { cn } from '@/lib/utils';

interface SidebarBrandingProps {
  collapsed: boolean;
  isMobile: boolean;
}

export function SidebarBranding({ collapsed, isMobile }: SidebarBrandingProps) {
  const { settings: agencySettings } = useAgencySettings();

  return (
    <div
      className={cn(
        'flex items-center min-w-0',
        collapsed && !isMobile ? 'justify-center w-full' : 'gap-2 sm:gap-3'
      )}
    >
      {agencySettings?.logo_url ? (
        <div className="relative flex-shrink-0">
          <img
            src={agencySettings.logo_url}
            alt={agencySettings.agency_name || 'Agency Logo'}
            className={cn(
              'rounded-lg object-contain bg-sidebar-accent border border-sidebar-border',
              collapsed && !isMobile ? 'h-10 w-10' : 'h-10 w-10 sm:h-12 sm:w-12'
            )}
          />
        </div>
      ) : (
        <ThemeLogo
          alt="Oru Logo"
          className={cn(
            'rounded-lg object-contain flex-shrink-0',
            collapsed && !isMobile ? 'h-10 w-10' : 'h-10 w-10 sm:h-12 sm:w-12'
          )}
        />
      )}
      {(!collapsed || isMobile) && (
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="text-sm font-semibold text-sidebar-foreground truncate tracking-tight">
            {agencySettings?.agency_name || 'Oru'}
          </span>
          <span className="text-[10px] text-sidebar-foreground/70 truncate">
            Enterprise ERP
          </span>
        </div>
      )}
    </div>
  );
}
