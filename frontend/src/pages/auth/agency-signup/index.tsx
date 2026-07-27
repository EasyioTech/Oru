import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { Step1Form } from './Step1Form';
import { Step2Form } from './Step2Form';
import { Step3Summary } from './Step3Summary';
import { WorkspacePreview } from './WorkspacePreview';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function AgencySignupPage() {
    const { step } = useAgencySignupStore();

    // Goal gradient effect progress calculation: 15% -> 50% -> 85%
    const progress = step === 1 ? 15 : step === 2 ? 50 : 85;

    const steps = [
        { num: 1, title: 'Create workspace', desc: 'Start by naming your agency workspace.' },
        { num: 2, title: 'Your details', desc: 'Let us know who is setting this up.' },
        { num: 3, title: 'Final review', desc: 'Everything looks good to go.' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 flex flex-col lg:flex-row relative selection:bg-zinc-900/20 dark:selection:bg-zinc-100/20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-32 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20" />
                <div className="absolute bottom-32 right-0 w-96 h-96 bg-zinc-200 dark:bg-zinc-800/30 rounded-full blur-3xl opacity-10" />
            </div>

            {/* Left Content Column */}
            <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 lg:px-24 xl:px-32 relative z-10 w-full max-w-2xl mx-auto lg:max-w-none">
                <div className="w-full max-w-[480px] mx-auto lg:mx-0">

                    {/* Progress Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            {steps.map((s, idx) => (
                                <div key={s.num} className="flex items-center">
                                    <motion.div
                                        animate={{
                                            scale: step === s.num ? 1.1 : 1,
                                            backgroundColor: step >= s.num ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors flex-shrink-0"
                                    >
                                        {step > s.num ? (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        ) : (
                                            <span className={step === s.num ? 'text-white' : 'text-zinc-500'}>
                                                {s.num}
                                            </span>
                                        )}
                                    </motion.div>
                                    {idx < steps.length - 1 && (
                                        <motion.div
                                            animate={{
                                                backgroundColor: step > s.num ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                            }}
                                            className="h-1 w-8 mx-2 rounded-full transition-colors"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Goal Gradient Progress Bar */}
                        <motion.div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-8">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mb-10 text-center lg:text-left"
                    >
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase block mb-3">
                            Step {step} of 3
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
                            {steps[step - 1].title}
                        </h1>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {steps[step - 1].desc}
                        </p>
                    </motion.div>

                    {/* Form Container with AnimatePresence */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
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
