/**
 * Theme-aware logo: light mode logo vs dark mode logo.
 * Uses branding from BrandingContext when available, else defaults.
 */
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';

interface ThemeLogoProps {
  alt?: string;
  className?: string;
}

export function ThemeLogo({ alt, className }: ThemeLogoProps) {
  const { logoLight, logoDark, systemName } = useBranding();
  const effectiveAlt = alt || systemName || 'Oru Logo';
  return (
    <>
      <img
        src={logoLight}
        alt={effectiveAlt}
        className={cn('dark:hidden', className)}
      />
      <img
        src={logoDark}
        alt={alt}
        className={cn('hidden dark:block', className)}
      />
    </>
  );
}
