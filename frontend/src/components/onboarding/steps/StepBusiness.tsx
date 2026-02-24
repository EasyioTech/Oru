import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, CreditCard, Mail } from 'lucide-react';
import { OnboardingFormData, INDUSTRIES, COMPANY_SIZES, INDUSTRY_COLORS } from '../fragments/types';
import { cn } from '@/lib/utils';

interface StepBusinessProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  setCanProceed: (can: boolean) => void;
}

export default function StepBusiness({ formData, updateFormData, setCanProceed }: StepBusinessProps) {
  useEffect(() => {
    setCanProceed(!!(
      formData.industry &&
      formData.companySize &&
      formData.streetAddress &&
      formData.city
    ));
  }, [formData.industry, formData.companySize, formData.streetAddress, formData.city, setCanProceed]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-[-0.02em]">
          Tell us about your business
        </h1>
        <p className="mt-3 text-lg text-zinc-500">
          This helps us customize your workspace experience.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <label className="text-sm text-zinc-400">Industry</label>
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
                      ? selectedClasses
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-zinc-300'
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
          <label className="text-sm text-zinc-400">Team Size</label>
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
                      ? `bg-gradient-to-br ${size.color} border-white/20 text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.08)]`
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-zinc-300'
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
        <div className="space-y-6 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-white font-medium">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Office Location & Billing
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Street Address</label>
                <input
                  value={formData.streetAddress}
                  onChange={(e) => updateFormData({ streetAddress: e.target.value })}
                  placeholder="123 Business Way, Suite 100"
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">City</label>
                <input
                  value={formData.city}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">State / Region</label>
                <input
                  value={formData.state}
                  onChange={(e) => updateFormData({ state: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Postal Code</label>
                <input
                  value={formData.postalCode}
                  onChange={(e) => updateFormData({ postalCode: e.target.value })}
                  placeholder="400001"
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Tax ID / PAN (Optional)</label>
                <input
                  value={formData.taxId}
                  onChange={(e) => updateFormData({ taxId: e.target.value })}
                  placeholder="ABCDE1234F"
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Billing email (if different)
              </label>
              <input
                value={formData.billingEmail}
                onChange={(e) => updateFormData({ billingEmail: e.target.value })}
                placeholder="accounts@company.com"
                className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-all"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {formData.industry && formData.companySize && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
        >
          <p className="text-sm text-emerald-400/80">
            We'll optimize your workspace for {INDUSTRIES.find(i => i.value === formData.industry)?.label.toLowerCase()} teams.
          </p>
        </motion.div>
      )}
    </div>
  );
}
