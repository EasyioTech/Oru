import { motion } from 'framer-motion';
import { UserCheck, Clock, UserPlus, Briefcase } from 'lucide-react';

export const HRMSView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">HR Management</h3>
                <p className="text-xs sm:text-sm text-zinc-500">Employee lifecycle & operations</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-xs text-blue-400 font-medium">+ Add Employee</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
                { label: 'Present', value: '118/124', icon: UserCheck, color: 'text-emerald-400' },
                { label: 'On Leave', value: '6', icon: Clock, color: 'text-orange-400' },
                { label: 'New Hires', value: '4', icon: UserPlus, color: 'text-blue-400' },
                { label: 'Open Roles', value: '12', icon: Briefcase, color: 'text-purple-400' },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-2 sm:p-3 rounded-lg bg-zinc-800/50 border border-white/[0.04]"
                >
                    <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                    <div className="text-[10px] text-zinc-500 mb-0.5">{stat.label}</div>
                    <div className="text-sm sm:text-base font-semibold text-white">{stat.value}</div>
                </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] p-3 sm:p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-3">Leave Requests</h4>
                <div className="space-y-3">
                    {[
                        { name: 'Alex Rivera', type: 'Sick Leave', duration: '2 days', status: 'Pending' },
                        { name: 'Priya Sharma', type: 'Vacation', duration: '5 days', status: 'Approved' },
                        { name: 'James Wilson', type: 'Personal', duration: '1 day', status: 'Pending' },
                    ].map((leave, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] sm:text-xs">
                            <div>
                                <div className="font-medium text-white">{leave.name}</div>
                                <div className="text-zinc-500">{leave.type} • {leave.duration}</div>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                                }`}>
                                {leave.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] p-3 sm:p-4">
                <h4 className="text-xs font-medium text-zinc-300 mb-3">Hiring Pipeline</h4>
                <div className="space-y-3">
                    {[
                        { role: 'Frontend Developer', candidates: 45, stage: 'Technical' },
                        { role: 'Product Manager', candidates: 28, stage: 'Final' },
                        { role: 'UI Designer', candidates: 32, stage: 'Screening' },
                    ].map((role, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                                    <span className="text-white font-medium">{role.role}</span>
                                    <span className="text-zinc-500">{role.candidates} apps</span>
                                </div>
                                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-2/3" />
                                </div>
                                <div className="text-[8px] text-zinc-500 mt-1">Stage: {role.stage}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
