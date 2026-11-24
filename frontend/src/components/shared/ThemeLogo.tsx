import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';

interface ThemeLogoProps {
  alt?: string;
  className?: string;
  showText?: boolean;
}

export function ThemeLogo({ alt, className }: ThemeLogoProps) {
  const { logoLight, logoDark, systemName } = useBranding();
  const effectiveAlt = alt || systemName || 'Oru Logo';

  const lightSrc = logoLight || '/images/landing/light.svg';
  const darkSrc = logoDark || '/images/landing/logo.svg';

  return (
    <span className={cn('inline-flex items-center justify-center shrink-0 select-none', className)}>
      <img
        src={lightSrc}
        alt={effectiveAlt}
        className="dark:hidden h-full w-auto max-h-full object-contain"
        loading="eager"
        decoding="sync"
      />
      <img
        src={darkSrc}
        alt={effectiveAlt}
        className="hidden dark:block h-full w-auto max-h-full object-contain"
        loading="eager"
        decoding="sync"
      />
    </span>
  );
}
