import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  Clock, 
  Briefcase, 
  Users, 
  FileText, 
  Receipt, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from './UserMenu';
import { useThemeSync } from '@/hooks/useThemeSync';
import { CommandPalette } from './CommandPalette';
import { HeaderBreadcrumbs } from './HeaderBreadcrumbs';
import { useBreadcrumbs } from './useBreadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

function formatLiveTime(date: Date) {
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return { timeStr, dateStr };
}

export function HeaderRoot() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useThemeSync();
  const breadcrumbs = useBreadcrumbs(location.pathname);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const { timeStr, dateStr } = formatLiveTime(currentTime);

  return (
    <>
      <header 
        aria-label="Executive Header"
        className="w-full flex items-center justify-between gap-3 pb-4 pt-2 sticky top-0 z-40 bg-[#F3F6F8]/80 dark:bg-[#0f1115]/80 backdrop-blur-md"
      >
        {/* Left: Dynamic Breadcrumbs & Location */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center gap-2">
            <HeaderBreadcrumbs breadcrumbs={breadcrumbs} />
          </div>
          <div className="sm:hidden font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </div>
        </div>

        {/* Center: Live Command Palette Search Input */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1a1d24]/90 border border-gray-200/80 dark:border-gray-800 shadow-2xs hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs transition-all text-xs text-gray-400 group cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
              <span className="text-gray-500 dark:text-gray-400 font-medium truncate">Search modules, projects, documents...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Controls, Live Clock, Theme & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Real Functional Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-xs font-semibold shadow-2xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>New Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/crm')}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New Lead / Client</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/employee-management')}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>Add Employee</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/documents')}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upload Document</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem 
                onClick={() => navigate('/financial-management')}
                className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                <span>Manage Invoices</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Indian Time & Date Chip (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{timeStr}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-[11px] text-gray-500">{dateStr}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 shadow-2xs transition-all active:scale-95"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Live Notification Center */}
          <NotificationCenter />

          {/* Executive User Profile Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Global Interactive Command Palette Dialog */}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
