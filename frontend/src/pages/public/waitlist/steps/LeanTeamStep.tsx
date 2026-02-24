import { motion } from 'framer-motion';
import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import type { WaitlistFormData } from '../useWaitlistForm';

interface Props {
    formData: WaitlistFormData;
    togglePainPoint: (value: string, max?: number) => void;
    onNext: () => void;
    onBack: () => void;
}

const painPoints = [
    { id: 'asset-scatter', label: 'Searching for assets scattered across Google Drive, local folders, and WhatsApp', description: 'You waste hours every week finding the right version of a file.' },
    { id: 'payment-chase', label: 'Chasing delayed client payments and manually formatting invoices', description: 'Revenue leaks because invoicing is a manual nightmare.' },
    { id: 'task-tracking', label: 'Tracking exactly who is working on what task and their progress', description: "You can't see bandwidth until someone burns out." },
];

export default function LeanTeamStep({ formData, togglePainPoint, onNext, onBack }: Props) {
    const canProceed = formData.painPoints.length > 0;
    const atMax = formData.painPoints.length >= 2;

    return (
        <div className="space-y-10">
            <div className="text-center space-y-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
                >
                    <Zap className="w-3 h-3" />
                    Lean Team Pathway
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">
                    Which fragmented workflow slows you down?
                </h2>
                <p className="text-[13px] text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
                    Select up to <strong className="text-foreground">2</strong> that resonate with your daily operations.
                </p>
            </div>

            <div className="grid gap-2.5">
                {painPoints.map((point, i) => {
                    const isSelected = formData.painPoints.includes(point.id);
                    return (
                        <motion.button
                            key={point.id}
                            onClick={() => togglePainPoint(point.id, 2)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                            className={`relative flex items-start gap-4 w-full p-5 rounded-2xl border text-left transition-all duration-300 ${isSelected ? 'border-foreground/20 bg-foreground/[0.04] shadow-[0_0_0_1px_hsl(var(--foreground)/0.08)]' : 'border-border/40 bg-transparent hover:border-border/60 hover:bg-muted/20'} ${atMax && !isSelected ? 'opacity-40 blur-[0.5px]' : ''}`}
                        >
                            <div className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${isSelected ? 'border-foreground bg-foreground' : 'border-border/60'}`}>
                                {isSelected && (
                                    <svg className="w-[10px] h-[10px] text-background" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-[13px] font-semibold leading-snug transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/70'}`}>{point.label}</div>
                                <div className="text-[11px] text-muted-foreground/50 mt-1.5 leading-relaxed">{point.description}</div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            <div className="flex gap-3">
                <button onClick={onBack} className="px-5 py-3.5 rounded-2xl border border-border/40 text-[13px] font-medium text-muted-foreground hover:bg-muted/30 hover:border-border/60 transition-all flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <motion.button
                    onClick={onNext}
                    disabled={!canProceed}
                    whileHover={canProceed ? { scale: 1.005 } : {}}
                    whileTap={canProceed ? { scale: 0.995 } : {}}
                    className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${canProceed ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]' : 'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'}`}
                >
                    Continue <ArrowRight className={`w-4 h-4 transition-opacity ${canProceed ? 'opacity-100' : 'opacity-0'}`} />
                </motion.button>
            </div>
        </div>
    );
}
