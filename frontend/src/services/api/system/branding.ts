import { getApiEndpoint } from '@/config/services';

export interface Branding {
  logo_url: string | null;
  favicon_url: string | null;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  login_logo_url: string | null;
  email_logo_url: string | null;
}

const DEFAULTS = {
  favicon: '/images/landing/light.svg',
  logoLight: '/images/landing/light.svg',
  logoDark: '/images/landing/logo.svg',
};

export async function fetchBranding(): Promise<Branding> {
  try {
    const res = await fetch(getApiEndpoint('/system/branding'), {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-cache',
    });
    if (!res.ok) return getDefaultBranding();
    const text = await res.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text);
    } catch {
      return getDefaultBranding();
    }
    const b = (json?.data as Record<string, unknown>)?.branding ?? json?.branding;
    if (!b || typeof b !== 'object') return getDefaultBranding();
    const obj = b as Record<string, unknown>;
    return {
      logo_url: typeof obj.logo_url === 'string' ? obj.logo_url : null,
      favicon_url: typeof obj.favicon_url === 'string' ? obj.favicon_url : null,
      logo_light_url: typeof obj.logo_light_url === 'string' ? obj.logo_light_url : null,
      logo_dark_url: typeof obj.logo_dark_url === 'string' ? obj.logo_dark_url : null,
      login_logo_url: typeof obj.login_logo_url === 'string' ? obj.login_logo_url : null,
      email_logo_url: typeof obj.email_logo_url === 'string' ? obj.email_logo_url : null,
    };
  } catch {
    return getDefaultBranding();
  }
}

function getDefaultBranding(): Branding {
  return {
    logo_url: null,
    favicon_url: null,
    logo_light_url: null,
    logo_dark_url: null,
    login_logo_url: null,
    email_logo_url: null,
  };
}

export function getEffectiveFavicon(branding: Branding | null): string {
  return branding?.favicon_url?.trim() || DEFAULTS.favicon;
}

export function getEffectiveLogoLight(branding: Branding | null): string {
  return branding?.logo_light_url?.trim() || branding?.logo_url?.trim() || DEFAULTS.logoLight;
}

export function getEffectiveLogoDark(branding: Branding | null): string {
  return branding?.logo_dark_url?.trim() || branding?.logo_url?.trim() || DEFAULTS.logoDark;
}
