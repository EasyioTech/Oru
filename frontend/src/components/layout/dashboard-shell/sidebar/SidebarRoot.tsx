import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Settings, Check, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuthWithViewAs } from '@/hooks/useAuthWithViewAs';
import { useSidebarNav } from './useSidebarNav';

const PASTEL_COLORS = [
  { bg: 'bg-[#E1F7C5]', shadow: 'shadow-[#D0F0A3]/30' },
  { bg: 'bg-[#A8E9E2]', shadow: 'shadow-[#89DCD4]/30' },
  { bg: 'bg-[#DCCDF0]', shadow: 'shadow-[#C6AEE3]/30' },
  { bg: 'bg-[#FBE4E4]', shadow: 'shadow-[#F5D0D0]/30' },
  { bg: 'bg-[#FFF3C7]', shadow: 'shadow-[#FDE29F]/30' },
  { bg: 'bg-[#CBE4F9]', shadow: 'shadow-[#AACEEB]/30' },
];

export function SidebarRoot() {
  const [activeTab, setActiveTab] = useState<'modules' | 'feed'>('modules');
  const [showAllModules, setShowAllModules] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthWithViewAs();
  const navResult = useSidebarNav(auth.userRole ?? null, auth.loading);

  if (auth.loading || !auth.userRole) {
    return <div className="w-full lg:w-[280px] shrink-0 pt-8 px-6 hidden lg:block animate-pulse" />;
  }

  // Filter only the core 4 modules requested by the user, and keep track of others
  const corePaths = ['/dashboard', '/projects', '/employee-management', '/crm'];
  const corePages = navResult.mainPages?.filter(p => corePaths.includes(p.path)) || [];
  const otherPages = navResult.mainPages?.filter(p => !corePaths.includes(p.path)) || [];

  return (
    <div className="w-full lg:w-[280px] shrink-0 flex flex-col h-screen hidden lg:flex pt-8 pb-4 px-4">
      
      {/* Brand Logo */}
      <Link to="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tighter hover:opacity-80 transition-opacity mb-8 px-1">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black text-white rounded-[10px] flex items-center justify-center text-[13px] shadow-lg shadow-black/10 border border-gray-800">
          or.
        </div>
        <span className="text-gray-900 text-[24px]">Oru ERP.</span>
      </Link>

      {/* Header for Left Col */}
      <div className="flex items-center justify-between px-1 shrink-0 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[25px] font-semibold tracking-tight text-gray-900 leading-[1.2]">Work Queue</h1>
          <div className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-black/5 text-gray-600 text-[10px] font-bold">
            {corePages.length + otherPages.length}
          </div>
        </div>
      </div>
      
      {/* Queue Controls */}
      <div className="flex items-center gap-2 shrink-0 mb-5 px-1">
        <div className="flex-1 flex items-center bg-white/70 backdrop-blur-md rounded-[12px] px-3.5 py-2.5 border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all focus-within:shadow-[0_4px_15px_rgba(0,0,0,0.06)] focus-within:bg-white group hover:bg-white/90">
          <Search className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-black transition-colors" />
          <input 
            type="text"
            placeholder="Search queue..." 
            className="text-xs font-medium text-gray-700 bg-transparent outline-none w-full placeholder:text-gray-400"
          />
          <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-[4px] bg-gray-100/80 border border-gray-200/60 text-[9px] font-bold text-gray-400 tracking-wider">⌘K</div>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="w-[38px] h-[38px] bg-white/70 backdrop-blur-md rounded-[12px] flex items-center justify-center border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all shrink-0 text-gray-500 hover:text-black group"
        >
          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      <div className="bg-black/[0.04] p-1 rounded-[12px] flex shrink-0 mb-6 mx-1 relative border border-black/[0.02]">
        <button 
          onClick={() => setActiveTab('modules')}
          className={cn(
            "relative z-10 flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-[10px] transition-colors duration-300",
            activeTab === 'modules' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          {activeTab === 'modules' && (
            <motion.div layoutId="sidebar-tab-indicator" className="absolute inset-0 bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04]" style={{ zIndex: -1 }} />
          )}
          Modules
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={cn(
            "relative z-10 flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-[10px] transition-colors duration-300",
            activeTab === 'feed' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          {activeTab === 'feed' && (
            <motion.div layoutId="sidebar-tab-indicator" className="absolute inset-0 bg-white rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04]" style={{ zIndex: -1 }} />
          )}
          My Feed
        </button>
      </div>

      {/* SCROLLABLE QUEUE ITEMS */}
      {activeTab === 'modules' ? (
        <div 
          className="flex-1 overflow-y-auto space-y-4 pb-8 px-2 -mx-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Firefox and IE
        >
          <style dangerouslySetInnerHTML={{__html: `
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}} />
          
          {corePages.map((page, i) => {
            // Fix for dashboard active state when redirected to /agency
            const isDashboardAgency = page.path === '/dashboard' && location.pathname.startsWith('/agency');
            const isActive = location.pathname === page.path || (page.path !== '/' && location.pathname.startsWith(page.path)) || isDashboardAgency;
            const colorTheme = PASTEL_COLORS[i % PASTEL_COLORS.length];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComp = (Icons as any)[page.icon] || ChevronRight;
            
            return (
              <motion.div 
                key={page.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => navigate(page.path)}
                className={cn(
                  "rounded-[1.5rem] p-4 flex flex-col gap-3 cursor-pointer group relative overflow-hidden transition-all duration-300",
                  colorTheme.bg, "shadow-[0_8px_20px_transparent] hover:shadow-[0_12px_25px_rgb(0,0,0,0.05)]",
                  colorTheme.shadow,
                  isActive ? "ring-2 ring-black ring-offset-2 ring-offset-[#F3F6F8]" : "hover:scale-[1.01]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white/50 shadow-sm bg-white/60 flex items-center justify-center">
                      <IconComp className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-[15px] sm:text-[17px] leading-[1.2] font-bold text-gray-900 tracking-tight capitalize">{page.title}</div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{page.category}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 relative z-10 pt-2">
                  <button 
                    className={cn(
                      "w-7 h-7 rounded-full bg-white/40 flex items-center justify-center hover:bg-white transition-colors",
                      isActive && "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    <Check className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-gray-700")} />
                  </button>
                  <div className="flex-1" />
                  <button className={cn(
                    "text-[9px] sm:text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors border",
                    isActive ? "bg-black border-black text-white hover:bg-gray-800" : "text-gray-800 bg-white/30 border-white hover:bg-white"
                  )}>
                    {isActive ? 'Active' : 'Open Module'}
                  </button>
                </div>
              </motion.div>
            );
          })}

          {otherPages.length > 0 && (
            <div className="pt-2 pb-1 flex justify-center">
              <button 
                onClick={() => setShowAllModules(!showAllModules)}
                className="w-10 h-10 rounded-full bg-white/60 border border-white shadow-sm flex items-center justify-center hover:bg-white hover:shadow transition-all group"
              >
                <Icons.ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform duration-300", showAllModules && "rotate-180")} />
              </button>
            </div>
          )}

          {showAllModules && otherPages.map((page, i) => {
            // Fix for dashboard active state when redirected to /agency
            const isDashboardAgency = page.path === '/dashboard' && location.pathname.startsWith('/agency');
            const isActive = location.pathname === page.path || (page.path !== '/' && location.pathname.startsWith(page.path)) || isDashboardAgency;
            const colorIndex = (corePages.length + i) % PASTEL_COLORS.length;
            const colorTheme = PASTEL_COLORS[colorIndex];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComp = (Icons as any)[page.icon] || ChevronRight;
            
            return (
              <motion.div 
                key={page.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => navigate(page.path)}
                className={cn(
                  "rounded-[1.5rem] p-4 flex flex-col gap-3 cursor-pointer group relative overflow-hidden transition-all duration-300 mb-4",
                  colorTheme.bg, "shadow-[0_8px_20px_transparent] hover:shadow-[0_12px_25px_rgb(0,0,0,0.05)]",
                  colorTheme.shadow,
                  isActive ? "ring-2 ring-black ring-offset-2 ring-offset-[#F3F6F8]" : "hover:scale-[1.01]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white/50 shadow-sm bg-white/60 flex items-center justify-center">
                      <IconComp className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-[15px] sm:text-[17px] leading-[1.2] font-bold text-gray-900 tracking-tight capitalize">{page.title}</div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{page.category}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 relative z-10 pt-2">
                  <button 
                    className={cn(
                      "w-7 h-7 rounded-full bg-white/40 flex items-center justify-center hover:bg-white transition-colors",
                      isActive && "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    <Check className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-gray-700")} />
                  </button>
                  <div className="flex-1" />
                  <button className={cn(
                    "text-[9px] sm:text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors border",
                    isActive ? "bg-black border-black text-white hover:bg-gray-800" : "text-gray-800 bg-white/30 border-white hover:bg-white"
                  )}>
                    {isActive ? 'Active' : 'Open Module'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-70">
          <div className="w-12 h-12 bg-white/60 border border-white shadow-sm rounded-full flex items-center justify-center mb-3">
             <Icons.Bell className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900">No new updates</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-[200px]">You're all caught up on your feed. Activity will show up here.</p>
        </div>
      )}
    </div>
  );
}
