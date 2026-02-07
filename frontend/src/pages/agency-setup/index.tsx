import { Loader2 } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSetupStatus } from './hooks/useSetupStatus';
import { usePrefillSettings } from './hooks/usePrefillSettings';
import { useAgencySetupForm } from './hooks/useAgencySetupForm';
import {
  SetupProgressHeader,
  SetupNavigationButtons,
  CompanyProfileStep,
  BusinessDetailsStep,
  DepartmentsStep,
  FinancialStep,
  TeamMembersStep,
  PreferencesStep,
  ReviewStep,
} from './components';

export default function AgencySetup() {
  const { isCheckingSetup, setupComplete } = useSetupStatus();
  const {
    formData,
    setFormData,
    currentStep,
    isLoading,
    logoPreview,
    setLogoPreview,
    handleNext,
    handleBack,
    handleLogoUpload,
    handleComplete,
  } = useAgencySetupForm();

  usePrefillSettings(setFormData, setLogoPreview);

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return null;
  }

  const totalSteps = 7;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Agency Setup</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Configure your workspace settings</p>
            </div>
          </div>
        </div>

        <SetupProgressHeader currentStep={currentStep} />

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-20 md:mb-0">
          <CardContent className="p-4 md:p-6 lg:p-8">
            {currentStep === 1 && (
              <CompanyProfileStep
                formData={formData}
                setFormData={setFormData}
                logoPreview={logoPreview}
                onLogoUpload={handleLogoUpload}
              />
            )}
            {currentStep === 2 && <BusinessDetailsStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <DepartmentsStep formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <FinancialStep formData={formData} setFormData={setFormData} />}
            {currentStep === 5 && <TeamMembersStep formData={formData} setFormData={setFormData} />}
            {currentStep === 6 && <PreferencesStep formData={formData} setFormData={setFormData} />}
            {currentStep === 7 && <ReviewStep formData={formData} />}

            <SetupNavigationButtons
              currentStep={currentStep}
              isLoading={isLoading}
              onBack={handleBack}
              onNext={handleNext}
              onComplete={handleComplete}
            />
          </CardContent>
        </Card>

        <SetupNavigationButtons
          currentStep={currentStep}
          isLoading={isLoading}
          onBack={handleBack}
          onNext={handleNext}
          onComplete={handleComplete}
          isMobile
        />
      </div>
    </div>
  );
}
