import { motion } from 'framer-motion';
import {
    Users2,
    Target,
    TrendingUp,
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CRMView = () => {
    const leads = [
        { name: 'Global Tech Inc', contact: 'Alex Rivera', stage: 'Negotiation', value: '₹4.5L', score: 92 },
        { name: 'Quantum Sol', contact: 'Ria Jain', stage: 'Discovery', value: '₹2.8L', score: 78 },
        { name: 'Cloud Scale', contact: 'Sam Wilson', stage: 'Proposal', value: '₹6.2L', score: 85 },
    ];

    return (
        <div className="h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Revenue Pipeline</h3>
                    <p className="text-xs text-muted-foreground mt-1">Nurture leads and track sales velocity in real-time.</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Add Lead
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Pipeline Val', value: '₹24.8L', icon: Target, color: 'text-pink-500' },
                    { label: 'Won (MTD)', value: '₹12.4L', icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Active Leads', value: '38', icon: Users2, color: 'text-blue-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</div>
                            <div className="text-lg font-bold text-foreground">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-foreground">High Value Opportunities</h4>
                    <div className="flex gap-2">
                        <div className="p-1.5 rounded-lg bg-muted border border-border cursor-pointer hover:bg-muted/80 transition-colors">
                            <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="p-1.5 rounded-lg bg-muted border border-border cursor-pointer hover:bg-muted/80 transition-colors">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {leads.map((lead, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {lead.name.substring(0, 2)}
                            </div>
                            <div className="flex-1 ml-4 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{lead.name}</h5>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success/10 border border-success/20">
                                        <div className="w-1 h-1 rounded-full bg-success" />
                                        <span className="text-[8px] font-bold text-success">{lead.score}% Score</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{lead.contact} • {lead.stage}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-foreground">{lead.value}</div>
                                <div className="flex items-center gap-1 justify-end mt-1">
                                    <Phone className="w-2.5 h-2.5 text-muted-foreground hover:text-primary cursor-pointer" />
                                    <Mail className="w-2.5 h-2.5 text-muted-foreground hover:text-primary cursor-pointer" />
                                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
