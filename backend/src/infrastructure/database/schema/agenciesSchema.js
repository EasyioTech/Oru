/**
 * Agencies Schema (Normalized)
 * 
 * Manages core agency settings only.
 * Related data has been normalized into separate tables:
 * - agency_branding: Logo, colors, tagline
 * - agency_address: Business address
 * - agency_features: Feature flags
 * - agency_notifications: Notification preferences
 * - agency_financial_settings: Currency, tax, banking
 * - agency_preferences: Timezone, language, formats
 * 
 * Note: The 'agencies' table is in the main database, not in agency databases.
 * This module handles agency_settings which exists in each agency database.
 * 
 * Dependencies:
 * - None (foundational table)
 */

const { ensureAgencyBrandingSchema } = require('./agencyBrandingSchema');
const { ensureAgencyAddressSchema } = require('./agencyAddressSchema');
const { ensureAgencyFeaturesSchema } = require('./agencyFeaturesSchema');
const { ensureAgencyNotificationsSchema } = require('./agencyNotificationsSchema');
const { ensureAgencyFinancialSettingsSchema } = require('./agencyFinancialSettingsSchema');
const { ensureAgencyPreferencesSchema } = require('./agencyPreferencesSchema');

/**
 * Ensure agency_settings table exists (core settings only)
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencySettingsTable(client) {
  // Create the core agency_settings table with minimal columns
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_name TEXT NOT NULL DEFAULT 'My Agency',
      domain TEXT,
      industry TEXT,
      company_size TEXT,
      legal_name TEXT,
      registration_number TEXT,
      founded_year TEXT,
      setup_complete BOOLEAN DEFAULT false,
      setup_step INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_settings_updated_at ON public.agency_settings;
    CREATE TRIGGER update_agency_settings_updated_at
      BEFORE UPDATE ON public.agency_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Add any missing columns for backward compatibility
  const columnsToAdd = [
    { name: 'domain', type: 'TEXT' },
    { name: 'industry', type: 'TEXT' },
    { name: 'company_size', type: 'TEXT' },
    { name: 'legal_name', type: 'TEXT' },
    { name: 'registration_number', type: 'TEXT' },
    { name: 'founded_year', type: 'TEXT' },
    { name: 'setup_step', type: 'INTEGER DEFAULT 0' },
  ];

  for (const col of columnsToAdd) {
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'agency_settings' 
          AND column_name = '${col.name}'
        ) THEN
          ALTER TABLE public.agency_settings ADD COLUMN ${col.name} ${col.type};
        END IF;
      END $$;
    `);
  }

  // Insert default agency settings if none exist
  await client.query(`
    INSERT INTO public.agency_settings (id, agency_name, setup_complete)
    SELECT gen_random_uuid(), 'My Agency', false
    WHERE NOT EXISTS (SELECT 1 FROM public.agency_settings LIMIT 1);
  `);

  console.log('[SQL] ✅ Agency settings table ensured (normalized)');
}

/**
 * Migrate data from old agency_settings to new normalized tables
 * This function handles backward compatibility by copying data
 * from legacy columns to new tables if they exist
 * @param {Object} client - PostgreSQL client
 */
