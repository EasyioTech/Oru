import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, Mail } from 'lucide-react';
import { OnboardingFormData } from '../fragments/types';
import { cn } from '@/lib/utils';

/** Slugify name for email local part: lowercase, alphanumeric only */
function slugForEmail(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Build company email from first + last name and domain (e.g. john.doe@acme.app) */
function buildCompanyEmail(first: string, last: string, domainFull: string): string {
  const firstPart = slugForEmail(first);
  const lastPart = slugForEmail(last);
  if (!domainFull) return '';
  const local = [firstPart, lastPart].filter(Boolean).join('.') || 'admin';
  return `${local}@${domainFull}`;
}

interface StepAdminProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  setCanProceed: (can: boolean) => void;
}

export default function StepAdmin({ formData, updateFormData, setCanProceed }: StepAdminProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const domainFull = `${formData.domain || ''}${formData.domainSuffix || ''}`.toLowerCase();
  const companyEmail = useMemo(
    () => buildCompanyEmail(formData.adminFirstName, formData.adminLastName, domainFull),
    [formData.adminFirstName, formData.adminLastName, domainFull]
  );

  const migratedRef = useRef(false);
  // Migrate old draft: if adminName is set but first/last empty, split into first and last (once)
  useEffect(() => {
    if (migratedRef.current) return;
    const firstEmpty = !formData.adminFirstName?.trim();
    const lastEmpty = !formData.adminLastName?.trim();
    const nameFilled = formData.adminName?.trim();
    if (firstEmpty && lastEmpty && nameFilled) {
      migratedRef.current = true;
      const parts = nameFilled.split(/\s+/);
      const adminFirstName = parts[0] ?? '';
      const adminLastName = parts.slice(1).join(' ') ?? '';
      updateFormData({ adminFirstName, adminLastName });
    }
  }, [formData.adminName, formData.adminFirstName, formData.adminLastName, updateFormData]);

  // Sync derived adminName and adminEmail when first/last or domain change
  useEffect(() => {
    const name = [formData.adminFirstName, formData.adminLastName].filter(Boolean).join(' ').trim();
    const email = companyEmail;
    updateFormData({ adminName: name, adminEmail: email });
  }, [formData.adminFirstName, formData.adminLastName, companyEmail]);

  const validation = useMemo(() => {
    const passwordLength = formData.adminPassword.length >= 8;
    const passwordHasNumber = /\d/.test(formData.adminPassword);
    const passwordHasLetter = /[a-zA-Z]/.test(formData.adminPassword);
    const passwordsMatch = formData.adminPassword === formData.confirmPassword && formData.confirmPassword.length > 0;

    return {
      firstName: formData.adminFirstName.trim().length >= 1,
      lastName: formData.adminLastName.trim().length >= 1,
      email: companyEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail),
      passwordLength,
      passwordHasNumber,
      passwordHasLetter,
      passwordValid: passwordLength && passwordHasNumber && passwordHasLetter,
      passwordsMatch,
    };
  }, [formData.adminFirstName, formData.adminLastName, formData.adminPassword, formData.confirmPassword, companyEmail]);

  useEffect(() => {
    setCanProceed(!!(
      validation.firstName &&
      validation.lastName &&
      validation.email &&
      validation.passwordValid &&
      validation.passwordsMatch
    ));
  }, [validation, setCanProceed]);

  const inputClass = cn(
    "w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white",
    "placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05]",
    "transition-all duration-200"
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-[-0.02em]">
          Create your account
        </h1>
        <p className="mt-3 text-lg text-zinc-500">
          Enter your name — your company email will be generated automatically.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">First Name</label>
            <input
              value={formData.adminFirstName}
              onChange={(e) => updateFormData({ adminFirstName: e.target.value })}
              placeholder="John"
              className={inputClass}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Last Name</label>
            <input
              value={formData.adminLastName}
              onChange={(e) => updateFormData({ adminLastName: e.target.value })}
              placeholder="Smith"
              className={inputClass}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            Company email
          </label>
          <div
            className={cn(
              inputClass,
              "flex items-center text-zinc-400 cursor-default",
              !companyEmail && "text-zinc-600"
            )}
          >
            {companyEmail ? (
              <span className="truncate">{companyEmail}</span>
            ) : (
              <span>Enter first and last name — email will appear here</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.adminPassword}
              onChange={(e) => updateFormData({ adminPassword: e.target.value })}
              placeholder="Create a password"
              className={cn(inputClass, "pr-12")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {formData.adminPassword && (
            <div className="flex gap-4 text-xs pt-1">
              <span className={validation.passwordLength ? "text-emerald-400" : "text-zinc-600"}>
                8+ chars
              </span>
              <span className={validation.passwordHasLetter ? "text-emerald-400" : "text-zinc-600"}>
                Letters
              </span>
              <span className={validation.passwordHasNumber ? "text-emerald-400" : "text-zinc-600"}>
                Numbers
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              placeholder="Confirm password"
              className={cn(
                inputClass, 
                "pr-12",
                formData.confirmPassword && !validation.passwordsMatch && "border-red-500/30"
              )}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {formData.confirmPassword && (
            <p className={cn(
              "text-xs flex items-center gap-1",
              validation.passwordsMatch ? "text-emerald-400" : "text-red-400"
            )}>
              {validation.passwordsMatch ? (
                <><Check className="w-3 h-3" /> Passwords match</>
              ) : (
                <><X className="w-3 h-3" /> Passwords don't match</>
              )}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
