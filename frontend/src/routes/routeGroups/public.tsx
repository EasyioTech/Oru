import { Route } from "react-router-dom";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";
import { PublicLayout } from "@/components/layout/PublicLayout";

/**
 * Public/Unauthenticated Routes
 */
export const PublicRoutes = () => (
  <Route element={<PublicLayout />}>
    <Route path="/" element={<SuspenseRoute><Pages.Landing /></SuspenseRoute>} />
    <Route path="/pricing" element={<SuspenseRoute><Pages.Pricing /></SuspenseRoute>} />
    <Route path="/waitlist" element={<SuspenseRoute><Pages.WaitlistPage /></SuspenseRoute>} />
    <Route path="/about" element={<SuspenseRoute><Pages.AboutPage /></SuspenseRoute>} />
    
    {/* Industry Specific Landing Pages */}
    <Route path="/industries/marketing-agencies" element={<SuspenseRoute><Pages.MarketingAgenciesIndustry /></SuspenseRoute>} />
    <Route path="/industries/software-development" element={<SuspenseRoute><Pages.SoftwareDevIndustry /></SuspenseRoute>} />
    <Route path="/industries/creative-agencies" element={<SuspenseRoute><Pages.CreativeAgenciesIndustry /></SuspenseRoute>} />
    <Route path="/industries/consulting-firms" element={<SuspenseRoute><Pages.ConsultingFirmsIndustry /></SuspenseRoute>} />
    <Route path="/industries/digital-marketing" element={<SuspenseRoute><Pages.DigitalMarketingIndustry /></SuspenseRoute>} />
    <Route path="/industries/advertising" element={<SuspenseRoute><Pages.AdvertisingAgenciesIndustry /></SuspenseRoute>} />
    <Route path="/industries/media-production" element={<SuspenseRoute><Pages.MediaProductionIndustry /></SuspenseRoute>} />
    <Route path="/industries/architecture-design" element={<SuspenseRoute><Pages.ArchitectureDesignIndustry /></SuspenseRoute>} />
    <Route path="/industries/legal-services" element={<SuspenseRoute><Pages.LegalServicesIndustry /></SuspenseRoute>} />
    <Route path="/industries/accounting-firms" element={<SuspenseRoute><Pages.AccountingFirmsIndustry /></SuspenseRoute>} />
    <Route path="/industries/freelancers" element={<SuspenseRoute><Pages.FreelancersIndustry /></SuspenseRoute>} />

    {/* Comparison Pages */}
    <Route path="/compare/odoo" element={<SuspenseRoute><Pages.OdooComparison /></SuspenseRoute>} />
    <Route path="/compare/sap-business-one" element={<SuspenseRoute><Pages.SapComparison /></SuspenseRoute>} />
    <Route path="/compare/monday" element={<SuspenseRoute><Pages.MondayComparison /></SuspenseRoute>} />
    <Route path="/compare/zoho" element={<SuspenseRoute><Pages.ZohoComparison /></SuspenseRoute>} />
    <Route path="/compare/netsuite" element={<SuspenseRoute><Pages.NetSuiteComparison /></SuspenseRoute>} />
    <Route path="/compare/hubspot" element={<SuspenseRoute><Pages.HubspotComparison /></SuspenseRoute>} />
    <Route path="/compare/asana" element={<SuspenseRoute><Pages.AsanaComparison /></SuspenseRoute>} />
    <Route path="/compare/clickup" element={<SuspenseRoute><Pages.ClickupComparison /></SuspenseRoute>} />
    <Route path="/compare/freshworks" element={<SuspenseRoute><Pages.FreshworksComparison /></SuspenseRoute>} />
  </Route>
);

/**
 * Routes that do NOT use the standard public layout (Auth, Onboarding, etc.)
 */
export const NonLayoutPublicRoutes = () => [
  <Route key="/auth" path="/auth" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/sauth" path={import.meta.env.VITE_SAUTH_PATH || '/sauth'} element={<SuspenseRoute><Pages.SauthLogin /></SuspenseRoute>} />,
  <Route key="/agency-signup" path="/agency-signup" element={<SuspenseRoute><Pages.OnboardingWizard /></SuspenseRoute>} />,
  <Route key="/signup-success" path="/signup-success" element={<SuspenseRoute><Pages.SignupSuccess /></SuspenseRoute>} />,
  <Route key="/forgot-password" path="/forgot-password" element={<SuspenseRoute><Pages.ForgotPassword /></SuspenseRoute>} />,
  <Route key="/login" path="/login" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/register" path="/register" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
];

