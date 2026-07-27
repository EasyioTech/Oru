import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
    const { completedSteps, isComplete } = useOnboarding();
    const navigate = useNavigate();

    const progress = (completedSteps.length / 4) * 100;
    const allDone = completedSteps.length === 4;

    useEffect(() => {
        if (allDone) {
            toast.success('Your workspace is fully set up!');
            const t = setTimeout(() => navigate('/dashboard'), 1500);
            return () => clearTimeout(t);
        }
    }, [allDone, navigate]);

    const items = [
        { id: 1, title: 'Workspace created', desc: 'Your agency workspace is ready.', href: '#' },
        { id: 2, title: 'Add your agency logo', desc: 'Without a logo, clients see a generic brand on every invoice and email you send.', href: '/settings?tab=branding' },
        { id: 3, title: 'Invite your first team member', desc: 'Every week without your team in ORU is a week of attendance and tasks tracked nowhere.', href: '/hr/employees?invite=true' },
        { id: 4, title: 'Add your first client', desc: 'Your first client in CRM is the difference between chasing payments and having a paper trail.', href: '/crm/clients?new=true' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative selection:bg-primary/20 selection:text-foreground">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background/90 to-muted/30 pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 p-8 sm:p-12"
                >
                    <div className="mb-10">
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4 tracking-tight">
                            Welcome to your new workspace
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base font-medium">
                            Let's get the essentials set up so you can start working efficiently.
                        </p>
                    </div>

                    <div className="mb-10">
                        <div className="flex justify-between text-[11px] font-bold tracking-wider uppercase text-muted-foreground mb-3">
                            <span>Setup Progress</span>
                            <span className="text-primary">{Math.round(progress)}% complete</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary rounded-full relative"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => {
                            const done = isComplete(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link 
                                        to={item.href}
                                        className={`flex items-start gap-5 p-5 rounded-2xl border transition-all duration-300 ${
                                            done 
                                            ? 'bg-muted/30 border-transparent opacity-60 cursor-default pointer-events-none'
                                            : 'bg-background border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group'
                                        }`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {done ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
                                            ) : (
                                                <Circle className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-base font-bold tracking-tight ${done ? 'text-muted-foreground line-through decoration-muted-foreground/30' : 'text-foreground'}`}>
                                                {item.title}
                                            </h3>
                                            <p className={`text-sm mt-1.5 font-medium leading-relaxed ${done ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                                                {item.desc}
                                            </p>
                                        </div>
                                        {!done && (
                                            <div className="shrink-0 self-center w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowRight className="w-4 h-4 text-primary" strokeWidth={2.5} />
                                            </div>
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    {allDone && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-10 text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-sm border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Redirecting to your dashboard...
                            </div>
                        </motion.div>
                    )}
                    
                    {!allDone && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-10 text-center"
                        >
                            <Button variant="ghost" className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors px-6" onClick={() => navigate('/dashboard')}>
                                Skip for now
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
