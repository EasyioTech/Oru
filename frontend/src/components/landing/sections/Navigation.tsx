import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun, ArrowRight, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../fragments';
import { useSmoothScroll } from '../hooks';
import { ThemeLogo } from '@/components/shared/ThemeLogo';
import { useThemeSync } from '@/hooks/useThemeSync';

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'Product',      href: '#product' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ',          href: '#faq' },
];

export default function Navigation() {
  const [scrolled, setScrolled]     = useState(false);
  const [visible, setVisible]       = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const lastScrollY = useRef(0);
  const { scrollTo } = useSmoothScroll();
  const { theme, resolvedTheme, setTheme } = useThemeSync();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setVisible(!(y > lastScrollY.current && y > 100));
          setScrolled(y > 20);
          lastScrollY.current = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isDark =
    mounted &&
    (resolvedTheme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches));

  const handleThemeToggle = () => {
    if (!mounted) return;
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleNavClick = (href: string) => {
    scrollTo(href);
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm'
            : 'bg-transparent',
          !visible && '-translate-y-full opacity-0'
        )}
      >
        <nav className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileOpen(false); }}
          >
            <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] overflow-hidden">
              <ThemeLogo className="h-8 w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={handleThemeToggle}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-secondary',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
              )}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mounted && isDark
                ? <Sun className="h-[18px] w-[18px]" />
                : <Moon className="h-[18px] w-[18px]" />
              }
            </button>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth" className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors mr-1">
                Sign In
              </Link>
              <Button variant="primary" href="/agency-signup" size="md" className="font-medium rounded-full px-5 h-9 text-[13px] shadow-sm">
                Get Started Free
              </Button>
            </div>

            {/* Hamburger */}
            <button
              className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <Menu className={cn('absolute inset-0 w-5 h-5 transition-all duration-300', mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0')} />
                <X    className={cn('absolute inset-0 w-5 h-5 transition-all duration-300', mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90')} />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile full-screen drawer ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn('absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-[80%] max-w-xs bg-background border-l border-border/60 shadow-2xl',
            'flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border/40 shrink-0">
            <div className="flex justify-start">
              <ThemeLogo className="h-7 w-auto object-contain" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-xl',
                  'text-left text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60',
                  'transition-all duration-200 active:scale-[0.98]',
                  mobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                )}
                style={{ transitionDelay: mobileOpen ? `${i * 40 + 80}ms` : '0ms' }}
              >
                {link.label}
                <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="shrink-0 px-4 pb-8 pt-4 border-t border-border/40 space-y-3">
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40">
              <span className="text-sm font-medium text-muted-foreground">Appearance</span>
              <button
                type="button"
                onClick={handleThemeToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/60 text-foreground text-xs font-medium transition-all hover:border-border shadow-sm"
              >
                {isDark
                  ? <><Sun className="h-3.5 w-3.5" /><span>Light</span></>
                  : <><Moon className="h-3.5 w-3.5" /><span>Dark</span></>
                }
              </button>
            </div>

            <div className="flex gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 flex-1 py-3 px-3 border border-border/60 text-foreground text-[13px] font-semibold rounded-xl hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                Sign In
              </Link>
              <Link
                to="/agency-signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 flex-1 py-3 px-3 bg-foreground text-background text-[13px] font-bold rounded-xl shadow-lg shadow-foreground/10 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
