import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/shared/SEO';
import { PageWrapper } from '../../static-pages/components/PageWrapper';
import { Check, X, Shield, Zap, ArrowRight, Sparkles, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const MondayVsOru = () => {
  const comparison = [
    { feature: 'Project Management', monday: 'Basic Board View', oru: 'Enterprise Modular Logic', advantage: 'oru' },
    { feature: 'Financial Management', monday: 'Third-party Integration Only', oru: 'Native Global Accounting', advantage: 'oru' },
    { feature: 'Profitability Analytics', monday: 'Manual Computation', oru: 'Real-Time Neural Dashboards', advantage: 'oru' },
    { feature: 'Resource Planning', monday: 'Timeline View (Paid)', oru: 'Predictive Capacity Engine', advantage: 'oru' },
    { feature: 'Billable Hours Tracking', monday: 'Widget / Time Tracking App', oru: 'Deep Hardware-Synced Native', advantage: 'oru' },
    { feature: 'Architecture', monday: 'SaaS Generalist', oru: 'Agency-Specific Protocol', advantage: 'oru' },
  ];

  return (
    <PageWrapper>
      <SEO
        title="Monday.com vs Oru | The Architecture of Agency"
        description="A technical comparison between Monday.com and Oru for high-velocity agency operations. Why architecture matters for profitability."
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Scale className="w-3.5 h-3.5" />
                <span>Competitive Protocol Matrix</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                MONDAY VS <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">ORU.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-medium transition-colors italic leading-relaxed"
            >
                Monday.com is a task manager. Oru is an <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Operating System</strong>. Understand the structural difference in agency profitability.
            </motion.p>
        </div>

        {/* Comparison Matrix */}
        <section className="pb-32">
            <div className="relative rounded-[3.5rem] border border-zinc-200 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900">
                            <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Attribute</th>
                            <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-center text-zinc-400 dark:text-zinc-600">Monday.com</th>
                            <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-center bg-zinc-50 dark:bg-zinc-900/50 text-zinc-950 dark:text-white">Oru Protocol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.map((row, i) => (
                            <motion.tr 
                                key={i} 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="border-b border-zinc-50 dark:border-zinc-900/50 last:border-none group hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors"
                            >
                                <td className="p-10">
                                    <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">{row.feature}</p>
                                </td>
                                <td className="p-10 text-center text-zinc-400 dark:text-zinc-600 font-medium italic">
                                    {row.monday}
                                </td>
                                <td className="p-10 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-lg font-black text-zinc-950 dark:text-zinc-100 tracking-tight uppercase leading-tight">{row.oru}</p>
                                        <div className="h-1 w-8 bg-zinc-950 dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Philosophy Section */}
        <section className="pb-40 grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
                <div className="inline-flex h-1 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase leading-[0.9] italic">CHAOS VS <br/>ORDER.</h2>
                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                    Project management without real-time financial synchronization is just documented chaos. Oru binds every action to a profit metric automatically.
                </p>
            </div>
            <div className="p-12 rounded-[3rem] border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 relative group overflow-hidden">
                <Shield className="w-16 h-16 text-zinc-100 dark:text-zinc-900 absolute -top-4 -right-4 transition-transform group-hover:scale-110" />
                <div className="space-y-6 relative z-10">
                    <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase italic">Institutional Memory</h3>
                    <p className="text-zinc-500 dark:text-zinc-500 font-medium italic leading-relaxed">
                        Easyio's architectural approach ensures that your agency's knowledge persists across cycles, unlike generalist tools that require constant manual re-configuration.
                    </p>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="pb-40">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 md:p-24 rounded-[4rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-100 dark:bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <Sparkles className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-10" />
                    <h3 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-[0.8] text-zinc-950 dark:text-white">UPGRADE THE <br/><span className="text-zinc-300 dark:text-zinc-800 transition-colors">CORE.</span></h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium mb-12 italic leading-relaxed max-w-lg mx-auto">
                        Stop managing tasks. Start managing a high-velocity enterprise protocol with Oru.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/agency-signup?source=monday-compare" className="w-full sm:w-auto">
                            <button className="w-full h-20 px-12 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.3em] uppercase rounded-2xl hover:scale-105 transition-all shadow-xl">
                                Try Oru Free <ArrowRight className="inline-block ml-2 w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default MondayVsOru;
