/**
 * Agency Features Schema
 * 
 * Manages agency feature flags and module enablement:
 * - Feature toggles (key-value pairs)
 * - Module enablement status
 * - Feature-specific settings
 * 
 * This replaces the 40+ boolean columns in the old agency_settings table
 * with a normalized key-value structure.
 * 
 * Dependencies:
 * - None (standalone table)
 */

/**
 * Ensure agency_features table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyFeaturesTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_features (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      feature_key TEXT NOT NULL UNIQUE,
      feature_name TEXT NOT NULL,
      is_enabled BOOLEAN DEFAULT true,
      category TEXT DEFAULT 'general',
      settings JSONB DEFAULT '{}'::jsonb,
      description TEXT,
      requires_subscription TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_features_updated_at ON public.agency_features;
    CREATE TRIGGER update_agency_features_updated_at
      BEFORE UPDATE ON public.agency_features
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Create indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_agency_features_key ON public.agency_features(feature_key);
    CREATE INDEX IF NOT EXISTS idx_agency_features_category ON public.agency_features(category);
    CREATE INDEX IF NOT EXISTS idx_agency_features_enabled ON public.agency_features(is_enabled);
  `);

  // Insert default features
  await client.query(`
    INSERT INTO public.agency_features (feature_key, feature_name, is_enabled, category, description)
    VALUES 
      ('payroll', 'Payroll Management', true, 'hr', 'Enable payroll processing and management'),
      ('projects', 'Project Management', true, 'operations', 'Enable project tracking and management'),
      ('crm', 'Customer Relationship Management', true, 'sales', 'Enable CRM and client management'),
      ('inventory', 'Inventory Management', false, 'operations', 'Enable inventory tracking'),
      ('reports', 'Advanced Reports', true, 'analytics', 'Enable advanced reporting and analytics'),
      ('gst', 'GST Compliance', false, 'finance', 'Enable GST calculations and compliance'),
      ('attendance', 'Attendance Tracking', true, 'hr', 'Enable employee attendance tracking'),
      ('leave', 'Leave Management', true, 'hr', 'Enable leave requests and approvals'),
      ('expenses', 'Expense Management', true, 'finance', 'Enable expense tracking and reimbursements'),
      ('invoicing', 'Invoicing', true, 'finance', 'Enable invoice generation and management'),
      ('workflows', 'Workflow Automation', true, 'operations', 'Enable automated workflows'),
      ('api_access', 'API Access', false, 'integrations', 'Enable external API access'),
      ('sso', 'Single Sign-On', false, 'security', 'Enable SSO authentication'),
      ('two_factor', 'Two-Factor Authentication', true, 'security', 'Enable 2FA for users'),
      ('audit_logs', 'Audit Logging', true, 'security', 'Enable detailed audit logging')
    ON CONFLICT (feature_key) DO NOTHING;
  `);

  console.log('[SQL] ✅ Agency features table ensured');
}

/**
 * Get feature status by key
 * @param {Object} client - PostgreSQL client
 * @param {string} featureKey - Feature key to check
 * @returns {Promise<boolean>} Feature enabled status
 */
async function isFeatureEnabled(client, featureKey) {
  const result = await client.query(
    'SELECT is_enabled FROM public.agency_features WHERE feature_key = $1',
    [featureKey]
  );
  return result.rows[0]?.is_enabled ?? false;
}

/**
 * Update feature status
 * @param {Object} client - PostgreSQL client
 * @param {string} featureKey - Feature key to update
 * @param {boolean} isEnabled - New status
 * @returns {Promise<void>}
 */
async function setFeatureEnabled(client, featureKey, isEnabled) {
  await client.query(
    'UPDATE public.agency_features SET is_enabled = $1, updated_at = NOW() WHERE feature_key = $2',
    [isEnabled, featureKey]
  );
}

/**
 * Ensure all agency features tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyFeaturesSchema(client) {
  console.log('[SQL] Ensuring agency features schema...');
  await ensureAgencyFeaturesTable(client);
  console.log('[SQL] ✅ Agency features schema ensured');
}

module.exports = {
  ensureAgencyFeaturesSchema,
  ensureAgencyFeaturesTable,
  isFeatureEnabled,
  setFeatureEnabled,
};
