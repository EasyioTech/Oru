/**
 * HeaderTrailing — single consistent action strip for ALL screen sizes.
 *
 * Mobile  (<md): [Search] [Theme] [Notifs] [Avatar]
 * Desktop (md+): [Search] [Theme] [Clock] [Online] ─ [Notifs] [Help] ─ [Avatar]
 *
 * Icons are intentionally uniform: h-8 w-8 rounded-lg ghost buttons.
 * Clock and Online badge only appear at md+ to keep mobile clean.
 */

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Clock, Wifi, WifiOff, HelpCircle } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useThemeSync } from '@/hooks/useThemeSync';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { cn } from '@/lib/utils';

/* ── time helpers ──────────────────────────────────────────────── */

function formatTimeParts(date: Date) {
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return { timeStr, dateStr };
}

import { forwardRef } from 'react';

/* ── shared icon button ────────────────────────────────────────── */

interface IconBtnProps {
  onClick?: () => void;
  'aria-label'?: string;
  children: React.ReactNode;
  className?: string;
}

const IconBtn = forwardRef<HTMLButtonElement, IconBtnProps>(({
  onClick,
  'aria-label': label,
  children,
  className,
}, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'h-8 w-8 rounded-lg flex-shrink-0',
        'text-muted-foreground hover:text-foreground',
        'hover:bg-muted/70 border border-transparent hover:border-border/40',
        'transition-all duration-150 ease-out',
        className
      )}
    >
      {children}
    </Button>
  );
});

IconBtn.displayName = 'IconBtn';

/* ── divider ───────────────────────────────────────────────────── */
function Divider() {
  return <div className="h-5 w-px bg-border/60 flex-shrink-0" />;
}

/* ── main component ────────────────────────────────────────────── */

export function HeaderTrailing() {
  const { theme, resolvedTheme, setTheme } = useThemeSync();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  /* clock tick */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* network status */
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  /* ⌘K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearchOpen(o => !o); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleTheme = () => {
    const resolved = resolvedTheme || theme;
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  };

  const isDark =
    resolvedTheme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { timeStr, dateStr } = formatTimeParts(currentTime);

  return (
    <>
      {/* ── action strip ─────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 sm:gap-1">

        {/* Search — icon on all sizes, opens command palette */}
        <Tooltip>
          <TooltipTrigger asChild>
            <IconBtn onClick={() => setSearchOpen(true)} aria-label="Search (⌘K)">
              <Search className="h-4 w-4" />
            </IconBtn>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-1.5">
            <span>Search</span>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium inline-flex">
              ⌘K
            </kbd>
          </TooltipContent>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <IconBtn onClick={toggleTheme} aria-label={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </IconBtn>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>{isDark ? 'Switch to light' : 'Switch to dark'}</span>
          </TooltipContent>
        </Tooltip>

        {/* Clock — md+ only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'hidden md:flex items-center gap-2 px-2.5 h-8 rounded-lg flex-shrink-0 cursor-default select-none',
              'bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors'
            )}>
              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[11px] font-semibold leading-none tracking-tight text-foreground">
                  {timeStr}
                </span>
                <span className="text-[9px] leading-none mt-[3px] text-muted-foreground font-medium">
                  {dateStr}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom"><span>Current date &amp; time</span></TooltipContent>
        </Tooltip>

        {/* Online badge — lg+ only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'hidden lg:flex items-center gap-1.5 px-2 h-8 rounded-lg flex-shrink-0 cursor-default select-none',
              'bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors'
            )}>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full flex-shrink-0',
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              )} />
              <span className={cn(
                'text-[10px] font-semibold whitespace-nowrap',
                isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>{isOnline ? 'System is online' : 'System is offline'}</span>
          </TooltipContent>
        </Tooltip>

        {/* Divider before critical actions */}
        <Divider />

        {/* Notifications */}
        <NotificationCenter />

        {/* User avatar pill */}
        <UserMenu />

      </div>

      {/* Command palette portal */}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
