/**
 * Dashboard shell: Sidebar + Header + content area.
 * Desktop: single 56px (h-14) sticky header.
 * Mobile:  auto-height sticky header — content starts BELOW it via flex column.
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarRoot } from './sidebar';
import { HeaderRoot } from './header';
import { ViewAsUserBanner } from '@/components/auth/ViewAsUserBanner';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

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
        {/* Header — always h-14, single row on all screen sizes */}
        <header
          className="sticky top-0 z-20 h-14 shrink-0 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          role="banner"
        >
          <HeaderRoot />
        </header>
        <main
          id="main-content"
          className="flex-1 min-h-0 p-3 sm:p-4 md:p-5 lg:p-6 overflow-auto"
          tabIndex={-1}
        >
          <ViewAsUserBanner />
          <EmailVerificationBanner />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