/**
 * Static Pages Routes
 */
export const StaticPageRoutes = () => (
  <Route element={<PublicLayout />}>
    <Route path="/contact" element={<SuspenseRoute><Pages.ContactPage /></SuspenseRoute>} />
    <Route path="/careers" element={<SuspenseRoute><Pages.CareersPage /></SuspenseRoute>} />
    <Route path="/help" element={<SuspenseRoute><Pages.HelpCenterPage /></SuspenseRoute>} />
    <Route path="/docs" element={<SuspenseRoute><Pages.DocsPage /></SuspenseRoute>} />
    <Route path="/api" element={<SuspenseRoute><Pages.APIReferencePage /></SuspenseRoute>} />
    <Route path="/privacy" element={<SuspenseRoute><Pages.PrivacyPolicyPage /></SuspenseRoute>} />
    <Route path="/terms" element={<SuspenseRoute><Pages.TermsPage /></SuspenseRoute>} />
    <Route path="/cookies" element={<SuspenseRoute><Pages.CookiePolicyPage /></SuspenseRoute>} />
    <Route path="/gdpr" element={<SuspenseRoute><Pages.GDPRPage /></SuspenseRoute>} />
    <Route path="/changelog" element={<SuspenseRoute><Pages.ChangelogPage /></SuspenseRoute>} />
    <Route path="/roadmap" element={<SuspenseRoute><Pages.RoadmapPage /></SuspenseRoute>} />
    <Route path="/integrations-info" element={<SuspenseRoute><Pages.IntegrationsPublicPage /></SuspenseRoute>} />
    <Route path="/templates" element={<SuspenseRoute><Pages.TemplatesPage /></SuspenseRoute>} />
    <Route path="/community" element={<SuspenseRoute><Pages.CommunityPage /></SuspenseRoute>} />
    <Route path="/press" element={<SuspenseRoute><Pages.PressPage /></SuspenseRoute>} />
    
    {/* Static Feature Pages */}
    <Route path="/features/project-management" element={<SuspenseRoute><Pages.ProjectManagementFeature /></SuspenseRoute>} />
    <Route path="/features/crm" element={<SuspenseRoute><Pages.CRMFeature /></SuspenseRoute>} />
    <Route path="/features/hr-management" element={<SuspenseRoute><Pages.HRManagementFeature /></SuspenseRoute>} />
    <Route path="/features/financial-management" element={<SuspenseRoute><Pages.FinancialManagementFeature /></SuspenseRoute>} />
    <Route path="/features/invoicing-billing" element={<SuspenseRoute><Pages.InvoicingBillingFeature /></SuspenseRoute>} />
    <Route path="/features/time-tracking" element={<SuspenseRoute><Pages.TimeTrackingFeature /></SuspenseRoute>} />
    <Route path="/features/team-collaboration" element={<SuspenseRoute><Pages.TeamCollaborationFeature /></SuspenseRoute>} />
    <Route path="/features/reporting-analytics" element={<SuspenseRoute><Pages.ReportingAnalyticsFeature /></SuspenseRoute>} />
    <Route path="/features/inventory-management" element={<SuspenseRoute><Pages.InventoryManagementFeature /></SuspenseRoute>} />
    <Route path="/features/client-portal" element={<SuspenseRoute><Pages.ClientPortalFeature /></SuspenseRoute>} />

    {/* Dynamic Feature Pages */}
    <Route path="/features/:slug" element={<SuspenseRoute><Pages.FeatureDetail /></SuspenseRoute>} />

    {/* Blog Routes */}
    <Route path="/blog" element={<SuspenseRoute><Pages.BlogList /></SuspenseRoute>} />
    <Route path="/blog/:slug" element={<SuspenseRoute><Pages.BlogPostDetail /></SuspenseRoute>} />
  </Route>
);

