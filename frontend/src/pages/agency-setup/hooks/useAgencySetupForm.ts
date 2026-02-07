import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { initialFormData, type AgencySetupFormData } from '../types';
import { SETUP_STEPS } from '../constants';
import { validateStep1, validateStep5 } from '../utils/validation';
import { completeAgencySetup } from '../utils/completeSetup';

export function useAgencySetupForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<AgencySetupFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 1) {
      const result = validateStep1(formData);
      if (!result.valid) {
        toast({ title: 'Validation Error', description: result.message, variant: 'destructive' });
        return;
      }
    } else if (currentStep === 5) {
      const result = validateStep5(formData);
      if (!result.valid) {
        toast({ title: 'Validation Error', description: result.message, variant: 'destructive' });
        return;
      }
    }

    if (currentStep < SETUP_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Logo must be less than 5MB', variant: 'destructive' });
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    const result = validateStep1(formData);
    if (!result.valid) {
      toast({ title: 'Validation Error', description: result.message, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await completeAgencySetup(formData);
      toast({
        title: '🎉 Setup Complete!',
        description: 'Your agency is now fully configured and ready to use.',
      });
      setTimeout(() => navigate('/agency'), 1500);
    } catch (error: unknown) {
      toast({
        title: 'Setup Failed',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
