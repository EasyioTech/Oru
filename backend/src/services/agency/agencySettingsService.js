/**
 * Agency Settings Service
 *
 * Handles unified agency settings updates across normalized tables:
 * - agency_settings: agency_name, domain
 * - agency_branding: logo_url, primary_color, secondary_color
 * - agency_preferences: timezone, date_format, time_format, working_hours, working_days
 * - agency_financial_settings: default_currency, fiscal_year_start
 *
 * Uses transactions for atomic updates. Falls back to agency_settings flat columns
 * when normalized tables are missing (legacy agencies).
 */

const { getAgencyPool } = require('../../infrastructure/database/poolManager');
const { withTransaction } = require('../../infrastructure/database/transactionHelper');

const DAYS_CAPITALIZED = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Normalize working_days from UI format (lowercase) to DB format (capitalized)
 * @param {string[]} days - Array like ['monday', 'tuesday']
 * @returns {string[]} Array like ['Monday', 'Tuesday']
 */
function normalizeWorkingDaysForDb(days) {
  if (!Array.isArray(days) || days.length === 0) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }
  return days.map((d) => {
    const lower = String(d).toLowerCase();
    const cap = DAYS_CAPITALIZED.find((c) => c.toLowerCase() === lower);
    return cap || d;
  });
}

/**
 * Update agency settings across normalized tables
 * @param {string} agencyDatabase - Agency database name
 * @param {Object} payload - Unified settings payload from frontend
 * @returns {Promise<Object>} Updated unified settings
 */
