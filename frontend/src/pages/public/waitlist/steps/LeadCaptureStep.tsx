import { motion } from 'framer-motion';
import { Send, User, Building, Phone, Mail, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import type { WaitlistFormData } from '../useWaitlistForm';

interface Props {
    formData: WaitlistFormData;
    setField: (field: keyof WaitlistFormData, value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
    submitError: string | null;
}

const fields = [
    { key: 'name' as const, label: 'Your Name', placeholder: 'e.g. Arjun Mehta', icon: User, type: 'text' },
    { key: 'businessName' as const, label: 'Business Name', placeholder: 'e.g. Pixel Pulse Agency', icon: Building, type: 'text' },
    { key: 'contact' as const, label: 'Contact Number', placeholder: '+91 98765 43210', icon: Phone, type: 'tel' },
    { key: 'email' as const, label: 'Email Address', placeholder: 'arjun@pixelpulse.in', icon: Mail, type: 'email' },
];

export default function LeadCaptureStep({ formData, setField, onSubmit, onBack, isSubmitting, submitError }: Props) {
    const canSubmit = formData.name && formData.email && formData.contact && !isSubmitting;

    return (
        <div className="space-y-10">
            <div className="text-center space-y-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
                >
                    <Send className="w-3 h-3" />
                    Almost There
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">
                    Where should we send your invite?
                </h2>
                <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Your configuration details and early access invite will land in your inbox.
                </p>
            </div>

            <div className="space-y-4">
                {fields.map((field, i) => {
                    const Icon = field.icon;
                    return (
                        <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className="space-y-2"
                        >
                            <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                                {field.label}
                            </label>
                            <div className="relative">
                                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type={field.type}
                                    value={formData[field.key] as string}
                                    onChange={(e) => setField(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-border bg-transparent text-foreground text-[13px] font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-destructive/5 border border-destructive/15 text-destructive text-[13px] font-medium"
                >
                    {submitError}
                </motion.div>
            )}

            {/* Trust Signal */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
                <Shield className="w-3 h-3" />
                <span>Your data is encrypted and will never be shared</span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            <div className="flex gap-3">
                <button onClick={onBack} className="px-5 py-3.5 rounded-2xl border border-border/40 text-[13px] font-medium text-muted-foreground hover:bg-muted/30 hover:border-border/60 transition-all flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <motion.button
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { scale: 1.005 } : {}}
                    whileTap={canSubmit ? { scale: 0.995 } : {}}
                    className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${canSubmit ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]' : 'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'}`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            Submitting...
                        </span>
                    ) : (
                        <>Secure My Spot <ArrowRight className="w-4 h-4" /></>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
