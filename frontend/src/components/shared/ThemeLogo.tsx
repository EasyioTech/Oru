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

export function ThemeLogo({ alt = 'Oru Logo', className }: ThemeLogoProps) {
  const { logoLight, logoDark } = useBranding();
  return (
    <>
      <img
        src={logoLight}
        alt={alt}
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
