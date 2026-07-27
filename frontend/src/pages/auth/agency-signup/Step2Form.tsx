import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const Step2Form = () => {
    const { agencyName, name, email, password, updateData, setStep } = useAgencySignupStore();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (name && email && password.length >= 8 && hasUpperCase && hasNumber) {
            setStep(3);
        }
    };

    const getStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getStrength(password);
    const progressWidth = strength === 0 ? (password.length > 0 ? 10 : 0) : (strength / 4) * 100;
    
    const getStrengthColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const getStrengthText = () => {
        if (password.length === 0) return '';
        if (strength <= 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Strong';
        return 'Excellent';
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[14px] text-muted-foreground font-medium pb-2 tracking-tight"
            >
                Workspace: <span className="text-foreground">{agencyName || 'your agency'}</span>
            </motion.div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[13px] font-medium text-foreground tracking-tight ml-1">Full Name</Label>
                    <Input
                        id="name"
                        autoFocus
                        required
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        className="h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-foreground transition-all text-[15px] px-4 rounded-xl shadow-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[13px] font-medium text-foreground tracking-tight ml-1">Work Email</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        className="h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-foreground transition-all text-[15px] px-4 rounded-xl shadow-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[13px] font-medium text-foreground tracking-tight ml-1 flex justify-between">
                        <span>Password</span>
                        {password.length > 0 && (
                            <span className={`text-[11px] ${getStrengthColor().replace('bg-', 'text-')}`}>
                                {getStrengthText()}
                            </span>
                        )}
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            placeholder="Required"
                            value={password}
                            onChange={(e) => updateData({ password: e.target.value })}
                            className="h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-foreground transition-all text-[15px] px-4 pr-10 rounded-xl shadow-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-r-xl"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-4">
                <Button type="submit" className="w-full h-11 text-[15px] font-medium tracking-tight rounded-xl shadow-none" disabled={!name || !email || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)}>
                    Continue
                </Button>
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors py-2 tracking-tight"
                >
                    Back
                </button>
            </div>
        </form>
    );
};
