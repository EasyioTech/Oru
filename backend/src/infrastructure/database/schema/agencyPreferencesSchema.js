/**
 * Agency Preferences Schema
 * 
 * Manages agency locale and display preferences:
 * - Timezone settings
 * - Language preferences
 * - Date/time formats
 * - Working hours
 * 
 * Dependencies:
 * - None (standalone table)
 */

/**
 * Ensure agency_preferences table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyPreferencesTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Locale settings
      timezone TEXT DEFAULT 'UTC',
      language TEXT DEFAULT 'en',
      locale TEXT DEFAULT 'en-US',
      
      -- Date/time formats
      date_format TEXT DEFAULT 'MM/DD/YYYY',
      time_format TEXT DEFAULT '12' CHECK (time_format IN ('12', '24')),
      first_day_of_week TEXT DEFAULT 'Monday' CHECK (first_day_of_week IN ('Sunday', 'Monday', 'Saturday')),
      
      -- Working hours
      working_hours_start TEXT DEFAULT '09:00',
      working_hours_end TEXT DEFAULT '18:00',
      working_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      
      -- Display preferences
      number_format TEXT DEFAULT 'en-US',
      currency_position TEXT DEFAULT 'before' CHECK (currency_position IN ('before', 'after')),
      decimal_separator TEXT DEFAULT '.',
      thousands_separator TEXT DEFAULT ',',
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_preferences_updated_at ON public.agency_preferences;
    CREATE TRIGGER update_agency_preferences_updated_at
      BEFORE UPDATE ON public.agency_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Insert default row if none exists
  await client.query(`
    INSERT INTO public.agency_preferences (id)
    SELECT gen_random_uuid()
    WHERE NOT EXISTS (SELECT 1 FROM public.agency_preferences LIMIT 1);
  `);

  console.log('[SQL] ✅ Agency preferences table ensured');
}

/**
 * Ensure all agency preferences tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyPreferencesSchema(client) {
  console.log('[SQL] Ensuring agency preferences schema...');
  await ensureAgencyPreferencesTable(client);
  console.log('[SQL] ✅ Agency preferences schema ensured');
}

module.exports = {
  ensureAgencyPreferencesSchema,
  ensureAgencyPreferencesTable,
};
