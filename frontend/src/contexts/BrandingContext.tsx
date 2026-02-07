import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchBranding, getEffectiveFavicon, getEffectiveLogoLight, getEffectiveLogoDark, type Branding } from '@/services/api/system';

interface BrandingContextValue {
  branding: Branding | null;
  loading: boolean;
  favicon: string;
  logoLight: string;
  logoDark: string;
}

const defaults = {
  branding: null,
  loading: true,
  favicon: '/images/landing/light.svg',
  logoLight: '/images/landing/light.svg',
  logoDark: '/images/landing/logo.svg',
};

const BrandingContext = createContext<BrandingContextValue>(defaults);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchBranding().then((b) => {
      if (mounted) {
        setBranding(b);
        const favicon = getEffectiveFavicon(b);
        const link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        if (link) {
          link.setAttribute('href', favicon);
          if (favicon.startsWith('data:')) {
            link.setAttribute('type', favicon.match(/data:([^;]+)/)?.[1] || 'image/x-icon');
          } else if (favicon.endsWith('.svg')) {
            link.setAttribute('type', 'image/svg+xml');
          }
        } else {
          const el = document.createElement('link');
          el.rel = 'icon';
          el.href = favicon;
          if (favicon.startsWith('data:')) {
            el.type = favicon.match(/data:([^;]+)/)?.[1] || 'image/x-icon';
          } else if (favicon.endsWith('.svg')) {
            el.type = 'image/svg+xml';
          }
          document.head.appendChild(el);
        }
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const value: BrandingContextValue = {
    branding,
    loading,
    favicon: getEffectiveFavicon(branding),
    logoLight: getEffectiveLogoLight(branding),
    logoDark: getEffectiveLogoDark(branding),
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
