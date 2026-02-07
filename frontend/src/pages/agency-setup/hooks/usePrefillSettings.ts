import { useEffect } from 'react';
import { getApiBaseUrl } from '@/config/api';
import type { AgencySetupFormData } from '../types';

type SetFormData = React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
type SetLogoPreview = React.Dispatch<React.SetStateAction<string | null>>;

export function usePrefillSettings(setFormData: SetFormData, setLogoPreview: SetLogoPreview) {
  useEffect(() => {
    const prefillFromSettings = async () => {
      try {
        const agencyId = localStorage.getItem('agency_id');
        const agencyDatabase = localStorage.getItem('agency_database');

        if (!agencyId && !agencyDatabase) return;

        const apiBaseUrl = getApiBaseUrl();

        const [mainDbResponse, agencyDbResponse] = await Promise.allSettled([
          agencyId
            ? fetch(`${apiBaseUrl}/api/system/agency-settings/${encodeURIComponent(agencyId)}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
                },
              })
            : Promise.resolve(null),
          agencyDatabase
            ? fetch(`${apiBaseUrl}/api/agencies/agency-settings?database=${encodeURIComponent(agencyDatabase)}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
                  'X-Agency-Database': agencyDatabase,
                },
              })
            : Promise.resolve(null),
        ]);

        let mainSettings: Record<string, unknown> | null = null;
        if (mainDbResponse.status === 'fulfilled' && mainDbResponse.value && mainDbResponse.value.ok) {
          try {
            const mainData = await mainDbResponse.value.json();
            mainSettings = mainData?.data?.settings || mainData.settings;
          } catch {
            // ignore
          }
        }

        let agencySettings: Record<string, unknown> | null = null;
        if (agencyDbResponse.status === 'fulfilled' && agencyDbResponse.value && agencyDbResponse.value.ok) {
          try {
            const agencyData = await agencyDbResponse.value.json();
            agencySettings = agencyData?.data?.settings || agencyData.settings;
          } catch {
            // ignore
          }
        }

        const agencyNameFromAgencyDb = agencySettings?.agency_name as string | undefined;
        const agencyNameFromMainDb = mainSettings?.agency_name as string | undefined;
        const finalAgencyName =
          agencyNameFromAgencyDb && agencyNameFromAgencyDb !== '' && agencyNameFromAgencyDb !== 'My Agency'
            ? agencyNameFromAgencyDb
            : agencyNameFromMainDb || agencyNameFromAgencyDb;

        const mergedSettings = {
          ...mainSettings,
          ...agencySettings,
          agency_name: finalAgencyName,
          industry: (agencySettings?.industry as string) || (mainSettings?.industry as string),
          phone: (agencySettings?.phone as string) || (mainSettings?.phone as string),
          employee_count: (agencySettings?.employee_count as string) || (mainSettings?.employee_count as string),
          enable_gst:
            typeof agencySettings?.enable_gst === 'boolean'
              ? agencySettings.enable_gst
              : typeof mainSettings?.enable_gst === 'boolean'
                ? mainSettings.enable_gst
                : undefined,
          modules: (agencySettings?.modules as Record<string, boolean>) || (mainSettings?.modules as Record<string, boolean>),
        };

        const addressObj =
          (agencySettings?.address as { street?: string; city?: string; state?: string; zipCode?: string; country?: string }) ||
          (agencySettings &&
          ((agencySettings.address_street as string) || (agencySettings.address_city as string) || (agencySettings.address_state as string))
            ? {
                street: (agencySettings.address_street as string) || '',
                city: (agencySettings.address_city as string) || '',
                state: (agencySettings.address_state as string) || '',
                zipCode: (agencySettings.address_zip as string) || '',
                country: (agencySettings.address_country as string) || '',
              }
            : null) ||
          (mainSettings &&
          ((mainSettings.address_street as string) || (mainSettings.address_city as string) || (mainSettings.address_state as string))
            ? {
                street: (mainSettings.address_street as string) || '',
                city: (mainSettings.address_city as string) || '',
                state: (mainSettings.address_state as string) || '',
                zipCode: (mainSettings.address_zip as string) || '',
                country: (mainSettings.address_country as string) || '',
              }
            : null);

        const hasDataToPrefill =
          (mergedSettings && Object.keys(mergedSettings).length > 0) || agencySettings || mainSettings;

        if (hasDataToPrefill) {
          const logoUrl = (agencySettings?.logo_url as string) || (mainSettings?.logo_url as string);
          if (logoUrl) setLogoPreview(logoUrl);

          const companyNameToUse = finalAgencyName || (mergedSettings?.agency_name as string);
          const getValue = (value: unknown, fallback: unknown) =>
            value && value !== '' && value !== null && value !== undefined ? value : fallback;

          const industryValue = (mergedSettings?.industry as string) || (agencySettings?.industry as string) || (mainSettings?.industry as string);
          const employeeCountValue = (mergedSettings?.employee_count as string) || (agencySettings?.employee_count as string) || (mainSettings?.employee_count as string);
          const phoneValue = (mergedSettings?.phone as string) || (agencySettings?.phone as string) || (mainSettings?.phone as string);

          setFormData((prev) => ({
            ...prev,
            companyName: getValue(companyNameToUse, prev.companyName) as string,
            companyTagline: getValue(agencySettings?.company_tagline, prev.companyTagline) as string,
            industry: getValue(industryValue, prev.industry) as string,
            businessType: getValue(agencySettings?.business_type, prev.businessType) as string,
            foundedYear: getValue(agencySettings?.founded_year, prev.foundedYear) as string,
            employeeCount: getValue(employeeCountValue, prev.employeeCount) as string,
            description: getValue(agencySettings?.description, prev.description) as string,
            legalName: getValue(agencySettings?.legal_name, prev.legalName) as string,
            registrationNumber: getValue(agencySettings?.registration_number, prev.registrationNumber) as string,
            taxId: getValue(agencySettings?.tax_id, prev.taxId) as string,
            taxIdType: getValue(agencySettings?.tax_id_type, prev.taxIdType) as string,
            address: addressObj
              ? {
                  street: getValue(addressObj.street, prev.address.street) as string,
                  city: getValue(addressObj.city, prev.address.city) as string,
                  state: getValue(addressObj.state, prev.address.state) as string,
                  zipCode: getValue(addressObj.zipCode, prev.address.zipCode) as string,
                  country: getValue(addressObj.country, prev.address.country) as string,
                }
              : prev.address,
            phone: getValue(phoneValue, prev.phone) as string,
            email: getValue(agencySettings?.email, prev.email) as string,
            website: getValue(agencySettings?.website, prev.website) as string,
            socialMedia: {
              linkedin: (agencySettings?.social_linkedin as string) || prev.socialMedia.linkedin,
              twitter: (agencySettings?.social_twitter as string) || prev.socialMedia.twitter,
              facebook: (agencySettings?.social_facebook as string) || prev.socialMedia.facebook,
            },
            currency: getValue(agencySettings?.currency, prev.currency) as string,
            fiscalYearStart: getValue(agencySettings?.fiscal_year_start, prev.fiscalYearStart) as string,
            paymentTerms: getValue(agencySettings?.payment_terms, prev.paymentTerms) as string,
            invoicePrefix: getValue(agencySettings?.invoice_prefix, prev.invoicePrefix) as string,
            taxRate:
              agencySettings?.tax_rate !== undefined && agencySettings?.tax_rate !== null
                ? String(agencySettings.tax_rate)
                : prev.taxRate,
            enableGST:
              mergedSettings?.enable_gst !== undefined
                ? (mergedSettings.enable_gst as boolean)
                : mainSettings?.enable_gst !== undefined
                  ? (mainSettings.enable_gst as boolean)
                  : prev.enableGST,
            gstNumber: getValue(agencySettings?.gst_number, prev.gstNumber) as string,
            bankDetails: {
              accountName: (agencySettings?.bank_account_name as string) || prev.bankDetails.accountName,
              accountNumber: (agencySettings?.bank_account_number as string) || prev.bankDetails.accountNumber,
              bankName: (agencySettings?.bank_name as string) || prev.bankDetails.bankName,
              routingNumber: (agencySettings?.bank_routing_number as string) || prev.bankDetails.routingNumber,
              swiftCode: (agencySettings?.bank_swift_code as string) || prev.bankDetails.swiftCode,
            },
            timezone: (agencySettings?.timezone as string) || prev.timezone,
            dateFormat: (agencySettings?.date_format as string) || prev.dateFormat,
            timeFormat: (agencySettings?.time_format as string) || prev.timeFormat,
            weekStart: (agencySettings?.week_start as string) || prev.weekStart,
            language: (agencySettings?.language as string) || prev.language,
            notifications: {
              email: agencySettings?.notifications_email !== undefined ? (agencySettings.notifications_email as boolean) : prev.notifications.email,
              sms: agencySettings?.notifications_sms !== undefined ? (agencySettings.notifications_sms as boolean) : prev.notifications.sms,
              push: agencySettings?.notifications_push !== undefined ? (agencySettings.notifications_push as boolean) : prev.notifications.push,
              weeklyReport: agencySettings?.notifications_weekly_report !== undefined ? (agencySettings.notifications_weekly_report as boolean) : prev.notifications.weeklyReport,
              monthlyReport: agencySettings?.notifications_monthly_report !== undefined ? (agencySettings.notifications_monthly_report as boolean) : prev.notifications.monthlyReport,
            },
            features: {
              enablePayroll: mergedSettings?.modules?.finance ?? agencySettings?.features_enable_payroll ?? prev.features.enablePayroll,
              enableProjects: mergedSettings?.modules?.projects ?? agencySettings?.features_enable_projects ?? prev.features.enableProjects,
              enableCRM: mergedSettings?.modules?.people ?? agencySettings?.features_enable_crm ?? prev.features.enableCRM,
              enableInventory: mergedSettings?.modules?.inventory ?? agencySettings?.features_enable_inventory ?? prev.features.enableInventory,
              enableReports: mergedSettings?.modules?.reports ?? agencySettings?.features_enable_reports ?? prev.features.enableReports,
            },
          }));
        }
      } catch (error) {
        console.warn('Failed to prefill AgencySetup from settings:', error);
      }
    };

    prefillFromSettings();
  }, [setFormData, setLogoPreview]);
}
