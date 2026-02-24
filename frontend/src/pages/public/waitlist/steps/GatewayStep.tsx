import { motion } from 'framer-motion';
import { Building2, Users, Rocket, Lightbulb } from 'lucide-react';
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
    { id: '1-10', label: '1–10 Employees', description: 'Small but mighty' },
    { id: '11-40', label: '11–40 Employees', description: 'Growing fast' },
    { id: '40+', label: '40+ Employees', description: 'Scaling operations' },
];

export default function GatewayStep({ formData, setField, onNext }: Props) {
    const canProceed = formData.businessModel && (formData.businessModel === 'exploring' || formData.teamSize);
    const showTeamSize = formData.businessModel && formData.businessModel !== 'exploring';

    return (
        <div className="space-y-10">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-xs font-bold text-muted-foreground uppercase tracking-wide"
                >
                    <Users className="w-3.5 h-3.5" />
                    Curated Early Access
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight leading-tight">
                    Configure Your Workspace
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    We're rolling out Oru Suite in curated batches to ensure stability. Take 90 seconds to help us build a system for your exact needs. Completing this unlocks an exclusive option to skip the line.
                </p>
            </div>

            {/* Q1: Business Model */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
                    What best describes your core business model?
                </label>
                <div className="grid gap-3">
                    {businessModels.map((model) => {
                        const Icon = model.icon;
                        const isSelected = formData.businessModel === model.id;
                        return (
                            <motion.button
                                key={model.id}
                                onClick={() => {
                                    setField('businessModel', model.id);
                                    if (model.id === 'exploring') setField('teamSize', '');
                                }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`
                  relative flex items-center gap-4 w-full p-4 sm:p-5 rounded-xl border text-left transition-all duration-200
                  ${isSelected
                                        ? 'border-foreground/30 bg-foreground/5 shadow-sm'
                                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                                    }
                `}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-foreground/10' : 'bg-muted'}`}>
                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{model.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{model.description}</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-foreground bg-foreground' : 'border-border'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-background" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Q2: Team Size (hidden if exploring) */}
            {showTeamSize && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                >
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
                        What is your current team size?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {teamSizes.map((size) => {
                            const isSelected = formData.teamSize === size.id;
                            return (
                                <motion.button
                                    key={size.id}
                                    onClick={() => setField('teamSize', size.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                    p-4 rounded-xl border text-center transition-all duration-200
                    ${isSelected
                                            ? 'border-foreground/30 bg-foreground/5 shadow-sm'
                                            : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                                        }
                  `}
                                >
                                    <div className={`text-lg font-bold ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{size.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{size.description}</div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Next Button */}
            <motion.button
                onClick={onNext}
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.01 } : {}}
                whileTap={canProceed ? { scale: 0.99 } : {}}
                className={`
          w-full py-4 rounded-xl font-semibold text-base transition-all duration-200
          ${canProceed
                        ? 'bg-foreground text-background hover:opacity-90 cursor-pointer'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }
        `}
            >
                Fast-Track My Access →
            </motion.button>
        </div>
    );
}
