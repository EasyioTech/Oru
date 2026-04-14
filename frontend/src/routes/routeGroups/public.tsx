/**
 * Public & Static Routes
 * Unauthenticated and static page routes
 */

import { Route } from "react-router-dom";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Public/Unauthenticated Routes
 */
export const PublicRoutes = () => [
  <Route key="/" path="/" element={<SuspenseRoute><Pages.Landing /></SuspenseRoute>} />,
  <Route key="/pricing" path="/pricing" element={<SuspenseRoute><Pages.Pricing /></SuspenseRoute>} />,
  <Route key="/auth" path="/auth" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/sauth" path={import.meta.env.VITE_SAUTH_PATH || '/sauth'} element={<SuspenseRoute><Pages.SauthLogin /></SuspenseRoute>} />,
  <Route key="/agency-signup" path="/agency-signup" element={<SuspenseRoute><Pages.OnboardingWizard /></SuspenseRoute>} />,
  <Route key="/signup-success" path="/signup-success" element={<SuspenseRoute><Pages.SignupSuccess /></SuspenseRoute>} />,
  <Route key="/waitlist" path="/waitlist" element={<SuspenseRoute><Pages.WaitlistPage /></SuspenseRoute>} />,
  <Route key="/forgot-password" path="/forgot-password" element={<SuspenseRoute><Pages.ForgotPassword /></SuspenseRoute>} />,
  <Route key="/login" path="/login" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/register" path="/register" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  
  // Industry Specific Landing Pages
  <Route key="/industries/marketing-agencies" path="/industries/marketing-agencies" element={<SuspenseRoute><Pages.MarketingAgenciesIndustry /></SuspenseRoute>} />,
  <Route key="/industries/software-development" path="/industries/software-development" element={<SuspenseRoute><Pages.SoftwareDevIndustry /></SuspenseRoute>} />,
  <Route key="/industries/creative-agencies" path="/industries/creative-agencies" element={<SuspenseRoute><Pages.CreativeAgenciesIndustry /></SuspenseRoute>} />,
  <Route key="/industries/consulting-firms" path="/industries/consulting-firms" element={<SuspenseRoute><Pages.ConsultingFirmsIndustry /></SuspenseRoute>} />,
  <Route key="/industries/digital-marketing" path="/industries/digital-marketing" element={<SuspenseRoute><Pages.DigitalMarketingIndustry /></SuspenseRoute>} />,
  <Route key="/industries/advertising" path="/industries/advertising" element={<SuspenseRoute><Pages.AdvertisingAgenciesIndustry /></SuspenseRoute>} />,
  <Route key="/industries/media-production" path="/industries/media-production" element={<SuspenseRoute><Pages.MediaProductionIndustry /></SuspenseRoute>} />,
  <Route key="/industries/architecture-design" path="/industries/architecture-design" element={<SuspenseRoute><Pages.ArchitectureDesignIndustry /></SuspenseRoute>} />,
  <Route key="/industries/legal-services" path="/industries/legal-services" element={<SuspenseRoute><Pages.LegalServicesIndustry /></SuspenseRoute>} />,
  <Route key="/industries/accounting-firms" path="/industries/accounting-firms" element={<SuspenseRoute><Pages.AccountingFirmsIndustry /></SuspenseRoute>} />,
  <Route key="/industries/freelancers" path="/industries/freelancers" element={<SuspenseRoute><Pages.FreelancersIndustry /></SuspenseRoute>} />,

  // Comparison Pages
  <Route key="/compare/odoo" path="/compare/odoo" element={<SuspenseRoute><Pages.OdooComparison /></SuspenseRoute>} />,
  <Route key="/compare/sap-business-one" path="/compare/sap-business-one" element={<SuspenseRoute><Pages.SapComparison /></SuspenseRoute>} />,
  <Route key="/compare/monday" path="/compare/monday" element={<SuspenseRoute><Pages.MondayComparison /></SuspenseRoute>} />,
  <Route key="/compare/zoho" path="/compare/zoho" element={<SuspenseRoute><Pages.ZohoComparison /></SuspenseRoute>} />,
  <Route key="/compare/netsuite" path="/compare/netsuite" element={<SuspenseRoute><Pages.NetSuiteComparison /></SuspenseRoute>} />,
  <Route key="/compare/hubspot" path="/compare/hubspot" element={<SuspenseRoute><Pages.HubspotComparison /></SuspenseRoute>} />,
  <Route key="/compare/asana" path="/compare/asana" element={<SuspenseRoute><Pages.AsanaComparison /></SuspenseRoute>} />,
  <Route key="/compare/clickup" path="/compare/clickup" element={<SuspenseRoute><Pages.ClickupComparison /></SuspenseRoute>} />,
  <Route key="/compare/freshworks" path="/compare/freshworks" element={<SuspenseRoute><Pages.FreshworksComparison /></SuspenseRoute>} />,
];

