import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const DashboardView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">Welcome back, Burhan</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Here's what's happening today</p>
            </div>
            <div className="flex gap-2">
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-zinc-800 text-[10px] sm:text-xs text-zinc-400">This Week</div>
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {[
                { label: 'Revenue', value: '₹12.4L', change: '+12%', trend: 'up' },
                { label: 'Projects', value: '24', change: '+3', trend: 'up' },
                { label: 'Tasks Done', value: '147', change: '+28', trend: 'up' },
                { label: 'Team Load', value: '78%', change: '-5%', trend: 'down' },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04]"
                >
                    <div className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{stat.label}</div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-xl font-semibold text-white font-display">{stat.value}</span>
                        <span className={`text-[10px] sm:text-xs ${stat.trend === 'up' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {stat.change}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm font-medium text-zinc-300">Revenue Trend</span>
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] sm:text-xs">
                        <span>+24%</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
                <div className="h-20 sm:h-32 flex items-end gap-1 sm:gap-2">
                    {[45, 62, 38, 75, 55, 90, 68, 82, 95, 78, 88, 100].map((h, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-blue-500/70 to-blue-400/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] p-3 sm:p-4">
                <span className="text-xs sm:text-sm font-medium text-zinc-300">Recent Activity</span>
                <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                    {[
                        { text: 'Invoice #234 paid', time: '2m ago' },
                        { text: 'New task assigned', time: '15m ago' },
                        { text: 'Project completed', time: '1h ago' },
                    ].map((activity, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            <span className="text-[10px] sm:text-xs text-zinc-400 flex-1 truncate">{activity.text}</span>
                            <span className="text-[8px] sm:text-[10px] text-zinc-600 flex-shrink-0">{activity.time}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
