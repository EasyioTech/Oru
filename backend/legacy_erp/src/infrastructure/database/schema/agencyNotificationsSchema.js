/**
 * Agency Notifications Schema
 * 
 * Manages agency notification preferences:
 * - Email notification settings
 * - SMS notification settings
 * - Push notification settings
 * - Report schedules
 * 
 * Dependencies:
 * - None (standalone table)
 */

/**
 * Ensure agency_notifications table exists
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyNotificationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.agency_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Email notifications
      email_enabled BOOLEAN DEFAULT true,
      email_daily_digest BOOLEAN DEFAULT false,
      email_weekly_report BOOLEAN DEFAULT true,
      email_monthly_report BOOLEAN DEFAULT true,
      email_on_new_user BOOLEAN DEFAULT true,
      email_on_leave_request BOOLEAN DEFAULT true,
      email_on_expense_submit BOOLEAN DEFAULT true,
      email_on_invoice_created BOOLEAN DEFAULT true,
      email_on_payment_received BOOLEAN DEFAULT true,
      
      -- SMS notifications
      sms_enabled BOOLEAN DEFAULT false,
      sms_on_urgent_only BOOLEAN DEFAULT true,
      sms_phone_number TEXT,
      
      -- Push notifications
      push_enabled BOOLEAN DEFAULT true,
      push_on_mentions BOOLEAN DEFAULT true,
      push_on_assignments BOOLEAN DEFAULT true,
      push_on_deadlines BOOLEAN DEFAULT true,
      
      -- Slack/Teams integration
      slack_enabled BOOLEAN DEFAULT false,
      slack_webhook_url TEXT,
      slack_channel TEXT,
      
      -- Report delivery
      report_recipients TEXT[],
      report_format TEXT DEFAULT 'pdf' CHECK (report_format IN ('pdf', 'excel', 'csv')),
      report_timezone TEXT DEFAULT 'UTC',
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Create updated_at trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_agency_notifications_updated_at ON public.agency_notifications;
    CREATE TRIGGER update_agency_notifications_updated_at
      BEFORE UPDATE ON public.agency_notifications
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  `);

  // Insert default row if none exists
  await client.query(`
    INSERT INTO public.agency_notifications (id)
    SELECT gen_random_uuid()
    WHERE NOT EXISTS (SELECT 1 FROM public.agency_notifications LIMIT 1);
  `);

  console.log('[SQL] ✅ Agency notifications table ensured');
}

/**
 * Ensure all agency notifications tables
 * @param {Object} client - PostgreSQL client
 */
async function ensureAgencyNotificationsSchema(client) {
  console.log('[SQL] Ensuring agency notifications schema...');
  await ensureAgencyNotificationsTable(client);
  console.log('[SQL] ✅ Agency notifications schema ensured');
}

module.exports = {
  ensureAgencyNotificationsSchema,
  ensureAgencyNotificationsTable,
};
