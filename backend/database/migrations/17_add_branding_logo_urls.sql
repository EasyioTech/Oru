-- ============================================================================
-- Add logo_light_url and logo_dark_url for theme-aware branding
-- Default: light = /images/landing/light.svg, dark = /images/landing/logo.svg
-- ============================================================================

ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS logo_light_url TEXT,
ADD COLUMN IF NOT EXISTS logo_dark_url TEXT;

COMMENT ON COLUMN public.system_settings.logo_light_url IS 'Logo URL for light mode (sidebar, auth, nav)';
COMMENT ON COLUMN public.system_settings.logo_dark_url IS 'Logo URL for dark mode (sidebar, auth, nav)';
