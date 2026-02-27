/**
 * Agency Branding Schema
 * 
 * Manages agency branding and visual identity:
 * - Logo and images
 * - Colors and theme
 * - Company tagline and description
 * 
 * Dependencies:
 * - Requires agency_settings table to exist
 */

/**
 * Ensure agency_branding table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyBrandingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_branding (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      logo_url TEXT,
      favicon_url TEXT,
      primary_color TEXT DEFAULT '#3B82F6',
      secondary_color TEXT DEFAULT '#10B981',
      accent_color TEXT DEFAULT '#8B5CF6',
      company_tagline TEXT,
      company_description TEXT,
      theme_mode TEXT DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
      custom_css TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_branding_updated_at ON public.agency_branding;
    CREATE TRIGGER update_agency_branding_updated_at
      BEFORE UPDATE ON public.agency_branding
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Insert default row if none exists
  await client.query(`
    INSERT INTO public.agency_branding (id)
    SELECT gen_random_uuid()
    WHERE NOT EXISTS (SELECT 1 FROM public.agency_branding LIMIT 1);
  `);

  console.log('[SQL] ✅ Agency branding table ensured');
}

/**
 * Ensure all agency branding tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyBrandingSchema(client) {
  console.log('[SQL] Ensuring agency branding schema...');
  await ensureAgencyBrandingTable(client);
  console.log('[SQL] ✅ Agency branding schema ensured');
}

module.exports = {
  ensureAgencyBrandingSchema,
  ensureAgencyBrandingTable,
};
