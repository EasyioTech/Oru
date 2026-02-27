/**
 * Agency Financial Settings Schema
 * 
 * Manages agency financial configuration:
 * - Currency and tax settings
 * - Banking information
 * - Invoice settings
 * - Payment terms
 * 
 * Dependencies:
 * - None (standalone table)
 */

/**
 * Ensure agency_financial_settings table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyFinancialSettingsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_financial_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Currency settings
      default_currency TEXT DEFAULT 'USD',
      supported_currencies TEXT[] DEFAULT ARRAY['USD'],
      exchange_rate_source TEXT DEFAULT 'manual',
      
      -- Tax settings
      tax_enabled BOOLEAN DEFAULT false,
      default_tax_rate DECIMAL(5, 2) DEFAULT 0,
      tax_id TEXT,
      tax_id_type TEXT DEFAULT 'EIN',
      gst_enabled BOOLEAN DEFAULT false,
      gst_number TEXT,
      vat_enabled BOOLEAN DEFAULT false,
      vat_number TEXT,
      
      -- Fiscal year
      fiscal_year_start TEXT DEFAULT '01-01',
      fiscal_year_end TEXT DEFAULT '12-31',
      
      -- Invoice settings
      invoice_prefix TEXT DEFAULT 'INV',
      invoice_next_number INTEGER DEFAULT 1001,
      invoice_due_days INTEGER DEFAULT 30,
      invoice_notes TEXT,
      invoice_terms TEXT,
      invoice_footer TEXT,
      
      -- Payment terms
      payment_terms TEXT DEFAULT 'Net 30',
      late_fee_enabled BOOLEAN DEFAULT false,
      late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
      early_payment_discount DECIMAL(5, 2) DEFAULT 0,
      
      -- Bank details
      bank_name TEXT,
      bank_account_name TEXT,
      bank_account_number TEXT,
      bank_routing_number TEXT,
      bank_swift_code TEXT,
      bank_iban TEXT,
      bank_branch_code TEXT,
      bank_country TEXT,
      
      -- Payment methods accepted
      accept_credit_card BOOLEAN DEFAULT true,
      accept_bank_transfer BOOLEAN DEFAULT true,
      accept_paypal BOOLEAN DEFAULT false,
      accept_stripe BOOLEAN DEFAULT false,
      stripe_account_id TEXT,
      paypal_email TEXT,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_financial_settings_updated_at ON public.agency_financial_settings;
    CREATE TRIGGER update_agency_financial_settings_updated_at
      BEFORE UPDATE ON public.agency_financial_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Insert default row if none exists
  await client.query(`
    INSERT INTO public.agency_financial_settings (id)
    SELECT gen_random_uuid()
    WHERE NOT EXISTS (SELECT 1 FROM public.agency_financial_settings LIMIT 1);
  `);

  console.log('[SQL] ✅ Agency financial settings table ensured');
}

/**
 * Ensure all agency financial settings tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyFinancialSettingsSchema(client) {
  console.log('[SQL] Ensuring agency financial settings schema...');
  await ensureAgencyFinancialSettingsTable(client);
  console.log('[SQL] ✅ Agency financial settings schema ensured');
}

module.exports = {
  ensureAgencyFinancialSettingsSchema,
  ensureAgencyFinancialSettingsTable,
};
