import { motion } from 'framer-motion';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Briefcase,
    Layers,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FinancialManagementView = () => {
    return (
        <div className="h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display text-primary">Financial OS</h3>
                    <p className="text-xs text-muted-foreground mt-1">Consolidated view of your capital, runway, and burns.</p>
                </div>
                <div className="flex items-center gap-2 p-1 rounded-lg bg-muted border border-border">
                    <button className="px-3 py-1 rounded-md text-[10px] font-bold bg-card shadow-sm text-foreground">Monthly</button>
                    <button className="px-3 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">Quarterly</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Revenue vs Forecast
                        </h4>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] text-muted-foreground font-medium">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                <span className="text-[10px] text-muted-foreground font-medium">Target</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-40 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 100, 75, 95].map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className={cn(
                                    "flex-1 rounded-t-md transition-all group relative",
                                    i === 9 ? "bg-primary" : "bg-primary/20 hover:bg-primary/40"
                                )}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap">
                                    ₹{val / 10}L
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 border-t border-border pt-3">
                        {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => (
                            <span key={m} className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">{m}</span>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex items-center gap-1 text-success">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">12.4%</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Cash on Hand</div>
                        <div className="text-2xl font-bold text-foreground font-display tracking-tight">₹1.84Cr</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-xl bg-error/10">
                                <TrendingUp className="w-4 h-4 text-error" />
                            </div>
                            <div className="flex items-center gap-1 text-error">
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">4.2%</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Burn</div>
                        <div className="text-2xl font-bold text-foreground font-display tracking-tight">₹8.4L</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
