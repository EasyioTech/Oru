import { motion } from 'framer-motion';
import { FileText, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';

export const InvoicingView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">Invoicing</h3>
                <p className="text-xs sm:text-sm text-zinc-500">Billing & Receivables</p>
            </div>
            <div className="flex gap-2">
                <button className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <Printer className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-xs text-white font-medium shadow-lg shadow-blue-500/20">Create Invoice</button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Unpaid Balance</span>
                    <ArrowUpRight className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-display">₹14,52,000</div>
                <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-[40%]" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2">12 Invoices past due</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Collected (MTD)</span>
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white font-display">₹38,20,400</div>
                <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[85%]" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2">Target: ₹45,00,000</div>
            </div>
        </div>

        <div className="space-y-2">
            <h4 className="text-xs font-medium text-zinc-300 mb-2">Recent Invoices</h4>
            {[
                { id: 'INV-2026-042', client: 'Nexus Corp', amount: '₹1,45,000', status: 'Paid', date: 'Feb 12' },
                { id: 'INV-2026-043', client: 'Starlight Media', amount: '₹82,400', status: 'Pending', date: 'Feb 14' },
                { id: 'INV-2026-044', client: 'Echo Systems', amount: '₹3,12,000', status: 'Overdue', date: 'Feb 05' },
            ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800/80 group-hover:bg-zinc-700 transition-colors">
                            <FileText className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-white">{inv.id}</div>
                            <div className="text-[10px] text-zinc-500">{inv.client} • {inv.date}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-semibold text-white">{inv.amount}</div>
                        <div className={`text-[10px] ${inv.status === 'Paid' ? 'text-emerald-400' :
                                inv.status === 'Pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>{inv.status}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
