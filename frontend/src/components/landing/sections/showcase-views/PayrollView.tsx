import { motion } from 'framer-motion';
import { DollarSign, CreditCard, Calendar, Users } from 'lucide-react';

export const PayrollView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">Payroll Management</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Feb 2026 Payment Cycle</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-xs text-emerald-400 font-medium">Processing</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
                { label: 'Total Payroll', value: '₹42.8L', icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Employees', value: '124', icon: Users, color: 'text-blue-400' },
                { label: 'Next Payday', value: 'Mar 01', icon: Calendar, color: 'text-purple-400' },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04]"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-white/[0.04] ${stat.color}`}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-zinc-500">{stat.label}</span>
                    </div>
                    <div className="text-base sm:text-xl font-semibold text-white font-display">{stat.value}</div>
                </motion.div>
            ))}
        </div>

        <div className="rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] p-3 sm:p-4 mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-medium text-zinc-300 mb-3 sm:mb-4">Recent Disbursements</h4>
            <div className="space-y-3">
                {[
                    { name: 'Engineering Dept', amount: '₹18.5L', status: 'Completed', date: 'Feb 15' },
                    { name: 'Product Team', amount: '₹12.2L', status: 'Pending', date: 'Feb 18' },
                    { name: 'Sales & Marketing', amount: '₹8.4L', status: 'Scheduled', date: 'Feb 20' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-zinc-700/50">
                                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-white">{item.name}</div>
                                <div className="text-[10px] text-zinc-500">{item.date}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-semibold text-white">{item.amount}</div>
                            <div className={`text-[10px] ${item.status === 'Completed' ? 'text-emerald-400' :
                                    item.status === 'Pending' ? 'text-yellow-400' : 'text-zinc-500'
                                }`}>{item.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
