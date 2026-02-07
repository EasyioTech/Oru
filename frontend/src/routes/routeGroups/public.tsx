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
  <Route key="/forgot-password" path="/forgot-password" element={<SuspenseRoute><Pages.ForgotPassword /></SuspenseRoute>} />,
  <Route key="/login" path="/login" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/register" path="/register" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
];

/**
 * Static Pages Routes
 */
export const StaticPageRoutes = () => [
  <Route key="/contact" path="/contact" element={<SuspenseRoute><Pages.ContactPage /></SuspenseRoute>} />,
  <Route key="/about" path="/about" element={<SuspenseRoute><Pages.AboutPage /></SuspenseRoute>} />,
  <Route key="/blog" path="/blog" element={<SuspenseRoute><Pages.BlogPage /></SuspenseRoute>} />,
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
];
