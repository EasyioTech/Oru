import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Wallet, ShieldCheck, Activity } from 'lucide-react';

export const FinancialManagementView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">Financial Core</h3>
                <p className="text-xs sm:text-sm text-zinc-500">Company-wide fiscal health</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">Verified Status</span>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.06] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-32 h-32 text-blue-400" />
                </div>
                <div className="relative z-10">
                    <div className="text-xs text-zinc-400 mb-1">Total Operating Balance</div>
                    <div className="text-2xl sm:text-3xl font-bold text-white font-display">₹84,12,042.85</div>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-zinc-400">Assets: 72%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-[10px] text-zinc-400">Liabilities: 28%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-800/50 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-white">Quick Petty Cash</span>
                </div>
                <div className="text-xl font-semibold text-white">₹45,200</div>
                <div className="text-[10px] text-zinc-500 mt-1">Updated 10m ago</div>
                <div className="mt-4 flex gap-1">
                    {[40, 70, 45, 90, 65, 80].map((h, i) => (
                        <div key={i} className="flex-1 h-8 bg-purple-500/10 rounded-sm relative">
                            <div className="absolute bottom-0 left-0 right-0 bg-purple-500/40 rounded-sm transition-all duration-700" style={{ height: `${h}%` }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/[0.02]">
                <h4 className="text-xs font-medium text-zinc-400 mb-4 flex items-center gap-2">
                    <PieChart className="w-3.5 h-3.5" />
                    Expense Breakdown
                </h4>
                <div className="space-y-3">
                    {[
                        { cat: 'Cloud Infrastructure', val: '42%', color: 'bg-blue-500' },
                        { cat: 'Office Rent & Utils', val: '28%', color: 'bg-emerald-500' },
                        { cat: 'Recruitment', val: '15%', color: 'bg-purple-500' },
                    ].map((exp, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-zinc-300">{exp.cat}</span>
                                <span className="text-white font-medium">{exp.val}</span>
                            </div>
                            <div className="h-1 bg-zinc-700 rounded-full">
                                <div className={`h-full ${exp.color} rounded-full`} style={{ width: exp.val }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/[0.02]">
                <h4 className="text-xs font-medium text-zinc-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Quarterly Growth
                </h4>
                <div className="h-24 flex items-end gap-2">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${20 + i * 20}%` }}
                                className="w-full bg-gradient-to-t from-blue-500/50 to-blue-400/20 rounded-t-md"
                            />
                            <span className="text-[10px] text-zinc-600 font-bold">{q}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
