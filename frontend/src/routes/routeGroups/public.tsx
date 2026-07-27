import { Route } from "react-router-dom";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const PublicRoutes = () => (
  <Route element={<PublicLayout />}>
    <Route path="/" element={<SuspenseRoute><Pages.Landing /></SuspenseRoute>} />
  </Route>
);

export const NonLayoutPublicRoutes = () => [
  <Route key="/auth" path="/auth" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/sauth" path={import.meta.env.VITE_SAUTH_PATH || '/sauth'} element={<SuspenseRoute><Pages.SauthLogin /></SuspenseRoute>} />,
  <Route key="/agency-signup" path="/agency-signup" element={<SuspenseRoute><Pages.OnboardingWizard /></SuspenseRoute>} />,
  <Route key="/signup-success" path="/signup-success" element={<SuspenseRoute><Pages.SignupSuccess /></SuspenseRoute>} />,
  <Route key="/forgot-password" path="/forgot-password" element={<SuspenseRoute><Pages.ForgotPassword /></SuspenseRoute>} />,
  <Route key="/login" path="/login" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/register" path="/register" element={<SuspenseRoute><Pages.Auth /></SuspenseRoute>} />,
  <Route key="/onboarding" path="/onboarding" element={<SuspenseRoute><Pages.OnboardingPage /></SuspenseRoute>} />,
];

export const StaticPageRoutes = () => null;
