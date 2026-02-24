import { motion } from 'framer-motion';
import { Target, TrendingUp, Handshake, Search } from 'lucide-react';

export const CRMView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">CRM & Sales</h3>
                <p className="text-xs sm:text-sm text-zinc-500">Pipeline & Lead Management</p>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search leads..."
                    className="bg-zinc-800/50 border border-white/[0.04] rounded-lg pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-48"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
            {[
                { label: 'New Leads', value: '42', change: '+18% this month', icon: Target, color: 'text-blue-400' },
                { label: 'Pipeline Value', value: '₹1.2Cr', change: '+24%', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Won Deals', value: '14', change: '+5', icon: Handshake, color: 'text-purple-400' },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 sm:p-4 rounded-lg bg-zinc-800/50 border border-white/[0.04]"
                >
                    <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-[10px] text-emerald-400">{stat.change}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mb-0.5">{stat.label}</div>
                    <div className="text-base sm:text-xl font-semibold text-white font-display">{stat.value}</div>
                </motion.div>
            ))}
        </div>

        <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-300">Active Opportunities</h4>
            {[
                { company: 'Global Tech Inc', contact: 'Mark Zhao', value: '₹12L', stage: 'Negotiation', color: 'bg-blue-500' },
                { company: 'Vertex Solutions', contact: 'Sarah Lane', value: '₹8.5L', stage: 'Technical Review', color: 'bg-purple-500' },
                { company: 'Cloud Dynamics', contact: 'Robert Ross', value: '₹4.2L', stage: 'Initial Meeting', color: 'bg-orange-500' },
            ].map((deal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-white/[0.02] hover:border-white/[0.06] transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${deal.color}/20 flex items-center justify-center text-xs font-bold text-white`}>
                        {deal.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{deal.company}</div>
                        <div className="text-[10px] text-zinc-500">{deal.contact}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-semibold text-white">{deal.value}</div>
                        <div className="text-[10px] text-zinc-400">{deal.stage}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
