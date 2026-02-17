/**
 * Agency Address Schema
 * 
 * Manages agency address information:
 * - Primary business address
 * - Billing address (optional)
 * - Shipping address (optional)
 * 
 * Dependencies:
 * - None (standalone table)
 */

/**
 * Ensure agency_address table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyAddressTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_address (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      address_type TEXT DEFAULT 'primary' CHECK (address_type IN ('primary', 'billing', 'shipping')),
      street_line1 TEXT,
      street_line2 TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'US',
      country_code CHAR(2) DEFAULT 'US',
      is_verified BOOLEAN DEFAULT false,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_address_updated_at ON public.agency_address;
    CREATE TRIGGER update_agency_address_updated_at
      BEFORE UPDATE ON public.agency_address
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Create index on address_type
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_agency_address_type 
    ON public.agency_address(address_type);
  `);

  // Insert default primary address if none exists
  await client.query(`
    INSERT INTO public.agency_address (id, address_type)
    SELECT gen_random_uuid(), 'primary'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.agency_address WHERE address_type = 'primary' LIMIT 1
    );
  `);

  console.log('[SQL] ✅ Agency address table ensured');
}

/**
 * Ensure all agency address tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyAddressSchema(client) {
  console.log('[SQL] Ensuring agency address schema...');
  await ensureAgencyAddressTable(client);
  console.log('[SQL] ✅ Agency address schema ensured');
}

module.exports = {
  ensureAgencyAddressSchema,
  ensureAgencyAddressTable,
};
