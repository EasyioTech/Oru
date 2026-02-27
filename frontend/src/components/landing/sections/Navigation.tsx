import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../fragments';
import { useSmoothScroll } from '../hooks';
import { ThemeLogo } from '@/components/shared/ThemeLogo';
import { useThemeSync } from '@/hooks/useThemeSync';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollTo } = useSmoothScroll();
  const { theme, resolvedTheme, setTheme } = useThemeSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Handle visibility
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setVisible(false);
          } else {
            setVisible(true);
          }

          // Handle scrolled state
          setScrolled(currentScrollY > 20);

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollTo(href);
    setMobileOpen(false);
  };

  const handleThemeToggle = () => {
    if (!mounted) return;
    const currentResolved = resolvedTheme || theme;
    if (currentResolved === 'dark') setTheme('light');
    else setTheme('dark');
  };

  const isDark =
    mounted &&
    (resolvedTheme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches));

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent',
        !visible && '-translate-y-full opacity-0'
      )}
    >
      <nav className="max-w-[1120px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center group"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileOpen(false);
          }}
        >
          <div className="w-16 h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 overflow-hidden">
            <ThemeLogo className="h-14 w-auto object-contain" />
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={handleThemeToggle}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted/80',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted && isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="primary" href="/waitlist" size="md" className="font-semibold shadow-lg shadow-primary/10">
              Join Waitlist
            </Button>
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                'absolute inset-0 w-5 h-5 transition-all duration-300',
                mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
              )} />
              <X className={cn(
                'absolute inset-0 w-5 h-5 transition-all duration-300',
                mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              )} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300 border-b border-border/50',
        mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 invisible'
      )}>
        <div className="bg-background/95 backdrop-blur-xl px-6 py-6 pb-8 space-y-6">
          <div className={cn(
            'space-y-6 transition-all duration-500',
            mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}>
            <div className="flex items-center justify-between py-2 border-b border-border/50 pb-4">
              <span className="text-muted-foreground font-medium">Appearance</span>
              <button
                type="button"
                onClick={handleThemeToggle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 text-foreground text-sm font-medium transition-colors hover:bg-muted"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2">
              <Link
                to="/waitlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-3.5 px-4 bg-foreground text-background font-bold rounded-xl shadow-xl shadow-foreground/5 active:scale-[0.98] transition-all"
              >
                Join the Waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

