import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Settings, ChevronRight, ChevronDown, Bell } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ThemeLogo } from '@/components/shared/ThemeLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthWithViewAs } from '@/hooks/useAuthWithViewAs';
import { useSidebarNav } from './useSidebarNav';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarImageWithAuth } from '@/components/ui/AvatarImageWithAuth';

interface ModuleTheme {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
}

function getModuleTheme(path: string, title: string = '', category: string = ''): ModuleTheme {
  const p = path.toLowerCase();
  const t = title.toLowerCase();
  const c = category.toLowerCase();

  // 1. Dashboard (Lime / Fresh Green)
  if (p.includes('dashboard') || t.includes('dashboard') || c === 'dashboard') {
    return {
      bg: 'bg-[#E4F7C7] dark:bg-[#203314]/70',
      border: 'border-[#BCE99C] dark:border-[#3D6324]',
      text: 'text-[#2D641B] dark:text-[#9CE073]',
      badgeBg: 'bg-[#2D641B] text-white',
    };
  }

  // 2. CRM & Clients (Cyan / Teal)
  if (p.includes('crm') || p.includes('client') || t.includes('crm') || t.includes('client')) {
    return {
      bg: 'bg-[#A8E9E2] dark:bg-[#113835]/70',
      border: 'border-[#74D6C9] dark:border-[#1E675F]',
      text: 'text-[#0B6258] dark:text-[#67DACD]',
      badgeBg: 'bg-[#0B6258] text-white',
    };
  }

  // 3. Employees, HR, Departments & Roles (Soft Lavender / Lilac)
  if (p.includes('employee') || p.includes('hr') || p.includes('department') || p.includes('role') || p.includes('attendance') || p.includes('leave') || t.includes('employee') || t.includes('department') || c === 'hr') {
    return {
      bg: 'bg-[#DDD0F2] dark:bg-[#2B1D3E]/70',
      border: 'border-[#BDABDE] dark:border-[#58397E]',
      text: 'text-[#542F88] dark:text-[#C5A7EE]',
      badgeBg: 'bg-[#542F88] text-white',
    };
  }

  // 4. Projects & Tasks (Sky Blue / Azure)
  if (p.includes('project') || t.includes('project') || c === 'projects') {
    return {
      bg: 'bg-[#CFE6FA] dark:bg-[#152B3E]/70',
      border: 'border-[#9ECBF5] dark:border-[#255278]',
      text: 'text-[#184F83] dark:text-[#84C2F7]',
      badgeBg: 'bg-[#184F83] text-white',
    };
  }

  // 5. Finance, Billing, Payroll & Invoices (Warm Amber / Gold)
  if (p.includes('finan') || p.includes('invoice') || p.includes('payment') || p.includes('receipt') || p.includes('payroll') || p.includes('ledger') || c === 'finance') {
    return {
      bg: 'bg-[#FFF0C2] dark:bg-[#3B3010]/70',
      border: 'border-[#FDD980] dark:border-[#755F1E]',
      text: 'text-[#875800] dark:text-[#FDD062]',
      badgeBg: 'bg-[#875800] text-white',
    };
  }

  // 6. Documents & Storage (Soft Peach / Coral)
  if (p.includes('document') || p.includes('file') || t.includes('document') || t.includes('file')) {
    return {
      bg: 'bg-[#FDDBCF] dark:bg-[#391E15]/70',
      border: 'border-[#F9B7A0] dark:border-[#6F3726]',
      text: 'text-[#96381E] dark:text-[#F79A7E]',
      badgeBg: 'bg-[#96381E] text-white',
    };
  }

  // 7. Reports & Analytics (Berry Pink / Rose)
  if (p.includes('report') || t.includes('report') || c === 'reports') {
    return {
      bg: 'bg-[#FBD6E6] dark:bg-[#3B192A]/70',
      border: 'border-[#F5ACCB] dark:border-[#752F51]',
      text: 'text-[#942456] dark:text-[#F391BC]',
      badgeBg: 'bg-[#942456] text-white',
    };
  }

  // 8. Inventory & Warehouse (Sage / Olive)
  if (p.includes('inventory') || t.includes('inventory') || c === 'inventory') {
    return {
      bg: 'bg-[#E3EFCC] dark:bg-[#253413]/70',
      border: 'border-[#C8E199] dark:border-[#4E6728]',
      text: 'text-[#48631A] dark:text-[#A7D162]',
      badgeBg: 'bg-[#48631A] text-white',
    };
  }

  // 9. Workflows & Integrations (Periwinkle / Indigo)
  if (p.includes('workflow') || p.includes('integration') || c === 'workflows') {
    return {
      bg: 'bg-[#E1E3FC] dark:bg-[#1E2143]/70',
      border: 'border-[#BFC3F6] dark:border-[#3D4288]',
      text: 'text-[#3E4598] dark:text-[#A1A7F8]',
      badgeBg: 'bg-[#3E4598] text-white',
    };
  }

  // Neutral Slate
  return {
    bg: 'bg-[#E7ECF0] dark:bg-[#1D242B]/70',
    border: 'border-[#CCD6DD] dark:border-[#384653]',
    text: 'text-[#3B4D5D] dark:text-[#9BB1C4]',
    badgeBg: 'bg-[#3B4D5D] text-white',
  };
}

