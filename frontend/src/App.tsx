/**
 * Main App Component
 * Provides app-wide providers and routing configuration
 */
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ViewAsUserProvider } from "@/contexts/ViewAsUserContext";
import { AuthRedirect } from "@/core/auth/AuthRedirect";
import { ErrorBoundary } from "@/core/layout/ErrorBoundary";
import { TicketFloatingButton } from "@/components/shared/TicketFloatingButton";
import { ScrollToTop } from "@/core/layout/ScrollToTop";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import HoverReceiver from "tooling/visual-edits/VisualEditsMessenger";
import { ThemeSync } from "@/core/layout/ThemeSync";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { AppRoutes } from "@/routes";
import { NuqsAdapter } from 'nuqs/adapters/react-router';

// Initialize console logger on app load
import "@/utils/consoleLogger";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading: authLoading, isSystemSuperAdmin, userRole } = useAuth();
  // Load and apply system settings (SEO, analytics, branding, etc.) - only for super admins
  // For agency admins, this will fail silently as they don't have access to system settings
  useSystemSettings();

  return (
    <>
      <ThemeSync />
      <BrowserRouter>
        <NuqsAdapter>
          <ScrollToTop />
          <AuthRedirect />
          {!authLoading && user && <TicketFloatingButton />}
          <AppRoutes />
        </NuqsAdapter>
      </BrowserRouter>
    </>
  );
};

import { HelmetProvider } from "react-helmet-async";
import { MinimalToastContainer } from "@/components/shared/MinimalToast";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        storageKey="oru-theme"
        enableColorScheme
        disableTransitionOnChange
      >
        <TooltipProvider>
          <MinimalToastContainer />
          <HoverReceiver />
          <ErrorBoundary>
            <BrandingProvider>
              <AuthProvider>
                <ViewAsUserProvider>
                  <AppContent />
                </ViewAsUserProvider>
              </AuthProvider>
            </BrandingProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
