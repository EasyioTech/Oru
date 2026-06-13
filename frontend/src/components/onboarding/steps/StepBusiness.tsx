import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnboardingFormData, INDUSTRIES, COMPANY_SIZES, INDUSTRY_COLORS } from '../fragments/types';
import { cn } from '@/lib/utils';

interface StepBusinessProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  setCanProceed: (can: boolean) => void;
}

export default function StepBusiness({ formData, updateFormData, setCanProceed }: StepBusinessProps) {
  useEffect(() => {
    setCanProceed(!!(formData.industry && formData.companySize));
  }, [formData.industry, formData.companySize, setCanProceed]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 tracking-[-0.02em]">
          Tell us about your business
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
          Tell us a bit about your organization so we can tailor your initial dashboard and tools to your specific needs.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Industry</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              const selectedClasses = INDUSTRY_COLORS[industry.colorTheme] ?? INDUSTRY_COLORS.zinc;
              const isSelected = formData.industry === industry.value;
              return (
                <button
                  key={industry.value}
                  type="button"
                  onClick={() => updateFormData({ industry: industry.value })}
                  className={cn(
                    'p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-200',
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  )}
                >
                  <span className="text-xl block mb-1">
                    <Icon className="w-5 h-5 mx-auto" />
                  </span>
                  <span className="text-xs font-medium">{industry.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Team Size</label>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {COMPANY_SIZES.map((size) => {
              const Icon = size.icon;
              const isSelected = formData.companySize === size.value;
              return (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateFormData({ companySize: size.value })}
                  className={cn(
                    'p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-200',
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  )}
                >
                  <span className="text-lg block mb-1">
                    <Icon className="w-5 h-5 mx-auto" />
                  </span>
                  <span className="text-xs block font-medium">{size.label}</span>
                  <span className="text-[10px] block mt-0.5 opacity-80">{size.employees}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {formData.industry && formData.companySize && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-md bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900/50"
        >
          <p className="text-sm text-green-700 dark:text-green-400">
            We'll optimize your workspace for {INDUSTRIES.find(i => i.value === formData.industry)?.label.toLowerCase()} teams.
          </p>
        </motion.div>
      )}
    </div>
  );
}
