import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { useAgencySignup } from '@/hooks/useAgencySignup';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Building2, User, Mail, Briefcase, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Step3Summary = () => {
    const { agencyName, name, email, industry, setStep } = useAgencySignupStore();
    const { submitSignup, isLoading } = useAgencySignup();

    return (
        <div className="space-y-6">
            {/* Minimalist Summary List */}
            <div className="bg-muted/30 rounded-2xl p-2">
                <div className="space-y-1">
                    {[
                        { icon: Building2, label: 'Workspace', value: agencyName },
                        { icon: User, label: 'Admin Name', value: name },
                        { icon: Mail, label: 'Email', value: email },
                        { icon: Briefcase, label: 'Industry', value: industry },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm">
                                <item.icon className="w-4 h-4 text-foreground" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[12px] font-medium text-muted-foreground tracking-tight">{item.label}</div>
                                <div className="text-[14px] font-medium text-foreground tracking-tight">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pt-4">
                <Button 
                    onClick={submitSignup} 
                    disabled={isLoading} 
                    className="w-full h-11 text-[15px] font-medium tracking-tight rounded-xl shadow-none"
                >
                    {isLoading ? 'Creating workspace...' : `Create Workspace`}
                </Button>
                
                <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="w-full text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors py-2 tracking-tight"
                >
                    Back
                </button>
            </div>
        </div>
    );
};
