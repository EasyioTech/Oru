import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useWaitlistForm } from './useWaitlistForm';
import GatewayStep from './steps/GatewayStep';
import AspirantsStep from './steps/AspirantsStep';
import LeanTeamStep from './steps/LeanTeamStep';
import GrowingEngineStep from './steps/GrowingEngineStep';
import ScalingOperationStep from './steps/ScalingOperationStep';
import OruMatchStep from './steps/OruMatchStep';
import StackSpendStep from './steps/StackSpendStep';
import LeadCaptureStep from './steps/LeadCaptureStep';
import ThankYouStep from './steps/ThankYouStep';
import { Link } from 'react-router-dom';

const stepVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
};

export default function WaitlistPage() {
    const {
        formData,
        currentStep,
        currentStepIndex,
        totalSteps,
        progress,
        setField,
        togglePainPoint,
        setFeatureRanking,
        next,
        back,
        submitToSheets,
        isSubmitting,
        submitError,
    } = useWaitlistForm();

    const isThankYou = currentStep === 'thank-you';
    const mainRef = useRef<HTMLDivElement>(null);

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const renderStep = () => {
        switch (currentStep) {
            case 'gateway':
                return <GatewayStep formData={formData} setField={setField} onNext={next} />;
            case 'aspirants':
                return <AspirantsStep formData={formData} togglePainPoint={togglePainPoint} onNext={next} onBack={back} />;
            case 'lean-team':
                return <LeanTeamStep formData={formData} togglePainPoint={togglePainPoint} onNext={next} onBack={back} />;
            case 'growing-engine':
                return <GrowingEngineStep formData={formData} togglePainPoint={togglePainPoint} onNext={next} onBack={back} />;
            case 'scaling-operation':
                return <ScalingOperationStep formData={formData} togglePainPoint={togglePainPoint} onNext={next} onBack={back} />;
            case 'oru-match':
                return <OruMatchStep formData={formData} setField={setField} setFeatureRanking={setFeatureRanking} onNext={next} onBack={back} />;
            case 'stack-spend':
                return <StackSpendStep formData={formData} setField={setField} onNext={next} onBack={back} />;
            case 'lead-capture':
                return <LeadCaptureStep formData={formData} setField={setField} onSubmit={submitToSheets} onBack={back} isSubmitting={isSubmitting} submitError={submitError} />;
            case 'thank-you':
                return <ThankYouStep />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background — matches landing page */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px',
                    }}
                />
                {/* Subtle Glow Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-foreground/[0.04] to-transparent blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-foreground/[0.03] to-transparent blur-[100px]" />
                {/* Radial Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_80%)]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
                <div className="max-w-2xl mx-auto flex items-center justify-between px-5 sm:px-6 h-16">
                    <Link to="/" className="text-lg font-bold text-foreground tracking-tight font-display hover:opacity-70 transition-opacity">
                        Oru
                    </Link>
                    {!isThankYou && (
                        <div className="flex items-center gap-4">
                            {/* Step Dots */}
                            <div className="hidden sm:flex items-center gap-1.5">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${i < currentStepIndex
                                            ? 'w-1.5 bg-foreground'
                                            : i === currentStepIndex
                                                ? 'w-6 bg-foreground'
                                                : 'w-1.5 bg-border'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground tabular-nums tracking-wide uppercase">
                                Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {!isThankYou && (
                    <div className="h-[2px] bg-border/20">
                        <motion.div
                            className="h-full bg-foreground"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-2xl mx-auto px-5 sm:px-6 py-12 sm:py-20">
                {/* Glassmorphism Card Container */}
                <div className="relative">
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-border/50 via-transparent to-border/20 pointer-events-none" />
                    <div className="relative rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8">
                <div className="max-w-2xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                        Your data is encrypted and never shared with third parties.
                    </p>
                    <Link to="/" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors tracking-wide">
                        oru.agency
                    </Link>
                </div>
            </footer>
        </div>
    );
}
