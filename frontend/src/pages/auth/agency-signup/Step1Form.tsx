import { useAgencySignupStore } from '@/hooks/useAgencySignupStore';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export const Step1Form = () => {
    const { agencyName, industry, teamSize, updateData, setStep } = useAgencySignupStore();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (agencyName.length >= 2) {
            setStep(2);
        }
    };

    const teamSizes = [
        { id: 'solo', label: 'Just Me' },
        { id: 'small', label: '2–10' },
        { id: 'medium', label: '11–50' }
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="agencyName" className="text-[13px] font-medium text-foreground tracking-tight ml-1">
                        Workspace Name
                    </Label>
                    <Input
                        id="agencyName"
                        autoFocus
                        required
                        minLength={2}
                        placeholder="Acme Inc."
                        value={agencyName}
                        onChange={(e) => updateData({ agencyName: e.target.value })}
                        className="h-11 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-foreground transition-all text-[15px] px-4 rounded-xl shadow-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-[13px] font-medium text-foreground tracking-tight ml-1">
                        Industry
                    </Label>
                    <Select value={industry} onValueChange={(val) => updateData({ industry: val })}>
                        <SelectTrigger className="h-11 bg-muted/50 border-transparent focus:ring-1 focus:ring-foreground transition-all text-[15px] px-4 rounded-xl shadow-none">
                            <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="border-border/80 shadow-md bg-background rounded-xl">
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="IT & Software">IT & Software</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-foreground tracking-tight ml-1">Team Size</Label>
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                        {teamSizes.map(({ id, label }) => {
                            const isActive = teamSize === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => updateData({ teamSize: id })}
                                    className={`relative flex-1 h-9 rounded-lg font-medium text-[13px] tracking-tight transition-all duration-200 ${
                                        isActive 
                                        ? 'bg-background text-foreground shadow-sm' 
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full h-11 text-[15px] font-medium tracking-tight mt-8 rounded-xl shadow-none" disabled={!agencyName}>
                Continue
            </Button>
        </form>
    );
};
