/**
 * HeaderRoot — single-row header on ALL screen sizes.
 *
 * [≡ Sidebar | / | 🔲 PageIcon  Page Title · Breadcrumb]  ·····  [Search | Theme | Clock | Notifs | Help | ─ | Avatar]
 *
 * The outer <header> in DashboardShellLayout is sticky + shrink-0 so it
 * never overlaps page content — we just fill h-14 exactly.
 */

import { useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useBreadcrumbs } from './useBreadcrumbs';
import { HeaderLeading } from './HeaderLeading';
import { HeaderTrailing } from './HeaderTrailing';
import { useAgencySettings } from '@/hooks/useAgencySettings';

export function HeaderRoot() {
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs(location.pathname);
  const { settings: agencySettings } = useAgencySettings();

  return (
    <TooltipProvider>
      <div className="flex h-14 w-full items-center gap-2 px-3 sm:px-4 md:px-5 lg:px-6">

        {/* ── Left: sidebar trigger + page identity ── */}
        <div className="flex-1 min-w-0 flex items-center">
          <HeaderLeading breadcrumbs={breadcrumbs} />
        </div>

        {/* ── Centre: empty space to push trailing items to the right ── */}
        <div className="flex-1" />

        {/* ── Right: action icons ── */}
        <div className="flex-shrink-0">
          <HeaderTrailing />
        </div>

      </div>
    </TooltipProvider>
  );
}
