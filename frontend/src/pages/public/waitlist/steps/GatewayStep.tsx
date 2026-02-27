import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Rocket, Lightbulb, ArrowRight } from 'lucide-react';
import type { WaitlistFormData } from '../useWaitlistForm';

interface Props {
    formData: WaitlistFormData;
    setField: (field: keyof WaitlistFormData, value: string) => void;
    onNext: () => void;
}

const businessModels = [
    { id: 'agency', label: 'Digital Agency / IT Services', icon: Building2, description: 'Web, app, marketing, or consulting agency' },
    { id: 'startup', label: 'High-Growth Startup / SaaS', icon: Rocket, description: 'Scaling fast with a product-led business' },
    { id: 'exploring', label: 'Just exploring / Planning to launch', icon: Lightbulb, description: 'Getting ready to start something new' },
];

const teamSizes = [
    { id: '1-10', label: '1–10', sub: 'Employees', tag: 'Small but mighty' },
    { id: '11-40', label: '11–40', sub: 'Employees', tag: 'Growing fast' },
    { id: '40+', label: '40+', sub: 'Employees', tag: 'Scaling operations' },
];

export default function GatewayStep({ formData, setField, onNext }: Props) {
    const canProceed = formData.businessModel && (formData.businessModel === 'exploring' || formData.teamSize);
    const showTeamSize = formData.businessModel && formData.businessModel !== 'exploring';
    const hasBusinessSelection = !!formData.businessModel;
    const hasTeamSelection = !!formData.teamSize;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
                >
                    <Users className="w-3 h-3" />
                    Curated Early Access
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight leading-tight"
                >
                    Configure Your Workspace
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-[13px] sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed"
                >
                    We're rolling out Oru Suite in curated batches. Take 90 seconds to configure — completing this unlocks an exclusive option to <strong className="text-foreground">skip the line</strong>.
                </motion.p>
            </div>

            {/* Q1: Business Model */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                    Your core business model
                </label>
                <div className="grid gap-2.5">
                    {businessModels.map((model, i) => {
                        const Icon = model.icon;
                        const isSelected = formData.businessModel === model.id;
                        return (
                            <motion.button
                                key={model.id}
                                onClick={() => {
                                    setField('businessModel', model.id);
                                    if (model.id === 'exploring') setField('teamSize', '');
                                }}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                whileHover={{ scale: 1.005 }}
                                whileTap={{ scale: 0.995 }}
                                className={`
                  relative flex items-center gap-4 w-full p-4 rounded-2xl border text-left transition-all duration-300
                  ${isSelected
                                        ? 'border-primary/50 bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]'
                                        : 'border-border bg-transparent hover:border-border/80 hover:bg-muted/30'
                                    }
                  ${hasBusinessSelection && !isSelected ? 'opacity-50' : ''}
                `}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-[18px] h-[18px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[13px] font-semibold transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{model.label}</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">{model.description}</div>
                                </div>
                                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? 'border-primary bg-primary' : 'border-border'}`}>
                                    {isSelected && <div className="w-[6px] h-[6px] rounded-full bg-primary-foreground" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Q2: Team Size */}
            <AnimatePresence>
                {showTeamSize && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 40 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-3 overflow-hidden"
                    >
                        <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                            Current team size
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {teamSizes.map((size, i) => {
                                const isSelected = formData.teamSize === size.id;
                                return (
                                    <motion.button
                                        key={size.id}
                                        onClick={() => setField('teamSize', size.id)}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                      relative p-4 rounded-2xl border text-center transition-all duration-300
                      ${isSelected
                                                ? 'border-primary/50 bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]'
                                                : 'border-border bg-transparent hover:border-border/80 hover:bg-muted/30'
                                            }
                      ${hasTeamSelection && !isSelected ? 'opacity-50' : ''}
                    `}
                                    >
                                        <div className={`text-xl font-bold font-display tracking-tight transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{size.label}</div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5">{size.sub}</div>
                                        <div className={`text-[10px] font-medium mt-2 transition-colors ${isSelected ? 'text-foreground/70' : 'text-muted-foreground'}`}>{size.tag}</div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* Next Button */}
            <motion.button
                onClick={onNext}
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.005 } : {}}
                whileTap={canProceed ? { scale: 0.995 } : {}}
                className={`
          w-full py-4 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2
          ${canProceed
                        ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]'
                        : 'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'
                    }
        `}
            >
                Fast-Track My Access
                <ArrowRight className={`w-4 h-4 transition-all ${canProceed ? 'opacity-100' : 'opacity-0'}`} />
            </motion.button>
        </div>
    );
}
