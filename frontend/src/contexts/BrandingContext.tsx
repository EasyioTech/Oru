import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchBranding, getEffectiveFavicon, getEffectiveLogoLight, getEffectiveLogoDark, type Branding } from '@/services/api/system';

interface BrandingContextValue {
  branding: Branding | null;
  loading: boolean;
  favicon: string;
  logoLight: string;
  logoDark: string;
  systemName: string;
  systemTagline: string;
  systemDescription: string;
  // Contact
  supportEmail: string | null;
  supportPhone: string | null;
  supportAddress: string | null;
  // Social
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  // Legal
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  cookiePolicyUrl: string | null;
  refreshBranding: () => Promise<void>;
}

const defaults = {
  branding: null,
  loading: true,
  favicon: '/images/landing/light.svg',
  logoLight: '/images/landing/light.svg',
  logoDark: '/images/landing/logo.svg',
  systemName: 'Oru ERP',
  systemTagline: '',
  systemDescription: '',
  supportEmail: null,
  supportPhone: null,
  supportAddress: null,
  facebookUrl: null,
  twitterUrl: null,
  linkedinUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  termsOfServiceUrl: null,
  privacyPolicyUrl: null,
  cookiePolicyUrl: null,
  refreshBranding: async () => { },
};

const BrandingContext = createContext<BrandingContextValue>(defaults);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    try {
      const b = await fetchBranding();
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

      // Update document title if system_name is available
      if (b?.system_name) {
        document.title = b.system_name;
      }
    } catch (err) {
      console.error('Failed to load branding', err);
    }
  };

  useEffect(() => {
    loadBranding().finally(() => setLoading(false));
  }, []);

  const value: BrandingContextValue = {
    branding,
    loading,
    favicon: getEffectiveFavicon(branding),
    logoLight: getEffectiveLogoLight(branding),
    logoDark: getEffectiveLogoDark(branding),
    systemName: branding?.system_name || 'Oru ERP',
    systemTagline: branding?.system_tagline || '',
    systemDescription: branding?.system_description || '',
    // Contact
    supportEmail: branding?.support_email || null,
    supportPhone: branding?.support_phone || null,
    supportAddress: branding?.support_address || null,
    // Social
    facebookUrl: branding?.facebook_url || null,
    twitterUrl: branding?.twitter_url || null,
    linkedinUrl: branding?.linkedin_url || null,
    instagramUrl: branding?.instagram_url || null,
    youtubeUrl: branding?.youtube_url || null,
    // Legal
    termsOfServiceUrl: branding?.terms_of_service_url || null,
    privacyPolicyUrl: branding?.privacy_policy_url || null,
    cookiePolicyUrl: branding?.cookie_policy_url || null,
    refreshBranding: loadBranding,
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
