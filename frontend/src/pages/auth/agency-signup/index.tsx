import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { Step1Form } from './Step1Form';
import { Step2Form } from './Step2Form';
import { Step3Summary } from './Step3Summary';
import { WorkspacePreview } from './WorkspacePreview';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Building2, UserCircle, Rocket } from 'lucide-react';

const STEPS = [
    { num: 1, label: 'Workspace',  icon: Building2,  title: 'Create workspace',  desc: 'Name your agency and claim your workspace URL.' },
    { num: 2, label: 'Your Info',  icon: UserCircle, title: 'Your details',       desc: 'Tell us a bit about you and your agency.' },
    { num: 3, label: 'Review',     icon: Rocket,     title: 'Final review',       desc: 'Everything looks good — ready to launch.' },
];

export default function AgencySignupPage() {
    const { step } = useAgencySignupStore();

    // Psychological goal gradient: start at 15% so it never looks empty
    const progress = step === 1 ? 15 : step === 2 ? 50 : 85;
    const current = STEPS[step - 1];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 flex flex-col lg:flex-row relative selection:bg-zinc-900/20 dark:selection:bg-zinc-100/20 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-32 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20" />
                <div className="absolute bottom-32 right-0 w-96 h-96 bg-zinc-200 dark:bg-zinc-800/30 rounded-full blur-3xl opacity-10" />
            </div>

            {/* Left Content Column */}
            <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 lg:px-24 xl:px-32 relative z-10 w-full max-w-2xl mx-auto lg:max-w-none">
                <div className="w-full max-w-[480px] mx-auto lg:mx-0">

                    {/* ── Stepper ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mb-10"
                    >
                        {/* Step circles + connectors */}
                        <div className="flex items-center gap-0 mb-5">
                            {STEPS.map((s, idx) => {
                                const done    = step > s.num;
                                const active  = step === s.num;
                                const Icon    = s.icon;
                                return (
                                    <div key={s.num} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {/* Circle */}
                                            <motion.div
                                                animate={{
                                                    scale: active ? 1.08 : 1,
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                className={`
                                                    relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                                    transition-all duration-300
                                                    ${done
                                                        ? 'bg-zinc-900 dark:bg-white shadow-md'
                                                        : active
                                                            ? 'bg-zinc-900 dark:bg-white ring-4 ring-zinc-900/10 dark:ring-white/10 shadow-lg shadow-zinc-900/20 dark:shadow-white/10'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                                                    }
                                                `}
                                            >
                                                {done ? (
                                                    <Check className="w-4 h-4 text-white dark:text-zinc-900" strokeWidth={2.5} />
                                                ) : active ? (
                                                    <Icon className="w-4 h-4 text-white dark:text-zinc-900" strokeWidth={1.75} />
                                                ) : (
                                                    <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">{s.num}</span>
                                                )}
                                            </motion.div>

                                            {/* Step label */}
                                            <span className={`text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap transition-colors duration-300 ${
                                                done || active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                                            }`}>
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Connector line */}
                                        {idx < STEPS.length - 1 && (
                                            <div className="flex-1 mx-3 mb-4">
                                                <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-zinc-900 dark:bg-white rounded-full origin-left"
                                                        animate={{ scaleX: step > s.num ? 1 : 0 }}
                                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Momentum progress bar */}
                        <div className="relative">
                            <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                                <span>Setup progress</span>
                                <motion.span
                                    key={progress}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-zinc-900 dark:text-white"
                                >
                                    {progress}%
                                </motion.span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-300 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Step Header ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`header-${step}`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3 }}
                            className="mb-10 text-center lg:text-left"
                        >
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-3">
                                <span className="w-4 h-px bg-zinc-300 dark:bg-zinc-600" />
                                Step {step} of {STEPS.length}
                                <span className="w-4 h-px bg-zinc-300 dark:bg-zinc-600" />
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 leading-tight">
                                {current.title}
                            </h1>
                            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {current.desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Form ── */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="w-full"
                            >
                                {step === 1 && <Step1Form />}
                                {step === 2 && <Step2Form />}
                                {step === 3 && <Step3Summary />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* Right Preview Panel (Desktop) */}
            <WorkspacePreview />
        </div>
    );
}


