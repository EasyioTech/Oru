/**
 * StepIdentity - Agency Name & URL Step
 * 
 * First step in agency creation wizard.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { getApiBaseUrl } from '@/config/api';
import { OnboardingFormData, DOMAIN_SUFFIXES } from '../fragments/types';
import { 
  validateAgencyName, 
  validateDomainFormat, 
  generateSlugFromName,
  NAME_CONSTRAINTS,
  DOMAIN_CONSTRAINTS,
} from '../utils/validation';
import { cn } from '@/lib/utils';

interface StepIdentityProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  setCanProceed: (can: boolean) => void;
}

type DomainStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function StepIdentity({ 
  formData, 
  updateFormData, 
  setCanProceed 
}: StepIdentityProps) {
  const [domainStatus, setDomainStatus] = useState<DomainStatus>('idle');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [domainTouched, setDomainTouched] = useState(false);
  const [domainManuallyEdited, setDomainManuallyEdited] = useState(false);
  
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Check domain availability via API
  const checkDomain = useCallback(async (domain: string) => {
    // Client-side validation first
    const clientValidation = validateDomainFormat(domain);
    if (!clientValidation.valid) {
      setDomainStatus('error');
      setDomainError(clientValidation.error || 'Invalid URL');
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setDomainStatus('checking');
    setDomainError(null);

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/agencies/check-domain?domain=${encodeURIComponent(domain)}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();

      if (data.available) {
        setDomainStatus('available');
        setDomainError(null);
      } else {
        setDomainStatus('taken');
        setDomainError(data.error || 'This URL is not available');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setDomainStatus('error');
      setDomainError('Could not check availability');
    }
  }, []);

  // Debounced domain check
  useEffect(() => {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    
    if (!formData.domain || formData.domain.length < DOMAIN_CONSTRAINTS.MIN_LENGTH) {
      setDomainStatus('idle');
      setDomainError(null);
      return;
    }

    checkTimeoutRef.current = setTimeout(() => checkDomain(formData.domain), 400);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [formData.domain, checkDomain]);

  // Validate and update canProceed
  useEffect(() => {
    const nameValid = validateAgencyName(formData.agencyName);
    setNameError(nameTouched && !nameValid.valid ? nameValid.error || null : null);

    const hasValidName = nameValid.valid;
    const hasMinDomain = formData.domain.length >= DOMAIN_CONSTRAINTS.MIN_LENGTH;
    const domainOk = domainStatus === 'available' || domainStatus === 'idle';
    const notChecking = domainStatus !== 'checking';

    setCanProceed(hasValidName && hasMinDomain && domainOk && notChecking);
  }, [formData.agencyName, formData.domain, domainStatus, nameTouched, setCanProceed]);

  // Handle name change
  const handleNameChange = (value: string) => {
    updateFormData({ agencyName: value });
    
    // Auto-generate domain if not manually edited
    if (!domainManuallyEdited) {
      const slug = generateSlugFromName(value);
      if (slug) updateFormData({ domain: slug });
    }
  };

  // Handle domain change
  const handleDomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, DOMAIN_CONSTRAINTS.MAX_LENGTH);
    updateFormData({ domain: sanitized });
    setDomainManuallyEdited(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Name your agency
          </h1>
        </div>
        <p className="text-zinc-400">
          Choose a name and claim your workspace URL.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Agency Name */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="agency-name" className="text-sm font-medium text-zinc-300">
              Agency Name <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-zinc-500">
              {formData.agencyName.length}/{NAME_CONSTRAINTS.MAX_LENGTH}
            </span>
          </div>
          
          <input
            id="agency-name"
            type="text"
            value={formData.agencyName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="e.g., Acme Corporation"
            className={cn(
              "w-full h-12 px-4 rounded-lg bg-white/[0.03] border text-white",
              "placeholder:text-zinc-600 focus:outline-none transition-colors",
              nameTouched && nameError
                ? "border-red-500/50"
                : "border-white/[0.08] focus:border-white/[0.15]"
            )}
            autoFocus
            maxLength={NAME_CONSTRAINTS.MAX_LENGTH}
          />
          
          <AnimatePresence>
            {nameTouched && nameError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {nameError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace URL */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="workspace-url" className="text-sm font-medium text-zinc-300">
              Workspace URL <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-zinc-500">
              {formData.domain.length}/{DOMAIN_CONSTRAINTS.MAX_LENGTH}
            </span>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="workspace-url"
                type="text"
                value={formData.domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                onBlur={() => setDomainTouched(true)}
                placeholder="acme-corp"
                className={cn(
                  "w-full h-12 px-4 pr-10 rounded-lg bg-white/[0.03] border text-white",
                  "font-mono text-sm placeholder:text-zinc-600 focus:outline-none transition-colors",
                  domainStatus === 'available' ? "border-emerald-500/50" :
                  (domainStatus === 'taken' || domainStatus === 'error') ? "border-red-500/50" :
                  "border-white/[0.08] focus:border-white/[0.15]"
                )}
                maxLength={DOMAIN_CONSTRAINTS.MAX_LENGTH}
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {domainStatus === 'checking' && (
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                )}
                {domainStatus === 'available' && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                {(domainStatus === 'taken' || domainStatus === 'error') && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            <select
              value={formData.domainSuffix}
              onChange={(e) => updateFormData({ domainSuffix: e.target.value })}
              className="h-12 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none cursor-pointer"
            >
              {DOMAIN_SUFFIXES.map((s) => (
                <option key={s.value} value={s.value} className="bg-zinc-900">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Domain Status */}
          <div className="min-h-[20px]">
            <AnimatePresence mode="wait">
              {domainStatus === 'checking' && (
                <motion.p
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-zinc-500"
                >
                  Checking availability...
                </motion.p>
              )}
              {domainStatus === 'available' && (
                <motion.p
                  key="available"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-emerald-400 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Available
                </motion.p>
              )}
              {(domainStatus === 'taken' || domainStatus === 'error') && domainError && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> {domainError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview */}
        <div className={cn(
          "p-4 rounded-xl border transition-colors",
          domainStatus === 'available'
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-white/[0.02] border-white/[0.06]"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              domainStatus === 'available' ? "bg-emerald-500/10" : "bg-white/[0.05]"
            )}>
              <Globe className={cn(
                "w-5 h-5",
                domainStatus === 'available' ? "text-emerald-400" : "text-zinc-400"
              )} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Your workspace</p>
              <p className="text-sm font-mono text-white">
                {formData.domain || 'your-agency'}
                <span className="text-blue-400">{formData.domainSuffix}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
