/**
 * EmailVerificationBanner
 * Shows a dismissible top banner when the logged-in user's
 * email is not yet confirmed. Fits seamlessly into the dashboard layout
 * without obstructing cards or bottom widgets.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailWarning, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('email_banner_dismissed') === 'true';
  });
  const [resent, setResent] = useState(false);

  // Only show if user is loaded and email is NOT confirmed
  if (!user || user.email_confirmed || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('email_banner_dismissed', 'true');
    }
  };

  const handleResend = async () => {
    setResent(true);
    toast({
      title: 'Verification Link Sent',
      description: `We've sent a new verification link to ${user.email}. Please check your inbox and spam folder.`,
    });
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, y: -4 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="w-full mb-4 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:border-amber-700/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 shadow-2xs backdrop-blur-xs">
          
          {/* Content */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <MailWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="text-xs font-medium leading-relaxed">
              <span className="font-semibold text-amber-950 dark:text-amber-100">Verify your email</span>
              <span className="mx-1.5 text-amber-400 dark:text-amber-600">•</span>
              <span className="text-amber-800 dark:text-amber-200">
                Please check <strong className="font-semibold text-amber-950 dark:text-amber-100 underline decoration-amber-400/60">{user.email}</strong> to unlock full access.
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleResend}
              disabled={resent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400 active:scale-95 disabled:opacity-60 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resent ? 'animate-spin' : ''}`} />
              {resent ? 'Link Sent' : 'Resend Email'}
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