async function migrateToNormalizedSchema(client) {
  try {
    // Check if old columns exist
    const oldColumnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'agency_settings'
      AND column_name IN (
        'logo_url', 'primary_color', 'company_tagline',
        'address_street', 'address_city', 'address_state',
        'currency', 'tax_rate', 'bank_name',
        'timezone', 'language', 'date_format',
        'notifications_email', 'features_enable_payroll'
      )
    `);

    if (oldColumnsCheck.rows.length === 0) {
      console.log('[SQL] No legacy columns found, skipping migration');
      return;
    }

    const oldColumns = oldColumnsCheck.rows.map(r => r.column_name);

    // Migrate branding data
    if (oldColumns.includes('logo_url') || oldColumns.includes('company_tagline')) {
      await client.query(`
        UPDATE public.agency_branding SET
          logo_url = COALESCE(
            (SELECT logo_url FROM public.agency_settings LIMIT 1),
            logo_url
          ),
          company_tagline = COALESCE(
            (SELECT company_tagline FROM public.agency_settings LIMIT 1),
            company_tagline
          )
        WHERE id = (SELECT id FROM public.agency_branding LIMIT 1);
      `).catch(() => {});
    }

    // Migrate address data
    if (oldColumns.includes('address_street')) {
      await client.query(`
        UPDATE public.agency_address SET
          street_line1 = COALESCE(
            (SELECT address_street FROM public.agency_settings LIMIT 1),
            street_line1
          ),
          city = COALESCE(
            (SELECT address_city FROM public.agency_settings LIMIT 1),
            city
          ),
          state = COALESCE(
            (SELECT address_state FROM public.agency_settings LIMIT 1),
            state
          ),
          postal_code = COALESCE(
            (SELECT address_zip FROM public.agency_settings LIMIT 1),
            postal_code
          ),
          country = COALESCE(
            (SELECT address_country FROM public.agency_settings LIMIT 1),
            country
          )
        WHERE address_type = 'primary';
      `).catch(() => {});
    }

    // Migrate financial settings
    if (oldColumns.includes('currency') || oldColumns.includes('tax_rate')) {
      await client.query(`
        UPDATE public.agency_financial_settings SET
          default_currency = COALESCE(
            (SELECT currency FROM public.agency_settings LIMIT 1),
            default_currency
          ),
          default_tax_rate = COALESCE(
            (SELECT tax_rate FROM public.agency_settings LIMIT 1),
            default_tax_rate
          ),
          gst_enabled = COALESCE(
            (SELECT enable_gst FROM public.agency_settings LIMIT 1),
            gst_enabled
          ),
          gst_number = COALESCE(
            (SELECT gst_number FROM public.agency_settings LIMIT 1),
            gst_number
          ),
          bank_name = COALESCE(
            (SELECT bank_name FROM public.agency_settings LIMIT 1),
            bank_name
          ),
          bank_account_name = COALESCE(
            (SELECT bank_account_name FROM public.agency_settings LIMIT 1),
            bank_account_name
          ),
          bank_account_number = COALESCE(
            (SELECT bank_account_number FROM public.agency_settings LIMIT 1),
            bank_account_number
          )
        WHERE id = (SELECT id FROM public.agency_financial_settings LIMIT 1);
      `).catch(() => {});
    }

    // Migrate preferences
    if (oldColumns.includes('timezone') || oldColumns.includes('language')) {
      await client.query(`
        UPDATE public.agency_preferences SET
          timezone = COALESCE(
            (SELECT timezone FROM public.agency_settings LIMIT 1),
            timezone
          ),
          language = COALESCE(
            (SELECT language FROM public.agency_settings LIMIT 1),
            language
          ),
          date_format = COALESCE(
            (SELECT date_format FROM public.agency_settings LIMIT 1),
            date_format
          ),
          time_format = COALESCE(
            (SELECT time_format FROM public.agency_settings LIMIT 1),
            time_format
          )
        WHERE id = (SELECT id FROM public.agency_preferences LIMIT 1);
      `).catch(() => {});
    }

    console.log('[SQL] ✅ Legacy data migration completed');
  } catch (error) {
    console.warn('[SQL] ⚠️ Migration encountered non-fatal error:', error.message);
  }
}

/**
 * Ensure system_settings table exists (main database)
 * @param {Object} client - PostgreSQL client
 */
async function ensureSystemSettingsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.system_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      system_name TEXT NOT NULL DEFAULT 'Oru ERP',
      system_tagline TEXT,
      system_description TEXT,
      maintenance_mode BOOLEAN DEFAULT false,
      maintenance_message TEXT,
      created_by UUID REFERENCES public.users(id),
      updated_by UUID REFERENCES public.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
    CREATE TRIGGER update_system_settings_updated_at
      BEFORE UPDATE ON public.system_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Insert default system settings if none exist
  await client.query(`
    INSERT INTO public.system_settings (system_name, system_tagline, system_description)
    SELECT 'Oru ERP', 'Complete Business Management Solution', 'A comprehensive ERP system for managing your business operations'
    WHERE NOT EXISTS (SELECT 1 FROM public.system_settings LIMIT 1);
  `);

  console.log('[SQL] ✅ System settings table ensured');
}

/**
 * Ensure agency_provisioning_jobs table exists (async agency creation)
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyProvisioningJobsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_provisioning_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idempotency_key TEXT UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending'
            CHECK (status IN ('pending', 'running', 'completed', 'failed')),
        domain TEXT NOT NULL,
        agency_name TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        result JSONB,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        completed_at TIMESTAMPTZ
    );
  `);

  // Create indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_status ON public.agency_provisioning_jobs(status);
  `);
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_idempotency_key ON public.agency_provisioning_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
  `);
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_created_at ON public.agency_provisioning_jobs(created_at);
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_provisioning_jobs_updated_at ON public.agency_provisioning_jobs;
    CREATE TRIGGER update_agency_provisioning_jobs_updated_at
      BEFORE UPDATE ON public.agency_provisioning_jobs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  console.log('[SQL] ✅ Agency provisioning jobs table ensured');
}

/**
 * Ensure agencies schema (main database tables)
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgenciesSchema(client) {
  console.log('[SQL] Ensuring agencies schema (normalized)...');
  
  // Core settings table
  await ensureAgencySettingsTable(client);
  
  // System settings table (main database)
  await ensureSystemSettingsTable(client);
  
  // Normalized sub-tables
  await ensureAgencyBrandingSchema(client);
  await ensureAgencyAddressSchema(client);
  await ensureAgencyFeaturesSchema(client);
  await ensureAgencyNotificationsSchema(client);
  await ensureAgencyFinancialSettingsSchema(client);
  await ensureAgencyPreferencesSchema(client);
  
  // Ensure agency provisioning jobs table
  await ensureAgencyProvisioningJobsTable(client);
  
  // Migrate data from legacy columns if they exist
  await migrateToNormalizedSchema(client);
  
  console.log('[SQL] ✅ Agencies schema ensured (normalized)');
}

module.exports = {
  ensureAgenciesSchema,
  ensureAgencySettingsTable,
  ensureSystemSettingsTable,
  ensureAgencyProvisioningJobsTable,
  migrateToNormalizedSchema,
};
