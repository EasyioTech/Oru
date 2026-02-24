import { motion } from 'framer-motion';
import { Wallet, ArrowLeft, ArrowRight, IndianRupee } from 'lucide-react';
import type { WaitlistFormData } from '../useWaitlistForm';

interface Props {
    formData: WaitlistFormData;
    setField: (field: keyof WaitlistFormData, value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const spendOptions = [
    { id: 'under-15k', label: 'Less than ₹15,000', sub: '/month' },
    { id: '15k-50k', label: '₹15,000 – ₹50,000', sub: '/month' },
    { id: '50k-1l', label: '₹50,000 – ₹1,00,000', sub: '/month' },
    { id: 'over-1l', label: 'More than ₹1,00,000', sub: '/month' },
    { id: 'scared', label: "Honestly, I'm too scared to calculate it", sub: '' },
];

const billingOptions = [
    { id: 'flat', label: 'Flat fee', description: 'Unlimited users, predictable cost' },
    { id: 'per-seat', label: 'Per-seat', description: 'Pay for exact headcount' },
    { id: 'modular', label: 'Modular', description: 'Base + only what you use' },
];

export default function StackSpendStep({ formData, setField, onNext, onBack }: Props) {
    const canProceed = formData.monthlySpend && formData.billingPreference;
    const hasSpendSelection = !!formData.monthlySpend;
    const hasBillingSelection = !!formData.billingPreference;

    return (
        <div className="space-y-8 sm:space-y-10">
            <div className="text-center space-y-4 sm:space-y-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
                >
                    <Wallet className="w-3 h-3" />
                    Stack & Spend
                </motion.div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight">
                    Let's Talk Numbers
                </h2>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
                    Understanding your current spend helps us build pricing you'd actually love.
                </p>
            </div>

            {/* Monthly Spend */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em] pl-1">
                    Monthly software stack spend
                </label>
                <div className="grid gap-2">
                    {spendOptions.map((option, i) => {
                        const isSelected = formData.monthlySpend === option.id;
                        return (
                            <motion.button
                                key={option.id}
                                onClick={() => setField('monthlySpend', option.id)}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.03 }}
                                whileHover={{ scale: 1.005 }}
                                whileTap={{ scale: 0.995 }}
                                className={`
                  flex items-center gap-3 sm:gap-4 w-full px-4 py-3 sm:py-3.5 rounded-2xl border text-left transition-all duration-300
                  ${isSelected
                                        ? 'border-foreground/20 bg-foreground/[0.04] shadow-[0_0_0_1px_hsl(var(--foreground)/0.08)]'
                                        : 'border-border/40 bg-transparent hover:border-border/60 hover:bg-muted/20'
                                    }
                  ${hasSpendSelection && !isSelected ? 'opacity-40 blur-[0.5px]' : ''}
                `}
                            >
                                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? 'border-foreground bg-foreground' : 'border-border/60'}`}>
                                    {isSelected && <div className="w-[6px] h-[6px] rounded-full bg-background" />}
                                </div>
                                <span className={`text-[12px] sm:text-[13px] transition-colors ${isSelected ? 'font-semibold text-foreground' : 'text-foreground/70'}`}>
                                    {option.label}
                                    {option.sub && <span className="text-muted-foreground/40 ml-1 text-[10px] sm:text-[11px]">{option.sub}</span>}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* Billing Model — 3 columns on sm+, stacked on mobile */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em] pl-1">
                    Preferred billing model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {billingOptions.map((option, i) => {
                        const isSelected = formData.billingPreference === option.id;
                        return (
                            <motion.button
                                key={option.id}
                                onClick={() => setField('billingPreference', option.id)}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.04 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                  relative p-4 rounded-2xl border text-center transition-all duration-300
                  ${isSelected
                                        ? 'border-foreground/20 bg-foreground/[0.04] shadow-[0_0_0_1px_hsl(var(--foreground)/0.08)]'
                                        : 'border-border/40 bg-transparent hover:border-border/60 hover:bg-muted/20'
                                    }
                  ${hasBillingSelection && !isSelected ? 'opacity-40 blur-[0.5px]' : ''}
                `}
                            >
                                <div className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/60'}`}>
                                    {option.label}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-muted-foreground/50 mt-1.5 leading-snug">
                                    {option.description}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* No-brainer Price */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em] pl-1">
                    What price would be a "no-brainer"?
                </label>
                <p className="text-[11px] text-muted-foreground/50 pl-1">Optional — helps us nail the pricing.</p>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formData.noBrainerPrice}
                        onChange={(e) => setField('noBrainerPrice', e.target.value.replace(/[^0-9,]/g, ''))}
                        placeholder="e.g. 5,000"
                        className="w-full pl-10 pr-20 py-3.5 sm:py-4 rounded-2xl border border-border/40 bg-transparent text-foreground text-[13px] font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-[11px] font-bold tracking-wide">/ month</span>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            <div className="flex gap-3">
                <button onClick={onBack} className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-border/40 text-[13px] font-medium text-muted-foreground hover:bg-muted/30 hover:border-border/60 transition-all flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <motion.button
                    onClick={onNext}
                    disabled={!canProceed}
                    whileHover={canProceed ? { scale: 1.005 } : {}}
                    whileTap={canProceed ? { scale: 0.995 } : {}}
                    className={`flex-1 py-3 sm:py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${canProceed ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]' : 'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'}`}
                >
                    Continue <ArrowRight className={`w-4 h-4 transition-opacity ${canProceed ? 'opacity-100' : 'opacity-0'}`} />
                </motion.button>
            </div>
        </div>
    );
}
