import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    Clock,
    Plus,
    ChevronRight,
    BarChart3,
    Calendar,
    Wallet
} from 'lucide-react';

export const DashboardView = () => {
    const stats = [
        { label: 'Revenue', value: '₹12.4L', trend: '+12%', color: 'text-blue-500', icon: Wallet },
        { label: 'Active Projects', value: '24', trend: '+4', color: 'text-indigo-500', icon: BarChart3 },
        { label: 'Team Size', value: '18', trend: '+2', color: 'text-emerald-500', icon: Users },
        { label: 'Est. Launch', value: '12d', trend: 'On Track', color: 'text-amber-500', icon: Clock },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display tracking-tight">Executive Overview</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-bold">Real-time Agency Pulse</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Plus className="w-3 h-3" />
                    General Report
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>{stat.trend}</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground font-display tracking-tight">{stat.value}</div>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Growth Velocity
                        </h4>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground border border-border">Daily</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">Monthly</div>
                        </div>
                    </div>
                    <div className="h-40 flex items-end gap-2">
                        {[40, 65, 45, 90, 55, 75, 85, 60, 95, 80, 70, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.5 + (i * 0.05), duration: 0.5 }}
                                className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm"
                            />
                        ))}
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                    <h4 className="text-sm font-bold text-foreground mb-4">Upcoming Deadlines</h4>
                    <div className="space-y-4">
                        {[
                            { title: 'Brand Audit', date: 'Tomorrow', color: 'bg-amber-500' },
                            { title: 'API Integration', date: '24 Feb', color: 'bg-blue-500' },
                            { title: 'Phase 2 Kickoff', date: '01 Mar', color: 'bg-emerald-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                <div className={`w-1 h-8 rounded-full ${item.color} group-hover:scale-y-125 transition-transform`} />
                                <div>
                                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                                    <div className="text-[10px] text-muted-foreground">{item.date}</div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
