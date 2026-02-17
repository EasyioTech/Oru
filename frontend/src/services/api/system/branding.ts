import { getApiEndpoint } from '@/config/services';

export interface Branding {
  logo_url: string | null;
  favicon_url: string | null;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  login_logo_url: string | null;
  email_logo_url: string | null;
  system_name: string | null;
  system_tagline: string | null;
  system_description: string | null;
  // Contact
  support_email: string | null;
  support_phone: string | null;
  support_address: string | null;
  // Social
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  // Legal
  terms_of_service_url: string | null;
  privacy_policy_url: string | null;
  cookie_policy_url: string | null;
}

const DEFAULTS = {
  favicon: '/images/landing/light.svg',
  logoLight: '/images/landing/light.svg',
  logoDark: '/images/landing/logo.svg',
  systemName: 'Oru ERP',
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
    const json = JSON.parse(text);

    // Backend returns { success: true, data: { logo_url, ... } }
    // We need to extract the data object directly.
    const data = json.data || json;

    // Handle potential nesting if API changes in future or legacy support
    const obj = data.branding || data;

    if (!obj || typeof obj !== 'object') return getDefaultBranding();

    return {
      logo_url: typeof obj.logo_url === 'string' ? obj.logo_url : null,
      favicon_url: typeof obj.favicon_url === 'string' ? obj.favicon_url : null,
      logo_light_url: typeof obj.logo_light_url === 'string' ? obj.logo_light_url : null,
      logo_dark_url: typeof obj.logo_dark_url === 'string' ? obj.logo_dark_url : null,
      login_logo_url: typeof obj.login_logo_url === 'string' ? obj.login_logo_url : null,
      email_logo_url: typeof obj.email_logo_url === 'string' ? obj.email_logo_url : null,
      system_name: typeof obj.system_name === 'string' ? obj.system_name : null,
      system_tagline: typeof obj.system_tagline === 'string' ? obj.system_tagline : null,
      system_description: typeof obj.system_description === 'string' ? obj.system_description : null,

      // Contact
      support_email: typeof obj.support_email === 'string' ? obj.support_email : null,
      support_phone: typeof obj.support_phone === 'string' ? obj.support_phone : null,
      support_address: typeof obj.support_address === 'string' ? obj.support_address : null,

      // Social
      facebook_url: typeof obj.facebook_url === 'string' ? obj.facebook_url : null,
      twitter_url: typeof obj.twitter_url === 'string' ? obj.twitter_url : null,
      linkedin_url: typeof obj.linkedin_url === 'string' ? obj.linkedin_url : null,
      instagram_url: typeof obj.instagram_url === 'string' ? obj.instagram_url : null,
      youtube_url: typeof obj.youtube_url === 'string' ? obj.youtube_url : null,

      // Legal
      terms_of_service_url: typeof obj.terms_of_service_url === 'string' ? obj.terms_of_service_url : null,
      privacy_policy_url: typeof obj.privacy_policy_url === 'string' ? obj.privacy_policy_url : null,
      cookie_policy_url: typeof obj.cookie_policy_url === 'string' ? obj.cookie_policy_url : null,
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
    system_name: DEFAULTS.systemName,
    system_tagline: null,
    system_description: null,
    support_email: null,
    support_phone: null,
    support_address: null,
    facebook_url: null,
    twitter_url: null,
    linkedin_url: null,
    instagram_url: null,
    youtube_url: null,
    terms_of_service_url: null,
    privacy_policy_url: null,
    cookie_policy_url: null,
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