async function updateAgencySettings(agencyDatabase, payload) {
  if (!agencyDatabase) {
    throw new Error('Agency database not specified');
  }

  const agencyPool = getAgencyPool(agencyDatabase);

  return await withTransaction(agencyPool, async (client) => {
    const settingsId = await getSettingsId(client);
    if (!settingsId) {
      throw new Error('No agency settings found');
    }

    const hasBranding = await tableExists(client, 'agency_branding');
    const hasPrefs = await tableExists(client, 'agency_preferences');
    const hasFinancial = await tableExists(client, 'agency_financial_settings');

    // 1. agency_settings (core)
    const coreFields = ['agency_name', 'domain', 'industry', 'legal_name', 'registration_number', 'founded_year'];
    const coreUpdates = [];
    const coreParams = [];
    let paramIdx = 1;
    for (const f of coreFields) {
      if (payload[f] !== undefined) {
        coreUpdates.push(`${f} = $${paramIdx}`);
        coreParams.push(payload[f]);
        paramIdx++;
      }
    }
    if (coreUpdates.length > 0) {
      coreParams.push(settingsId);
      await client.query(
        `UPDATE public.agency_settings SET ${coreUpdates.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx}`,
        coreParams
      );
    }

    // 2. agency_branding
    if (hasBranding) {
      const brandingFields = ['logo_url', 'primary_color', 'secondary_color', 'company_tagline'];
      const brandingUpdates = [];
      const brandingParams = [];
      let bi = 1;
      for (const f of brandingFields) {
        if (payload[f] !== undefined) {
          brandingUpdates.push(`${f} = $${bi}`);
          brandingParams.push(payload[f]);
          bi++;
        }
      }
      if (brandingUpdates.length > 0) {
        await client.query(
          `UPDATE public.agency_branding SET ${brandingUpdates.join(', ')}, updated_at = NOW() WHERE id = (SELECT id FROM public.agency_branding LIMIT 1)`,
          brandingParams
        );
      }
    } else {
      // Fallback: agency_settings flat columns
      const flatBranding = ['logo_url', 'primary_color', 'secondary_color'];
      for (const f of flatBranding) {
        if (payload[f] !== undefined) {
          await addColumnIfNeeded(client, 'agency_settings', f);
          await client.query(
            `UPDATE public.agency_settings SET ${f} = $1, updated_at = NOW() WHERE id = $2`,
            [payload[f], settingsId]
          );
        }
      }
    }

    // 3. agency_preferences
    const workingDays = payload.working_days !== undefined
      ? normalizeWorkingDaysForDb(Array.isArray(payload.working_days) ? payload.working_days : [])
      : undefined;

    if (hasPrefs) {
      const prefsFields = [
        'timezone', 'date_format', 'time_format',
        'working_hours_start', 'working_hours_end',
      ];
      const prefsUpdates = [];
      const prefsParams = [];
      let pi = 1;
      for (const f of prefsFields) {
        if (payload[f] !== undefined) {
          prefsUpdates.push(`${f} = $${pi}`);
          prefsParams.push(payload[f]);
          pi++;
        }
      }
      if (workingDays !== undefined) {
        prefsUpdates.push(`working_days = $${pi}`);
        prefsParams.push(workingDays);
        pi++;
      }
      if (prefsUpdates.length > 0) {
        await client.query(
          `UPDATE public.agency_preferences SET ${prefsUpdates.join(', ')}, updated_at = NOW() WHERE id = (SELECT id FROM public.agency_preferences LIMIT 1)`,
          prefsParams
        );
      }
    } else {
      // Fallback: agency_settings flat columns
      const flatPrefs = ['timezone', 'date_format', 'time_format', 'working_hours_start', 'working_hours_end'];
      for (const f of flatPrefs) {
        if (payload[f] !== undefined) {
          await addColumnIfNeeded(client, 'agency_settings', f);
          await client.query(
            `UPDATE public.agency_settings SET ${f} = $1, updated_at = NOW() WHERE id = $2`,
            [payload[f], settingsId]
          );
        }
      }
      if (workingDays !== undefined) {
        await addColumnIfNeeded(client, 'agency_settings', 'working_days');
        await client.query(
          `UPDATE public.agency_settings SET working_days = $1, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(workingDays), settingsId]
        );
      }
    }

    // 4. agency_financial_settings
    if (hasFinancial) {
      const financialFields = ['default_currency', 'fiscal_year_start'];
      const financialUpdates = [];
      const financialParams = [];
      let fi = 1;
      for (const f of financialFields) {
        if (payload[f] !== undefined) {
          financialUpdates.push(`${f} = $${fi}`);
          financialParams.push(payload[f]);
          fi++;
        }
      }
      if (payload.default_currency === undefined && payload.currency !== undefined) {
        financialUpdates.push(`default_currency = $${fi}`);
        financialParams.push(payload.currency);
        fi++;
      }
      if (financialUpdates.length > 0) {
        await client.query(
          `UPDATE public.agency_financial_settings SET ${financialUpdates.join(', ')}, updated_at = NOW() WHERE id = (SELECT id FROM public.agency_financial_settings LIMIT 1)`,
          financialParams
        );
      }
    } else {
      // Fallback: agency_settings flat columns
      const currency = payload.default_currency ?? payload.currency;
      if (currency !== undefined) {
        await addColumnIfNeeded(client, 'agency_settings', 'default_currency');
        await client.query(
          `UPDATE public.agency_settings SET default_currency = $1, updated_at = NOW() WHERE id = $2`,
          [currency, settingsId]
        );
      }
      if (payload.fiscal_year_start !== undefined) {
        await addColumnIfNeeded(client, 'agency_settings', 'fiscal_year_start');
        await client.query(
          `UPDATE public.agency_settings SET fiscal_year_start = $1, updated_at = NOW() WHERE id = $2`,
          [payload.fiscal_year_start, settingsId]
        );
      }
    }

    return { success: true };
  });
}

async function getSettingsId(client) {
  const r = await client.query(`SELECT id FROM public.agency_settings LIMIT 1`);
  return r.rows[0]?.id || null;
}

async function tableExists(client, tableName) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return r.rows.length > 0;
}

async function addColumnIfNeeded(client, tableName, columnName) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  if (r.rows.length === 0) {
    await client.query(`ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${columnName} TEXT`);
  }
}

module.exports = {
  updateAgencySettings,
  normalizeWorkingDaysForDb,
};
