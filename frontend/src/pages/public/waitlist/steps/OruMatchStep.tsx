import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { Grip, Star, Settings, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import type { WaitlistFormData } from '../useWaitlistForm';

interface Props {
    formData: WaitlistFormData;
    setField: (field: keyof WaitlistFormData, value: string) => void;
    setFeatureRanking: (value: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const toolOptions = [
    { id: 'spreadsheets', label: 'Spreadsheets + WhatsApp', description: 'Excel / Google Sheets for data, WhatsApp for team syncs' },
    { id: 'disconnected-saas', label: 'Disconnected SaaS tools', description: 'A mess of Slack, Jira, Keka, Zoho, etc.' },
    { id: 'tally-manual', label: 'Tally Prime + manual tracking', description: 'Tally for the accountant, spreadsheets for founders' },
    { id: 'legacy-erp', label: 'Legacy ERP system', description: 'SAP, Oracle, NetSuite, or similar' },
];

const featureDescriptions: Record<string, string> = {
    'Unified File Management': 'Drive/OneDrive alternative built into your projects',
    'Automated HR & Payroll': 'Seamless leave, attendance, and Indian compliance',
    'Task & KPI Engine': 'Project management that auto-tracks employee KRAs',
    'Smart Invoicing': 'Automated billing, GST handling, and cash flow',
    'Koe (Native Chat)': 'Context-aware chat replacing Slack/WhatsApp',
};

const subStepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export default function OruMatchStep({ formData, setField, setFeatureRanking, onNext, onBack }: Props) {
    const [subStep, setSubStep] = useState<0 | 1 | 2>(0);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const canProceedSub0 = !!formData.currentTools;
    const canProceedSub1 = true; // ranking always has a value
    const canProceedSub2 = formData.chatRating > 0;

    const handleDragStart = useCallback((index: number) => {
        dragItem.current = index;
    }, []);

    const handleDragEnter = useCallback((index: number) => {
        dragOverItem.current = index;
    }, []);

    const handleDragEnd = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const items = [...formData.featureRanking];
        const draggedItem = items[dragItem.current];
        items.splice(dragItem.current, 1);
        items.splice(dragOverItem.current, 0, draggedItem);
        setFeatureRanking(items);
        dragItem.current = null;
        dragOverItem.current = null;
    }, [formData.featureRanking, setFeatureRanking]);

    const subStepLabels = ['Current Stack', 'Prioritize Features', 'Chat Value'];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
                >
                    <Settings className="w-3 h-3" />
                    Your Oru OS Match
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">
                    Help Us Prioritize Your Experience
                </h2>
            </div>

            {/* Sub-step indicators */}
            <div className="flex items-center justify-center gap-1">
                {subStepLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                if (i < subStep) setSubStep(i as 0 | 1 | 2);
                            }}
                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${i === subStep
                                ? 'bg-primary/10 text-primary'
                                : i < subStep
                                    ? 'text-foreground/60 hover:text-foreground/80 cursor-pointer'
                                    : 'text-muted-foreground/40 cursor-default'
                                }`}
                        >
                            {label}
                        </button>
                        {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/30" />}
                    </div>
                ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* Sub-step content */}
            <AnimatePresence mode="wait">
                {subStep === 0 && (
                    <motion.div
                        key="substep-0"
                        variants={subStepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                        className="space-y-6"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                                How do you currently manage operations?
                            </label>
                            <p className="text-[11px] text-muted-foreground pl-1">Pick the closest match to your current stack.</p>
                        </div>
                        <div className="grid gap-2.5">
                            {toolOptions.map((tool, i) => {
                                const isSelected = formData.currentTools === tool.id;
                                const hasToolSelection = !!formData.currentTools;
                                return (
                                    <motion.button
                                        key={tool.id}
                                        onClick={() => setField('currentTools', tool.id)}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 + i * 0.04 }}
                                        whileHover={{ scale: 1.005 }}
                                        whileTap={{ scale: 0.995 }}
                                        className={`flex items-start gap-4 w-full p-4 rounded-2xl border text-left transition-all duration-300 ${isSelected ? 'border-primary/50 bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]' : 'border-border bg-transparent hover:border-border/80 hover:bg-muted/30'} ${hasToolSelection && !isSelected ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${isSelected ? 'border-primary bg-primary' : 'border-border'}`}>
                                            {isSelected && <div className="w-[6px] h-[6px] rounded-full bg-primary-foreground" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[13px] font-semibold transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{tool.label}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{tool.description}</div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                        <div className="flex gap-3">
                            <button onClick={onBack} className="px-5 py-3.5 rounded-2xl border border-border text-[13px] font-medium text-foreground hover:bg-muted/30 hover:border-border/80 transition-all flex items-center gap-2">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                            </button>
                            <motion.button
                                onClick={() => canProceedSub0 && setSubStep(1)}
                                disabled={!canProceedSub0}
                                whileHover={canProceedSub0 ? { scale: 1.005 } : {}}
                                whileTap={canProceedSub0 ? { scale: 0.995 } : {}}
                                className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${canProceedSub0 ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]' : 'bg-muted text-muted-foreground/40 cursor-not-allowed'}`}
                            >
                                Next <ArrowRight className={`w-4 h-4 transition-opacity ${canProceedSub0 ? 'opacity-100' : 'opacity-0'}`} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {subStep === 1 && (
                    <motion.div
                        key="substep-1"
                        variants={subStepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                        className="space-y-6"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                                Rank features by what would make you switch fastest
                            </label>
                            <p className="text-[11px] text-muted-foreground pl-1">Drag to reorder. #1 = most important to you.</p>
                        </div>
                        <div className="space-y-1.5">
                            {formData.featureRanking.map((feature, index) => (
                                <div
                                    key={feature}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-muted/5 hover:bg-muted/15 cursor-grab active:cursor-grabbing transition-colors select-none"
                                >
                                    <Grip className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${index === 0 ? 'bg-primary/20 text-primary' : 'bg-foreground/[0.08] text-foreground/60'
                                        }`}>{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold text-foreground/90">{feature}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">{featureDescriptions[feature]}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                        <div className="flex gap-3">
                            <button onClick={() => setSubStep(0)} className="px-5 py-3.5 rounded-2xl border border-border text-[13px] font-medium text-foreground hover:bg-muted/30 hover:border-border/80 transition-all flex items-center gap-2">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                            </button>
                            <motion.button
                                onClick={() => canProceedSub1 && setSubStep(2)}
                                whileHover={{ scale: 1.005 }}
                                whileTap={{ scale: 0.995 }}
                                className="flex-1 py-3.5 rounded-2xl font-semibold text-[14px] bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {subStep === 2 && (
                    <motion.div
                        key="substep-2"
                        variants={subStepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                        className="space-y-6"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] pl-1">
                                Feature spotlight — native erp chat
                            </label>
                            <p className="text-[12px] text-muted-foreground pl-1 leading-relaxed mt-2">
                                We're building <strong className="text-foreground/90">Koe</strong> — a context-aware chat app directly inside your ERP to replace scattered WhatsApp/Slack groups. How valuable would this be for your team?
                            </p>
                        </div>

                        <div className="py-6 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <motion.button
                                        key={rating}
                                        onClick={() => setField('chatRating', rating as unknown as string)}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 transition-colors"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-all duration-200 ${rating <= formData.chatRating
                                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                                : 'text-border hover:text-muted-foreground'
                                                }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                            <div className="flex justify-between w-full max-w-[260px] text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                                <span>Not useful</span>
                                <span>Game changer</span>
                            </div>
                            {formData.chatRating > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[12px] text-muted-foreground mt-2"
                                >
                                    {formData.chatRating <= 2 ? "Good to know — we'll keep iterating." : formData.chatRating <= 4 ? 'Nice — Koe is shaping up to be a key differentiator.' : "Love this! You'll be among the first to test Koe."}
                                </motion.div>
                            )}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                        <div className="flex gap-3">
                            <button onClick={() => setSubStep(1)} className="px-5 py-3.5 rounded-2xl border border-border/40 text-[13px] font-medium text-muted-foreground hover:bg-muted/30 hover:border-border/60 transition-all flex items-center gap-2">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                            </button>
                            <motion.button
                                onClick={onNext}
                                disabled={!canProceedSub2}
                                whileHover={canProceedSub2 ? { scale: 1.005 } : {}}
                                whileTap={canProceedSub2 ? { scale: 0.995 } : {}}
                                className={`flex-1 py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${canProceedSub2 ? 'bg-foreground text-background hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]' : 'bg-muted/60 text-muted-foreground/40 cursor-not-allowed'}`}
                            >
                                Continue <ArrowRight className={`w-4 h-4 transition-opacity ${canProceedSub2 ? 'opacity-100' : 'opacity-0'}`} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
