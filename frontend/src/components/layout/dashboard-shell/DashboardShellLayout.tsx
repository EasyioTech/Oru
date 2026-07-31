import { HeaderRoot } from './header/HeaderRoot';
import { SidebarRoot } from './sidebar/SidebarRoot';
import { ViewAsUserBanner } from '@/components/auth/ViewAsUserBanner';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

interface DashboardShellLayoutProps {
  children: React.ReactNode;
}

export function DashboardShellLayout({ children }: DashboardShellLayoutProps) {
  return (
    <div className="h-screen w-full bg-[#F3F6F8] dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 font-sans selection:bg-black selection:text-white flex overflow-hidden">
      
      {/* Left Nav (Desktop only for now based on design) */}
      <SidebarRoot />
      
      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 flex flex-col pb-8 pr-8 pl-4 overflow-y-auto"
        tabIndex={-1}
      >
        <HeaderRoot />
        <ViewAsUserBanner />
        <EmailVerificationBanner />
        {children}
      </main>
      
    </div>
  );
}