export function SidebarRoot() {
  const [activeTab, setActiveTab] = useState<'modules' | 'feed'>('modules');
  const [showAllModules, setShowAllModules] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthWithViewAs();
  const navResult = useSidebarNav(auth.userRole ?? null, auth.loading);
  const { settings: agencySettings } = useAgencySettings();

  const corePaths = [
    '/dashboard',
    '/projects',
    '/crm',
    '/employee-management',
    '/financial-management',
    '/documents',
    '/reports',
  ];
  const allMainPages = navResult.mainPages || [];

  const corePages = useMemo(() => {
    return corePaths
      .map(path => allMainPages.find(p => p.path === path))
      .filter(Boolean) as PageConfig[];
  }, [allMainPages]);

  const otherPages = useMemo(() => {
    return allMainPages.filter(p => !corePaths.includes(p.path));
  }, [allMainPages]);

  const filteredCore = useMemo(() => {
    if (!searchFilter.trim()) return corePages;
    return corePages.filter(p => p.title.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [corePages, searchFilter]);

  const filteredOther = useMemo(() => {
    if (!searchFilter.trim()) return otherPages;
    return otherPages.filter(p => p.title.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [otherPages, searchFilter]);

  if (auth.loading || !auth.userRole) {
    return <div className="w-full lg:w-[260px] shrink-0 pt-6 px-4 hidden lg:block animate-pulse" />;
  }

  const rawAgencyLogo = agencySettings?.logo_url || (typeof window !== 'undefined' ? localStorage.getItem('agency_logo') : null);
  const agencyLogo = useMemo(() => {
    if (!rawAgencyLogo) return null;
    if (rawAgencyLogo.includes('subdomain.yourdomain.com') || rawAgencyLogo.includes('yourdomain.com')) {
      const parts = rawAgencyLogo.split('yourdomain.com/');
      return `/api/storage/files/${parts[1] || ''}`;
    }
    return rawAgencyLogo;
  }, [rawAgencyLogo]);
  const agencyTitle = agencySettings?.agency_name || (typeof window !== 'undefined' ? localStorage.getItem('agency_name') : null) || 'Oru ERP';

  return (
    <aside 
      aria-label="Sidebar Navigation"
      className="w-full lg:w-[260px] shrink-0 flex flex-col h-screen hidden lg:flex pt-5 pb-3 px-3.5 bg-transparent select-none"
    >
      {/* Compact Brand Header */}
      <div className="flex items-center justify-between px-1 mb-3 shrink-0">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity min-w-0 group"
          title="Go to Dashboard"
        >
          {agencyLogo ? (
            <Avatar className="h-7 w-7 rounded-lg border border-gray-200/80 dark:border-gray-700 shadow-2xs shrink-0 bg-white">
              <AvatarImageWithAuth
                src={agencyLogo}
                alt={agencyTitle}
                className="object-contain p-0.5"
              />
              <AvatarFallback className="bg-slate-100 text-slate-800 font-bold text-xs">
                {agencyTitle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <ThemeLogo className="h-6 w-auto object-contain shrink-0" />
          )}
          <span className="text-[14px] font-extrabold text-gray-900 dark:text-gray-100 tracking-tight truncate max-w-[145px]">
            {agencyTitle}
          </span>
        </Link>

        <button 
          onClick={() => navigate('/settings?tab=agency')}
          title="Agency Settings"
          aria-label="Open Settings"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* Header Row: Work Queue Badge & Count */}
      <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight">Work Queue</span>
          <span className="px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
            {allMainPages.length}
          </span>
        </div>
      </div>
      
      {/* Sleek Search Bar */}
      <div className="flex items-center gap-1.5 shrink-0 mb-3 px-0.5">
        <div className="flex-1 flex items-center bg-white/80 dark:bg-[#1a1d24]/90 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-black/5 dark:border-white/10 shadow-2xs transition-all focus-within:ring-1 focus-within:ring-indigo-500/40 focus-within:bg-white group">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-2 group-focus-within:text-indigo-600 transition-colors shrink-0" />
          <input 
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search modules..." 
            className="text-xs font-medium text-gray-700 dark:text-gray-200 bg-transparent outline-none w-full placeholder:text-gray-400"
          />
          {searchFilter ? (
            <button 
              onClick={() => setSearchFilter('')}
              className="text-[10px] text-gray-400 hover:text-gray-600 px-1"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[9px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">⌘K</kbd>
          )}
        </div>
      </div>

      {/* Slim Segmented Tabs (Modules / Feed) */}
      <div className="bg-black/[0.04] dark:bg-white/5 p-0.5 rounded-lg flex shrink-0 mb-3 mx-0.5 relative border border-black/[0.02]">
        <button 
          onClick={() => setActiveTab('modules')}
          className={cn(
            "relative z-10 flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors duration-200",
            activeTab === 'modules' ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          {activeTab === 'modules' && (
            <motion.div 
              layoutId="sidebar-tab-indicator" 
              className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-2xs border border-black/[0.04]" 
              style={{ zIndex: -1 }} 
            />
          )}
          Modules
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={cn(
            "relative z-10 flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors duration-200",
            activeTab === 'feed' ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          {activeTab === 'feed' && (
            <motion.div 
              layoutId="sidebar-tab-indicator" 
              className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-2xs border border-black/[0.04]" 
              style={{ zIndex: -1 }} 
            />
          )}
          My Feed
        </button>
      </div>

      {/* Scrollable Modules List */}
      {activeTab === 'modules' ? (
        <div 
          className="flex-1 overflow-y-auto space-y-2 pb-6 px-1 -mx-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}} />
          
          {filteredCore.map((page) => {
            const isDashboardAgency = page.path === '/dashboard' && location.pathname.startsWith('/agency');
            const isActive = location.pathname === page.path || (page.path !== '/' && location.pathname.startsWith(page.path)) || isDashboardAgency;
            const theme = getModuleTheme(page.path, page.title, page.category);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComp = (Icons as any)[page.icon] || ChevronRight;
            
            return (
              <div
                key={page.path}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(page.path);
                  }
                }}
                onClick={() => navigate(page.path)}
                className={cn(
                  "rounded-xl p-2 flex items-center justify-between cursor-pointer group relative overflow-hidden transition-all duration-200",
                  theme.bg,
                  "border",
                  theme.border,
                  "shadow-2xs hover:shadow-xs",
                  isActive ? "ring-2 ring-black dark:ring-white ring-offset-1 ring-offset-[#F3F6F8] dark:ring-offset-slate-900 font-bold" : "hover:translate-x-0.5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-white/90 border border-black/5 shadow-2xs flex items-center justify-center shrink-0">
                    <IconComp className={cn("w-3.5 h-3.5", theme.text)} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold text-gray-900 leading-tight capitalize truncate">
                      {page.title}
                    </div>
                    <div className="text-[8.5px] font-semibold text-gray-600 uppercase tracking-wider truncate">
                      {page.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pl-1">
                  {isActive ? (
                    <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-black text-white shadow-2xs">
                      Active
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Toggle Button for other modules */}
          {otherPages.length > 0 && !searchFilter && (
            <div className="pt-1 pb-1 flex items-center justify-between px-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {showAllModules ? 'Other Modules' : `+${otherPages.length} More Modules`}
              </span>
              <button 
                onClick={() => setShowAllModules(!showAllModules)}
                className="w-6 h-6 rounded-md bg-white/70 dark:bg-slate-800 border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-white transition-all text-gray-500"
                title={showAllModules ? "Collapse" : "Expand All"}
              >
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showAllModules && "rotate-180")} />
              </button>
            </div>
          )}

          {/* Secondary Modules */}
          {(showAllModules || searchFilter) && filteredOther.map((page) => {
            const isDashboardAgency = page.path === '/dashboard' && location.pathname.startsWith('/agency');
            const isActive = location.pathname === page.path || (page.path !== '/' && location.pathname.startsWith(page.path)) || isDashboardAgency;
            const theme = getModuleTheme(page.path, page.title, page.category);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComp = (Icons as any)[page.icon] || ChevronRight;
            
            return (
              <div
                key={page.path}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(page.path);
                  }
                }}
                onClick={() => navigate(page.path)}
                className={cn(
                  "rounded-xl p-2 flex items-center justify-between cursor-pointer group relative overflow-hidden transition-all duration-200",
                  theme.bg,
                  "border",
                  theme.border,
                  "shadow-2xs hover:shadow-xs",
                  isActive ? "ring-2 ring-black dark:ring-white ring-offset-1 ring-offset-[#F3F6F8] dark:ring-offset-slate-900 font-bold" : "hover:translate-x-0.5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-white/90 border border-black/5 shadow-2xs flex items-center justify-center shrink-0">
                    <IconComp className={cn("w-3.5 h-3.5", theme.text)} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold text-gray-900 leading-tight capitalize truncate">
                      {page.title}
                    </div>
                    <div className="text-[8.5px] font-semibold text-gray-600 uppercase tracking-wider truncate">
                      {page.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pl-1">
                  {isActive ? (
                    <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-black text-white shadow-2xs">
                      Active
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3 opacity-80">
          <div className="w-10 h-10 bg-white/70 dark:bg-slate-800 border border-black/5 dark:border-white/10 shadow-2xs rounded-full flex items-center justify-center mb-2">
            <Bell className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">No new updates</p>
          <p className="text-[10px] text-gray-500 mt-0.5 max-w-[180px]">Activity and task notifications will appear here.</p>
        </div>
      )}
    </aside>
  );
}
