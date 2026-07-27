import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { motion } from 'framer-motion';
import { Hexagon, User, Mail, Building2, Fingerprint } from 'lucide-react';

export const WorkspacePreview = () => {
    const { agencyName, name, email, industry, teamSize, step } = useAgencySignupStore();
    const displayName = agencyName || 'Untitled Workspace';
    const displayInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className="hidden lg:flex flex-[1.2] min-h-screen bg-background/50 border-l border-border/40 relative overflow-hidden flex-col justify-center items-center">
            
            {/* Dynamic Background that reacts to user input presence */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background pointer-events-none transition-colors duration-1000" />
            <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none transition-all duration-1000"
                animate={{
                    backgroundColor: agencyName ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--muted) / 0.1)',
                    scale: agencyName ? 1.1 : 0.9,
                }}
            />

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-[420px] perspective-1000"
            >
                {/* The IKEA Effect Card - Builds as they type */}
                <motion.div 
                    className="relative rounded-3xl bg-card/40 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden p-8"
                    animate={{
                        rotateY: step === 2 ? 5 : 0,
                        rotateX: step === 3 ? 2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-20 pointer-events-none transition-colors duration-500" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border overflow-hidden relative"
                                animate={agencyName ? { scale: [0.95, 1.05, 1] } : {}}
                            >
                                {agencyName ? (
                                    <span className="text-xl font-bold text-foreground">{displayInitial}</span>
                                ) : (
                                    <Hexagon className="w-5 h-5 text-muted-foreground/50" />
                                )}
                                {agencyName && (
                                    <motion.div className="absolute inset-0 bg-primary/10" layoutId="glow" />
                                )}
                            </motion.div>
                            <div>
                                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                                    {step === 3 ? 'System Ready' : 'Provisioning'}
                                </div>
                                <div className="text-lg font-semibold text-foreground tracking-tight truncate max-w-[200px]">
                                    {displayName}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Fields that populate live */}
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Industry & Scale</div>
                                <div className="text-[13px] font-medium text-foreground truncate transition-all duration-300">
                                    {industry || '---'} {teamSize ? `• ${teamSize} team` : ''}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Administrator</div>
                                <div className="text-[13px] font-medium text-foreground truncate transition-all duration-300">
                                    {name || 'Awaiting input...'}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Access Email</div>
                                <div className="text-[13px] font-medium text-foreground truncate transition-all duration-300">
                                    {email || 'Awaiting input...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fingerprint / Finalization visual */}
                    <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${step === 3 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30 animate-pulse'}`} />
                            <span className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase">
                                {step === 3 ? 'Auth Signature Valid' : 'Awaiting Auth Signature'}
                            </span>
                        </div>
                        <Fingerprint className={`w-6 h-6 transition-colors duration-500 ${step === 3 ? 'text-primary' : 'text-muted-foreground/30'}`} />
                    </div>
                    
                </motion.div>
                
                {/* Decorative Elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(var(--primary))_360deg)] opacity-10 animate-[spin_4s_linear_infinite] rounded-full blur-3xl mix-blend-screen pointer-events-none" />
            </motion.div>
        </div>
    );
};
