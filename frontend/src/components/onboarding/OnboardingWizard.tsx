import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getApiBaseUrl } from '@/config/api';
import { logError, logInfo } from '@/utils/consoleLogger';
import { cn } from '@/lib/utils';

import { GridPattern } from '@/components/landing/fragments/Backgrounds';
import { OnboardingFormData, initialFormData, ONBOARDING_STEPS } from './fragments/types';
import StepIdentity from './steps/StepIdentity';
import StepBusiness from './steps/StepBusiness';
import StepAdmin from './steps/StepAdmin';
import StepLaunch from './steps/StepLaunch';

/**
 * Creation progress states
 */
type CreationStatus = 'idle' | 'creating' | 'success' | 'error';

interface CreationProgress {
  status: CreationStatus;
  step: string;
  error: string | null;
  canRetry: boolean;
}

/**
 * Progress messages for creation steps
 */
const CREATION_STEPS = [
  'Validating information...',
  'Creating your workspace...',
  'Setting up database...',
  'Configuring features...',
  'Creating admin account...',
  'Finalizing setup...',
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  
  // Creation progress tracking
  const [creationProgress, setCreationProgress] = useState<CreationProgress>({
    status: 'idle',
    step: '',
    error: null,
    canRetry: false,
  });
  const [progressIndex, setProgressIndex] = useState(0);

  // Load saved draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('onboarding_draft_v2');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        logError('Error loading draft:', error);
      }
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    const draft = { formData, currentStep };
    localStorage.setItem('onboarding_draft_v2', JSON.stringify(draft));
  }, [formData, currentStep]);

  // Animate progress steps during creation
  useEffect(() => {
    if (creationProgress.status === 'creating' && progressIndex < CREATION_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setProgressIndex(prev => prev + 1);
        setCreationProgress(prev => ({
          ...prev,
          step: CREATION_STEPS[progressIndex + 1],
        }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [creationProgress.status, progressIndex]);

  const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length && canProceed) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceed]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const domainFull = `${formData.domain}${formData.domainSuffix}`;

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setProgressIndex(0);
    setCreationProgress({
      status: 'creating',
      step: CREATION_STEPS[0],
      error: null,
      canRetry: false,
    });

    try {
      logInfo('Starting agency creation', {
        agencyName: formData.agencyName,
        domain: domainFull,
      });

      const idempotencyKey = `onboarding:${domainFull}:${formData.adminEmail}`;
      const response = await fetch(`${getApiBaseUrl()}/api/agencies/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          agencyName: formData.agencyName,
          domain: domainFull,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          industry: formData.industry,
          companySize: formData.companySize,
          primaryFocus: formData.primaryFocus,
          country: formData.country,
          timezone: formData.timezone,
          enableGST: formData.enableGST,
          subscriptionPlan: formData.subscriptionPlan,
        }),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const result = isJson ? await response.json() : { error: await response.text() };

      if (!response.ok || !result.success) {
        const errorMessage = result.error || result.message || 'Failed to create agency';
        const canRetry =
          !errorMessage.toLowerCase().includes('domain') &&
          !errorMessage.toLowerCase().includes('already');
        setCreationProgress({ status: 'error', step: '', error: errorMessage, canRetry });
        throw new Error(errorMessage);
      }

      // 202 Accepted: async provisioning — poll until completed or failed
      if (response.status === 202 && result.jobId) {
        setCreationProgress((prev) => ({ ...prev, step: 'Provisioning agency...' }));
        const maxAttempts = 150;
        const pollIntervalMs = 2000;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          const pollRes = await fetch(
            `${getApiBaseUrl()}/api/agencies/provisioning/${result.jobId}`
          );
          if (!pollRes.ok) {
            const errMsg = `Provisioning check failed (${pollRes.status}). Please try again.`;
            setCreationProgress({ status: 'error', step: '', error: errMsg, canRetry: true });
            throw new Error(errMsg);
          }
          const pollJson = await pollRes.json();
          const data = pollJson?.data ?? pollJson;
          const status = data?.status;
          if (status === 'completed') {
            const agencyResult = data?.result ?? result;
            setCreationProgress({
              status: 'success',
              step: 'Agency created successfully!',
              error: null,
              canRetry: false,
            });
            logInfo('Agency created successfully', {
              agencyId: agencyResult.agency?.id,
              databaseName: agencyResult.agency?.databaseName,
            });
            localStorage.removeItem('onboarding_draft_v2');
            await new Promise((r) => setTimeout(r, 1000));
            const workspaceDomain = agencyResult.agency?.domain ?? domainFull;
            await signIn(formData.adminEmail, formData.adminPassword, workspaceDomain);
            toast({ title: 'Welcome aboard!', description: 'Your agency workspace is ready.' });
            navigate('/agency');
            return;
          }
          if (status === 'failed') {
            const errMsg = data?.error || 'Agency provisioning failed';
            const canRetry =
              !String(errMsg).toLowerCase().includes('domain') &&
              !String(errMsg).toLowerCase().includes('already');
            setCreationProgress({ status: 'error', step: '', error: errMsg, canRetry });
            throw new Error(errMsg);
          }
          setCreationProgress((prev) => ({
            ...prev,
            step: `Provisioning agency... (${attempt + 1})`,
          }));
        }
        setCreationProgress({
          status: 'error',
          step: '',
          error: 'Provisioning is taking longer than expected. Please check your agency status later.',
          canRetry: true,
        });
        throw new Error('Provisioning timeout');
      }

      // 200 OK: immediate success (idempotent or legacy)
      setCreationProgress({
        status: 'success',
        step: 'Agency created successfully!',
        error: null,
        canRetry: false,
      });
      logInfo('Agency created successfully', {
        agencyId: result.agency?.id,
        databaseName: result.agency?.databaseName,
      });
      localStorage.removeItem('onboarding_draft_v2');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const workspaceDomain = result.agency?.domain ?? domainFull;
      await signIn(formData.adminEmail, formData.adminPassword, workspaceDomain);
      toast({ title: 'Welcome aboard!', description: 'Your agency workspace is ready.' });
      navigate('/agency');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create agency. Please try again.';
      logError('Agency creation error:', error);
      if (creationProgress.status !== 'error') {
        toast({ title: 'Something went wrong', description: errorMessage, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, domainFull, signIn, navigate, toast, creationProgress.status]);

  const handleRetry = useCallback(() => {
    setCreationProgress({
      status: 'idle',
      step: '',
      error: null,
      canRetry: false,
    });
    handleSubmit();
  }, [handleSubmit]);

  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -40 : 40,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepIdentity
            formData={formData}
            updateFormData={updateFormData}
            setCanProceed={setCanProceed}
          />
        );
      case 2:
        return (
          <StepBusiness
            formData={formData}
            updateFormData={updateFormData}
            setCanProceed={setCanProceed}
          />
        );
      case 3:
        return (
          <StepAdmin
            formData={formData}
            updateFormData={updateFormData}
            setCanProceed={setCanProceed}
          />
        );
      case 4:
        return (
          <StepLaunch
            formData={formData}
            isLoading={isLoading}
            setCanProceed={setCanProceed}
          />
        );
      default:
        return null;
    }
  };

  // Render creation progress overlay
  const renderCreationOverlay = () => {
    if (creationProgress.status === 'idle') return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      >
        <div className="max-w-md w-full mx-6 text-center">
          {creationProgress.status === 'creating' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Creating Your Agency
              </h2>
              <p className="text-zinc-400 mb-6">
                {creationProgress.step}
              </p>
              <div className="flex justify-center gap-1">
                {CREATION_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      idx <= progressIndex ? "bg-white" : "bg-zinc-700"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {creationProgress.status === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Agency Created!
              </h2>
              <p className="text-zinc-400">
                Redirecting to your dashboard...
              </p>
            </motion.div>
          )}

          {creationProgress.status === 'error' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Creation Failed
              </h2>
              <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                {creationProgress.error}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setCreationProgress(prev => ({ ...prev, status: 'idle' }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Go Back
                </button>
                {creationProgress.canRetry && (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#000000] text-white antialiased selection:bg-blue-500/20 overflow-hidden">
      <GridPattern />

      {/* Creation Progress Overlay */}
      <AnimatePresence>
        {renderCreationOverlay()}
      </AnimatePresence>

      {/* Header with progress - wide container, generous padding and gaps */}
      <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0 bg-[#000000]/80 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-7">
          <div className="flex items-center justify-between gap-6 sm:gap-8">
            <button
              onClick={() => {
                localStorage.removeItem('onboarding_draft_v2');
                navigate('/');
              }}
              disabled={isLoading}
              className={cn(
                "text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-2 py-2 -my-1 rounded-lg hover:bg-white/5 min-w-[4rem] sm:min-w-0",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <X className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-center min-w-0">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 flex-shrink-0",
                      currentStep > step.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : currentStep === step.id
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    )}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-6 sm:w-8 h-[2px] mx-1.5 sm:mx-2 flex-shrink-0 transition-colors duration-300",
                        currentStep > step.id ? "bg-emerald-500/30" : "bg-zinc-800"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-zinc-500 tabular-nums min-w-[2.5rem] text-right py-2 -my-1">
              {currentStep}/{ONBOARDING_STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - scrollable area, same max-width as header/footer for consistency */}
      <main
        className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-24 sm:pt-28 pb-32 sm:pb-36 px-6 sm:px-8 lg:px-12"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-4xl mx-auto w-full py-6 sm:py-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with navigation - wide container, generous padding and gaps */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex-shrink-0 bg-[#000000]/80 backdrop-blur-sm border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-7">
          <div className="flex items-center justify-between gap-6 sm:gap-10">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className={cn(
                "flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl text-sm font-medium transition-all min-h-12",
                currentStep === 1 || isLoading
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              Back
            </button>

            {currentStep < ONBOARDING_STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className={cn(
                  "flex items-center gap-2.5 px-7 sm:px-8 py-3 rounded-xl text-sm font-medium transition-all min-h-12",
                  canProceed && !isLoading
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                Continue
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isLoading}
                className={cn(
                  "flex items-center gap-2.5 px-8 sm:px-10 py-3 rounded-xl text-sm font-medium transition-all min-h-12",
                  canProceed && !isLoading
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    Creating...
                  </>
                ) : (
                  <>
                    Launch Agency
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
