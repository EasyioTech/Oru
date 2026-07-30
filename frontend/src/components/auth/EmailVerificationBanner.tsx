/**
 * EmailVerificationBanner
 * Shows a dismissible capsule-style banner when the logged-in user's
 * email is not yet confirmed. Disappears the moment they verify.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailWarning, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resent, setResent] = useState(false);

  // Only show if user is loaded and email is NOT confirmed
  if (!user || user.email_confirmed || dismissed) return null;

  const handleResend = async () => {
    // Placeholder — wire up to your resend-verification API endpoint
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-6 right-6 z-[100] w-[340px] max-w-[calc(100vw-32px)]"
      >
        <div className="relative overflow-hidden flex flex-col gap-3 rounded-xl border border-border bg-card text-card-foreground p-4 shadow-lg">
          
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <MailWarning className="w-4 h-4 text-amber-500" />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="text-sm font-semibold leading-none mb-1.5">
                Verify your email
              </h3>
              <p className="text-[13px] text-muted-foreground leading-snug">
                Please check <span className="font-medium text-foreground">{user.email}</span> to unlock full access.
              </p>
            </div>
          </div>
          
          {/* Action */}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleResend}
              disabled={resent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resent ? 'animate-spin' : ''}`} />
              {resent ? 'Link Sent' : 'Resend Email'}
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
