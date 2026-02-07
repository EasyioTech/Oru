/**
 * Sticky header bar: Leading (trigger + breadcrumbs) + Trailing (notifications, theme, user).
 */

import { useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useBreadcrumbs } from './useBreadcrumbs';
import { HeaderLeading } from './HeaderLeading';
import { HeaderTrailing } from './HeaderTrailing';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function HeaderRoot() {
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs(location.pathname);
  const isMobile = useIsMobile();
  const { settings: agencySettings } = useAgencySettings();

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex w-full min-w-0 h-full',
          isMobile ? 'flex-col gap-2' : 'flex-row items-center justify-between gap-3 lg:gap-4'
        )}
      >
        <div className={cn(isMobile ? '' : 'flex-1 min-w-0 overflow-hidden flex items-center')}>
          <HeaderLeading breadcrumbs={breadcrumbs} />
        </div>
        {agencySettings?.agency_name && !isMobile && (
          <div className="hidden xl:flex items-center gap-2 px-4 flex-shrink-0">
            {agencySettings?.logo_url &&
              typeof agencySettings.logo_url === 'string' &&
              agencySettings.logo_url.trim() !== '' && (
                <img
                  src={agencySettings.logo_url}
                  alt="Agency Logo"
                  className="h-6 w-6 object-contain"
                  style={{ display: 'block' }}
                />
              )}
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {agencySettings.agency_name}
            </span>
          </div>
        )}
        <div className="flex-shrink-0">
          <HeaderTrailing />
        </div>
      </div>
    </TooltipProvider>
  );
}
