/**
 * Agency Setup Service
 * 
 * Handles agency setup completion and progress tracking.
 * Called after initial agency creation to complete extended setup.
 * 
 * Responsibilities:
 * - Track setup progress
 * - Complete extended setup (departments, team members, etc.)
 * - Update agency settings
 */

const bcrypt = require('bcrypt');
const { pool } = require('../../config/database');
const { parseDatabaseUrl, getAgencyPool } = require('../../infrastructure/database/poolManager');

/**
 * Setup steps for progress tracking
 */
const SETUP_STEPS = [
  'Company Profile',
  'Business Details',
  'Departments',
  'Financial Setup',
  'Team Members',
  'Preferences',
  'Review',
];

/**
 * Check if agency setup is complete
 * @param {string} agencyDatabase - Agency database name
 * @returns {Promise<boolean>} True if setup is complete
 */
async function checkSetupStatus(agencyDatabase) {
  if (!agencyDatabase) {
    return false;
  }

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();

  try {
    const result = await client.query(
      `SELECT setup_complete FROM public.agency_settings LIMIT 1`
    );
    return result.rows[0]?.setup_complete || false;
  } catch (error) {
    console.error('[SetupService] Error checking setup status:', error.message);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get detailed setup progress
 * @param {string} agencyDatabase - Agency database name
 * @returns {Promise<Object>} Setup progress details
 */
async function getSetupProgress(agencyDatabase) {
  const defaultResponse = {
    setupComplete: false,
    progress: 0,
    completedSteps: [],
    totalSteps: SETUP_STEPS.length,
    lastUpdated: null,
    agencyName: null,
  };

  if (!agencyDatabase) {
    return defaultResponse;
  }

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();

  try {
    // Get agency settings
    const settingsResult = await client.query(`
      SELECT 
        setup_complete,
        agency_name,
        industry,
        legal_name,
        updated_at
      FROM public.agency_settings LIMIT 1
    `);

    if (settingsResult.rows.length === 0) {
      return defaultResponse;
    }

    const settings = settingsResult.rows[0];
    const completedSteps = [];
    let stepCount = 0;

    // Step 1: Company Profile
    if (settings.agency_name && settings.agency_name !== 'My Agency') {
      completedSteps.push('Company Profile');
      stepCount++;
    }

    // Step 2: Business Details
    if (settings.legal_name || settings.industry) {
      completedSteps.push('Business Details');
      stepCount++;
    }

    // Step 3: Departments
    const deptResult = await client.query(`SELECT COUNT(*) as count FROM public.departments`);
    if (parseInt(deptResult.rows[0]?.count || 0) > 0) {
      completedSteps.push('Departments');
      stepCount++;
    }

    // Step 4: Financial Setup
    const financialResult = await client.query(`
      SELECT default_currency FROM public.agency_financial_settings LIMIT 1
    `).catch(() => ({ rows: [] }));
    if (financialResult.rows.length > 0 && financialResult.rows[0].default_currency) {
      completedSteps.push('Financial Setup');
      stepCount++;
    }

    // Step 5: Team Members
    const teamResult = await client.query(`SELECT COUNT(*) as count FROM public.users`);
    if (parseInt(teamResult.rows[0]?.count || 0) > 1) {
      completedSteps.push('Team Members');
      stepCount++;
    }

    // Step 6: Preferences
    const prefsResult = await client.query(`
      SELECT timezone FROM public.agency_preferences LIMIT 1
    `).catch(() => ({ rows: [] }));
    if (prefsResult.rows.length > 0 && prefsResult.rows[0].timezone !== 'UTC') {
      completedSteps.push('Preferences');
      stepCount++;
    }

    // Step 7: Review
    if (stepCount >= 6) {
      completedSteps.push('Review');
      stepCount++;
    }

    const progress = Math.round((stepCount / SETUP_STEPS.length) * 100);

    return {
      setupComplete: settings.setup_complete || false,
      progress,
      completedSteps,
      totalSteps: SETUP_STEPS.length,
      lastUpdated: settings.updated_at || null,
      agencyName: settings.agency_name || null,
    };
  } catch (error) {
    console.error('[SetupService] Error getting setup progress:', error.message);
    return defaultResponse;
  } finally {
    client.release();
  }
}

/**
 * Complete agency setup with extended settings
 * @param {string} agencyDatabase - Agency database name
 * @param {Object} setupData - Setup data
 * @returns {Promise<Object>} Result with team credentials
 */
async function completeAgencySetup(agencyDatabase, setupData) {
  if (!agencyDatabase) {
    throw new Error('Agency database not specified');
  }

  const {
    companyName,
    companyTagline,
    industry,
    businessType,
    foundedYear,
    employeeCount,
    description,
    logo,
    legalName,
    registrationNumber,
    taxId,
    taxIdType,
    address,
    phone,
    email,
    website,
    socialMedia,
    departments,
    teamMembers,
    currency,
    fiscalYearStart,
    paymentTerms,
    invoicePrefix,
    taxRate,
    enableGST,
    gstNumber,
    bankDetails,
    timezone,
    dateFormat,
    timeFormat,
    weekStart,
    language,
    notifications,
    features,
  } = setupData;

  const agencyPool = getAgencyPool(agencyDatabase);
  const client = await agencyPool.connect();

  try {
    await client.query('BEGIN');

    // Update agency_settings (core)
    await client.query(`
      UPDATE public.agency_settings SET
        agency_name = COALESCE($1, agency_name),
        legal_name = COALESCE($2, legal_name),
        industry = COALESCE($3, industry),
        founded_year = COALESCE($4, founded_year),
        company_size = COALESCE($5, company_size),
        registration_number = COALESCE($6, registration_number),
        setup_complete = true,
        updated_at = NOW()
      WHERE id = (SELECT id FROM public.agency_settings LIMIT 1)
    `, [companyName || legalName, legalName, industry, foundedYear, employeeCount, registrationNumber]);

    // Update branding
    await updateBranding(client, { logo, companyTagline, description });

    // Update address
    await updateAddress(client, address);

    // Update financial settings
    await updateFinancialSettings(client, {
      currency, fiscalYearStart, paymentTerms, invoicePrefix,
      taxRate, enableGST, gstNumber, taxId, taxIdType, bankDetails
    });

    // Update preferences
    await updatePreferences(client, {
      timezone, dateFormat, timeFormat, weekStart, language
    });

    // Update notifications
    if (notifications) {
      await updateNotifications(client, notifications);
    }

    // Update features
    if (features) {
      await updateFeatures(client, features);
    }

    // Create departments
    if (departments && departments.length > 0) {
      await createDepartments(client, departments);
    }

    // Create team members
    let teamCredentials = [];
    if (teamMembers && teamMembers.length > 0) {
      teamCredentials = await createTeamMembers(client, teamMembers);
    }

    await client.query('COMMIT');
    console.log(`[SetupService] ✅ Setup completed for: ${agencyDatabase}`);

    // Build CSV for credentials
    let teamCredentialsCsv = '';
    if (teamCredentials.length > 0) {
      const header = 'Name,Email,Role,Department,Employee ID,Temporary Password';
      const rows = teamCredentials.map(c => {
        const escape = v => v ? `"${String(v).replace(/"/g, '""')}"` : '';
        return [escape(c.name), escape(c.email), escape(c.role), escape(c.department), escape(c.employeeId), escape(c.temporaryPassword)].join(',');
      });
      teamCredentialsCsv = [header, ...rows].join('\n');
    }

    return { teamCredentials, teamCredentialsCsv };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[SetupService] Error completing setup:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update branding settings
 */
async function updateBranding(client, data) {
  const { logo, companyTagline, description } = data;
  await client.query(`
    UPDATE public.agency_branding SET
      logo_url = COALESCE($1, logo_url),
      company_tagline = COALESCE($2, company_tagline),
      company_description = COALESCE($3, company_description),
      updated_at = NOW()
    WHERE id = (SELECT id FROM public.agency_branding LIMIT 1)
  `, [logo, companyTagline, description]).catch(() => {});
}

/**
 * Update address settings
 */
async function updateAddress(client, address) {
  if (!address) return;
  await client.query(`
    UPDATE public.agency_address SET
      street_line1 = COALESCE($1, street_line1),
      city = COALESCE($2, city),
      state = COALESCE($3, state),
      postal_code = COALESCE($4, postal_code),
      country = COALESCE($5, country),
      updated_at = NOW()
    WHERE address_type = 'primary'
  `, [address.street, address.city, address.state, address.zipCode, address.country]).catch(() => {});
}

/**
 * Update financial settings
 */
async function updateFinancialSettings(client, data) {
  await client.query(`
    UPDATE public.agency_financial_settings SET
      default_currency = COALESCE($1, default_currency),
      fiscal_year_start = COALESCE($2, fiscal_year_start),
      payment_terms = COALESCE($3, payment_terms),
      invoice_prefix = COALESCE($4, invoice_prefix),
      default_tax_rate = COALESCE($5, default_tax_rate),
      gst_enabled = COALESCE($6, gst_enabled),
      gst_number = COALESCE($7, gst_number),
      tax_id = COALESCE($8, tax_id),
      tax_id_type = COALESCE($9, tax_id_type),
      bank_name = COALESCE($10, bank_name),
      bank_account_name = COALESCE($11, bank_account_name),
      bank_account_number = COALESCE($12, bank_account_number),
      bank_routing_number = COALESCE($13, bank_routing_number),
      bank_swift_code = COALESCE($14, bank_swift_code),
      updated_at = NOW()
    WHERE id = (SELECT id FROM public.agency_financial_settings LIMIT 1)
  `, [
    data.currency,
    data.fiscalYearStart,
    data.paymentTerms,
    data.invoicePrefix,
    data.taxRate ? parseFloat(data.taxRate) : null,
    data.enableGST,
    data.gstNumber,
    data.taxId,
    data.taxIdType,
    data.bankDetails?.bankName,
    data.bankDetails?.accountName,
    data.bankDetails?.accountNumber,
    data.bankDetails?.routingNumber,
    data.bankDetails?.swiftCode,
  ]).catch(() => {});
}

/**
 * Update preferences
 */
async function updatePreferences(client, data) {
  await client.query(`
    UPDATE public.agency_preferences SET
      timezone = COALESCE($1, timezone),
      date_format = COALESCE($2, date_format),
      time_format = COALESCE($3, time_format),
      first_day_of_week = COALESCE($4, first_day_of_week),
      language = COALESCE($5, language),
      updated_at = NOW()
    WHERE id = (SELECT id FROM public.agency_preferences LIMIT 1)
  `, [data.timezone, data.dateFormat, data.timeFormat, data.weekStart, data.language]).catch(() => {});
}

/**
 * Update notification settings
 */
async function updateNotifications(client, notifications) {
  await client.query(`
    UPDATE public.agency_notifications SET
      email_enabled = COALESCE($1, email_enabled),
      sms_enabled = COALESCE($2, sms_enabled),
      push_enabled = COALESCE($3, push_enabled),
      email_weekly_report = COALESCE($4, email_weekly_report),
      email_monthly_report = COALESCE($5, email_monthly_report),
      updated_at = NOW()
    WHERE id = (SELECT id FROM public.agency_notifications LIMIT 1)
  `, [
    notifications.email,
    notifications.sms,
    notifications.push,
    notifications.weeklyReport,
    notifications.monthlyReport,
  ]).catch(() => {});
}

/**
 * Update feature flags
 */
async function updateFeatures(client, features) {
  const featureMap = {
    enablePayroll: 'payroll',
    enableProjects: 'projects',
    enableCRM: 'crm',
    enableInventory: 'inventory',
    enableReports: 'reports',
  };

  for (const [key, featureKey] of Object.entries(featureMap)) {
    if (features[key] !== undefined) {
      await client.query(`
        UPDATE public.agency_features SET is_enabled = $1, updated_at = NOW()
        WHERE feature_key = $2
      `, [features[key], featureKey]).catch(() => {});
    }
  }
}

/**
 * Create departments
 */
async function createDepartments(client, departments) {
  for (const dept of departments) {
    if (!dept.name) continue;
    
    const existing = await client.query(
      `SELECT id FROM public.departments WHERE name = $1 LIMIT 1`,
      [dept.name]
    );

    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE public.departments SET description = $1, updated_at = NOW() WHERE id = $2`,
        [dept.description || '', existing.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO public.departments (id, name, description, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())`,
        [dept.name, dept.description || '']
      );
    }
  }
  console.log(`[SetupService] ✅ Created ${departments.length} departments`);
}

/**
 * Create team members
 */
async function createTeamMembers(client, teamMembers) {
  const credentials = [];
  let nextEmpNumber = 1;

  // Get latest employee number
  const latest = await client.query(`
    SELECT employee_id FROM public.employee_details 
    WHERE employee_id IS NOT NULL ORDER BY created_at DESC LIMIT 1
  `).catch(() => ({ rows: [] }));

  if (latest.rows.length > 0) {
    const match = String(latest.rows[0].employee_id).match(/(\d+)$/);
    if (match) nextEmpNumber = parseInt(match[1], 10) + 1;
  }

  for (const member of teamMembers) {
    if (!member.name || !member.email) continue;

    try {
      // Check if user exists
      const existing = await client.query(
        `SELECT id FROM public.users WHERE email = $1`,
        [member.email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        console.log(`[SetupService] User ${member.email} already exists, skipping`);
        continue;
      }

      // Generate password
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
      let plainPassword = '';
      for (let i = 0; i < 14; i++) {
        plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      // Create user
      const userResult = await client.query(
        `INSERT INTO public.users (id, email, password_hash, is_active, email_confirmed, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, true, false, NOW(), NOW())
         RETURNING id`,
        [member.email.toLowerCase(), passwordHash]
      );
      const userId = userResult.rows[0].id;

      // Create profile
      const nameParts = String(member.name).trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await client.query(
        `INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
        [userId, member.name, member.phone || null]
      );

      // Create employee details
      const employeeId = `EMP-${String(nextEmpNumber++).padStart(4, '0')}`;
      await client.query(
        `INSERT INTO public.employee_details (id, user_id, employee_id, first_name, last_name, employment_type, is_active)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'full_time', true)`,
        [userId, employeeId, firstName, lastName]
      );

      // Assign role
      await client.query(
        `INSERT INTO public.user_roles (id, user_id, role, assigned_at)
         VALUES (gen_random_uuid(), $1, 'employee', NOW())
         ON CONFLICT (user_id, role, agency_id) DO NOTHING`,
        [userId]
      );

      // Assign to department if specified
      let departmentName = '';
      if (member.department && member.department !== 'none') {
        const deptResult = await client.query(
          `SELECT id, name FROM public.departments WHERE name = $1 LIMIT 1`,
          [member.department]
        );
        if (deptResult.rows.length > 0) {
          departmentName = deptResult.rows[0].name;
          await client.query(
            `INSERT INTO public.team_assignments (id, user_id, department_id, position_title, role_in_department, start_date, is_active, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, 'member', NOW(), true, NOW(), NOW())`,
            [userId, deptResult.rows[0].id, member.title || 'Team Member']
          );
        }
      }

      credentials.push({
        name: member.name,
        email: member.email.toLowerCase(),
        role: 'employee',
        department: departmentName,
        employeeId,
        temporaryPassword: plainPassword,
      });

      console.log(`[SetupService] ✅ Created team member: ${member.name}`);
    } catch (memberError) {
      console.error(`[SetupService] Error creating ${member.email}:`, memberError.message);
    }
  }

  return credentials;
}

module.exports = {
  checkSetupStatus,
  getSetupProgress,
  completeAgencySetup,
  SETUP_STEPS,
};
