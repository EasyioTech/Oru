import { motion } from 'framer-motion';
import {
    Wallet,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ShieldCheck,
    Building,
    CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PayrollView = () => {
    return (
        <div className="h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Payroll engine</h3>
                    <p className="text-xs text-muted-foreground mt-1">Automated salary distribution and tax compliance.</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-muted border border-border">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">Next Cycle: Feb 28</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Payout</div>
                        <div className="text-2xl font-bold text-foreground font-display tracking-tight">₹8.42L</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-md">+4.2% from last month</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Compliance Status</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'TDS Filings (24Q)', status: 'Verified', icon: ShieldCheck, color: 'text-success' },
                            { label: 'Professional Tax', status: 'Payment Due', icon: CreditCard, color: 'text-warning' },
                            { label: 'EPF/ESI Contribution', status: 'In Process', icon: Building, color: 'text-primary' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                    <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                    item.status === 'Verified' ? 'bg-success/10 text-success border-success/20' :
                                        item.status === 'Payment Due' ? 'bg-warning/10 text-warning border-warning/20' :
                                            'bg-primary/10 text-primary border-primary/20'
                                )}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-foreground">Employee Distribution</h4>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] text-muted-foreground">Engineering</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="text-[9px] text-muted-foreground">Creative</span>
                        </div>
                    </div>
                </div>
                <div className="flex h-3 gap-1 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="bg-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                    <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} className="bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                    <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} className="bg-muted" />
                </div>
            </div>
        </div>
    );
};
