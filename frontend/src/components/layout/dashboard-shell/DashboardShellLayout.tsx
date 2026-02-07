/**
 * Dashboard shell: Sidebar + Header + content area.
 * Sidebar uses library width (16rem / 5rem) so spacer and bar align—no overlap.
 * Header is z-20 so it sits above sidebar at the corner; single-row shell bar.
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarRoot } from './sidebar';
import { HeaderRoot } from './header';
import { ViewAsUserBanner } from '@/components/auth/ViewAsUserBanner';

interface DashboardShellLayoutProps {
  children: React.ReactNode;
}

export function DashboardShellLayout({ children }: DashboardShellLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      <SidebarRoot />
      <SidebarInset className="flex flex-col min-w-0 overflow-hidden">
        <header
          className="sticky top-0 z-20 h-14 shrink-0 border-b border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/90"
          role="banner"
        >
          <div className="flex h-full items-center gap-3 px-3 sm:px-4 md:px-5 lg:px-6 overflow-hidden">
            <div className="flex-1 min-w-0 flex items-center">
              <HeaderRoot />
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1 min-h-0 p-3 sm:p-4 md:p-5 lg:p-6 overflow-auto" tabIndex={-1}>
          <ViewAsUserBanner />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
