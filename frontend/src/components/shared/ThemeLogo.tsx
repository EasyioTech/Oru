import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';

interface ThemeLogoProps {
  alt?: string;
  className?: string;
  showText?: boolean;
}

export function ThemeLogo({ alt, className, showText = true }: ThemeLogoProps) {
  const { logoLight, logoDark, systemName, branding } = useBranding();
  const effectiveAlt = alt || systemName || 'Oru Logo';

  // If there's no custom branding logo, use the CSS-based default logo
  const isDefaultLogo = logoLight.includes('light.svg') || !branding?.logo_light_url;

  if (isDefaultLogo) {
    return (
      <div className={cn("flex items-center justify-center font-bold tracking-tighter select-none", className)}>
        {/* Dark Mode */}
        <div className="hidden dark:flex items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 bg-white text-black rounded-[10px] flex items-center justify-center text-[14px] shadow-lg shadow-white/5 border border-zinc-200">
            or.
          </div>
          {showText && <span className="text-white text-[28px] tracking-tighter font-semibold">Oru ERP.</span>}
        </div>
        {/* Light Mode */}
        <div className="flex dark:hidden items-center gap-2.5">
          <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-zinc-900 to-black text-white rounded-[10px] flex items-center justify-center text-[14px] shadow-lg shadow-black/10 border border-zinc-800">
            or.
          </div>
          {showText && <span className="text-zinc-900 text-[28px] tracking-tighter font-semibold">Oru ERP.</span>}
        </div>
      </div>
    );
  }

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