/**
 * Static Pages Routes
 */
export const StaticPageRoutes = () => [
  <Route key="/contact" path="/contact" element={<SuspenseRoute><Pages.ContactPage /></SuspenseRoute>} />,
  <Route key="/about" path="/about" element={<SuspenseRoute><Pages.AboutPage /></SuspenseRoute>} />,
  <Route key="/careers" path="/careers" element={<SuspenseRoute><Pages.CareersPage /></SuspenseRoute>} />,
  <Route key="/help" path="/help" element={<SuspenseRoute><Pages.HelpCenterPage /></SuspenseRoute>} />,
  <Route key="/docs" path="/docs" element={<SuspenseRoute><Pages.DocsPage /></SuspenseRoute>} />,
  <Route key="/api" path="/api" element={<SuspenseRoute><Pages.APIReferencePage /></SuspenseRoute>} />,
  <Route key="/privacy" path="/privacy" element={<SuspenseRoute><Pages.PrivacyPolicyPage /></SuspenseRoute>} />,
  <Route key="/terms" path="/terms" element={<SuspenseRoute><Pages.TermsPage /></SuspenseRoute>} />,
  <Route key="/cookies" path="/cookies" element={<SuspenseRoute><Pages.CookiePolicyPage /></SuspenseRoute>} />,
  <Route key="/gdpr" path="/gdpr" element={<SuspenseRoute><Pages.GDPRPage /></SuspenseRoute>} />,
  <Route key="/changelog" path="/changelog" element={<SuspenseRoute><Pages.ChangelogPage /></SuspenseRoute>} />,
  <Route key="/roadmap" path="/roadmap" element={<SuspenseRoute><Pages.RoadmapPage /></SuspenseRoute>} />,
  <Route key="/integrations-info" path="/integrations-info" element={<SuspenseRoute><Pages.IntegrationsPublicPage /></SuspenseRoute>} />,
  <Route key="/templates" path="/templates" element={<SuspenseRoute><Pages.TemplatesPage /></SuspenseRoute>} />,
  <Route key="/community" path="/community" element={<SuspenseRoute><Pages.CommunityPage /></SuspenseRoute>} />,
  <Route key="/press" path="/press" element={<SuspenseRoute><Pages.PressPage /></SuspenseRoute>} />,
  
  // Static Feature Pages
  <Route key="/features/project-management" path="/features/project-management" element={<SuspenseRoute><Pages.ProjectManagementFeature /></SuspenseRoute>} />,
  <Route key="/features/crm" path="/features/crm" element={<SuspenseRoute><Pages.CRMFeature /></SuspenseRoute>} />,
  <Route key="/features/hr-management" path="/features/hr-management" element={<SuspenseRoute><Pages.HRManagementFeature /></SuspenseRoute>} />,
  <Route key="/features/financial-management" path="/features/financial-management" element={<SuspenseRoute><Pages.FinancialManagementFeature /></SuspenseRoute>} />,
  <Route key="/features/invoicing-billing" path="/features/invoicing-billing" element={<SuspenseRoute><Pages.InvoicingBillingFeature /></SuspenseRoute>} />,
  <Route key="/features/time-tracking" path="/features/time-tracking" element={<SuspenseRoute><Pages.TimeTrackingFeature /></SuspenseRoute>} />,
  <Route key="/features/team-collaboration" path="/features/team-collaboration" element={<SuspenseRoute><Pages.TeamCollaborationFeature /></SuspenseRoute>} />,
  <Route key="/features/reporting-analytics" path="/features/reporting-analytics" element={<SuspenseRoute><Pages.ReportingAnalyticsFeature /></SuspenseRoute>} />,
  <Route key="/features/inventory-management" path="/features/inventory-management" element={<SuspenseRoute><Pages.InventoryManagementFeature /></SuspenseRoute>} />,
  <Route key="/features/client-portal" path="/features/client-portal" element={<SuspenseRoute><Pages.ClientPortalFeature /></SuspenseRoute>} />,

  // Dynamic Feature Pages
  <Route key="/features/:slug" path="/features/:slug" element={<SuspenseRoute><Pages.FeatureDetail /></SuspenseRoute>} />,

  // Blog Routes
  <Route key="/blog" path="/blog" element={<SuspenseRoute><Pages.BlogList /></SuspenseRoute>} />,
  <Route key="/blog/:slug" path="/blog/:slug" element={<SuspenseRoute><Pages.BlogPostDetail /></SuspenseRoute>} />,
];
