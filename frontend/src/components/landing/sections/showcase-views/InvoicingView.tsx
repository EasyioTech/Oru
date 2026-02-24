import { motion } from 'framer-motion';
import {
    FileDown,
    FileText,
    Plus,
    Search,
    MoreVertical,
    ArrowUpRight,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const InvoicingView = () => {
    const invoices = [
        { id: 'INV-2026-001', client: 'Pixel Studio', amount: '₹1,24,000', status: 'Paid', date: 'Feb 12' },
        { id: 'INV-2026-002', client: 'Growth Lab', amount: '₹86,500', status: 'Overdue', date: 'Jan 28' },
        { id: 'INV-2026-003', client: 'Cyberdyne', amount: '₹2,50,000', status: 'Pending', date: 'Feb 15' },
    ];

    return (
        <div className="h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Invoicing (GST)</h3>
                    <p className="text-xs text-muted-foreground mt-1">Compliant billing and automated collection.</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Create Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-muted">
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Collection Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-4">82% <span className="text-xs text-muted-foreground font-normal">Collected</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-primary" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-muted">
                            <CreditCard className="w-4 h-4 text-error" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Leakage</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-4">₹1.4L <span className="text-xs text-muted-foreground font-normal">Outstanding</span></div>
                    <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                        Send Reminders <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
                <h4 className="text-sm font-bold text-foreground mb-4">Recent Transactions</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase">Invoice ID</th>
                                <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase">Client</th>
                                <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase">Amount</th>
                                <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase">Status</th>
                                <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map((inv, i) => (
                                <motion.tr
                                    key={inv.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="group"
                                >
                                    <td className="py-3 text-[11px] font-bold text-foreground">{inv.id}</td>
                                    <td className="py-3 text-[11px] text-muted-foreground font-medium">{inv.client}</td>
                                    <td className="py-3 text-[11px] font-bold text-foreground">{inv.amount}</td>
                                    <td className="py-3">
                                        <span className={cn(
                                            "text-[8px] font-bold px-2 py-0.5 rounded-full border",
                                            inv.status === 'Paid' ? 'bg-success/10 text-success border-success/20' :
                                                inv.status === 'Overdue' ? 'bg-error/10 text-error border-error/20' :
                                                    'bg-warning/10 text-warning border-warning/20'
                                        )}>{inv.status}</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                            <FileDown className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
