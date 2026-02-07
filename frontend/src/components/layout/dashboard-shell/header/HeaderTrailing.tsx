/**
 * Notifications, theme toggle, command trigger, user menu; optional clock/online/help.
 */

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Clock, Wifi, WifiOff, HelpCircle } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { cn } from '@/lib/utils';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HeaderTrailing() {
  const isMobile = useIsMobile();
  const { theme, resolvedTheme, setTheme } = useThemeSync();
  const { settings: agencySettings } = useAgencySettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleThemeToggle = () => {
    const currentResolved = resolvedTheme || theme;
    if (currentResolved === 'dark') setTheme('light');
    else setTheme('dark');
  };

  const isDark =
    resolvedTheme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <>
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 flex-nowrap justify-end">
        {isMobile ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 justify-start text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 flex-shrink-0"
                  onClick={handleThemeToggle}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-shrink-0">
              <NotificationCenter />
            </div>
            <UserMenu avatarSize="h-10 w-10" />
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 flex-shrink-0"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search (⌘K)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 flex-shrink-0"
                  onClick={handleThemeToggle}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 text-xs flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-medium leading-none">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                      {formatDate(currentTime)}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current Date & Time</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 flex-shrink-0">
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOnline ? 'System is online' : 'System is offline'}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-shrink-0">
              <NotificationCenter />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 flex-shrink-0"
                  onClick={() => window.open('https://docs.oru.app', '_blank')}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Help & Support</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Support</p>
              </TooltipContent>
            </Tooltip>
            <UserMenu />
            {agencySettings?.agency_name && (
              <div className="hidden sm:flex xl:hidden items-center gap-2 ml-2 flex-shrink-0">
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
                <span className="text-xs font-semibold text-foreground whitespace-nowrap max-w-[100px] truncate">
                  {agencySettings.agency_name}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
