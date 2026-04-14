import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';
import { Zap, Clock, Sparkles } from 'lucide-react';

const releases = [
  { 
    version: '2.1.0', 
    date: 'Dec 10, 2024', 
    type: 'Feature Update',
    changes: ['New dashboard widgets for high-velocity tracking', 'Improved project templates with modular logic', 'Bug fixes for infrastructure stability'] 
  },
  { 
    version: '2.0.0', 
    date: 'Nov 15, 2024', 
    type: 'Major Release',
    changes: ['Complete UI redesign with theme orchestration', 'New reporting engine with predictive telemetry', 'API v2 launch for ecosystem expansion'] 
  },
  { 
    version: '1.9.0', 
    date: 'Oct 20, 2024', 
    type: 'Optimization',
    changes: ['GST compliance features for precise accounting', 'Multi-currency support for global operations', 'Performance improvements in database layer'] 
  },
];

export default function ChangelogPage() {
  return (
    <PageWrapper>
      <SEO
        title="Evolution | Protocol Updates"
        description="Tracking the trajectory of Oru's development. Every commit, every feature, every optimization by Easyio Technologies."
      />
      
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Clock className="w-3.5 h-3.5" />
                <span>Protocol Trajectory</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                SYSTEM <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">EVOLUTION.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto transition-colors italic"
            >
                Logging the continuous refinement of the Easyio engine. Tracking every leap in <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Architectural Velocity</strong>.
            </motion.p>
        </div>

        {/* Timeline Section */}
        <div className="space-y-32 relative pb-40">
            {/* Main Vertical Axis */}
            <div className="absolute left-6 md:left-[50%] md:-translate-x-1/2 top-0 bottom-0 w-[1px] bg-zinc-100 dark:bg-zinc-900 transition-colors" />

            {releases.map((release, i) => (
                <motion.div
                    key={release.version}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.7 }}
                    className={`relative grid md:grid-cols-2 gap-12 items-start ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                >
                    {/* Node Indicator */}
                    <div className="absolute left-6 md:left-[50%] md:-translate-x-1/2 top-0 w-3 h-3 rounded-full bg-zinc-950 dark:bg-white border-4 border-white dark:border-zinc-950 z-10 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]" />

                    {/* Version Metadata */}
                    <div className={`${i % 2 === 0 ? 'md:order-1' : 'md:order-2'} pl-12 md:pl-0`}>
                        <div className={`flex flex-col gap-4 ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase italic">v{release.version}</span>
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600`}>
                                    {release.type}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">{release.date}</span>
                        </div>
                    </div>

                    {/* Change Details */}
                    <div className={`${i % 2 === 0 ? 'md:order-2' : 'md:order-1'} pl-12 md:pl-0`}>
                        <div className="p-10 rounded-[3rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 transition-all duration-700 shadow-sm">
                            <ul className={`space-y-6 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                {release.changes.map((change) => (
                                    <li key={change} className={`flex items-start gap-4 text-zinc-500 dark:text-zinc-500 text-lg font-medium leading-relaxed italic ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                        <Zap className="w-4 h-4 mt-2 shrink-0 text-zinc-200 dark:text-zinc-800" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Subscription Section */}
        <section className="pb-40">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 md:p-24 rounded-[4rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
            >
                <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-100 dark:bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <Sparkles className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-10" />
                    <h3 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter transition-colors uppercase italic leading-[0.8]">FOLLOW THE <br/><span className="text-zinc-300 dark:text-zinc-800 transition-colors">EVOLUTION.</span></h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium mb-12 transition-all italic leading-relaxed">Get notified the second we deploy new core protocol optimizations.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
                        <input 
                            type="email" 
                            placeholder="TERMINAL EMAIL" 
                            className="flex-1 h-16 px-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all font-mono font-black text-[10px] tracking-widest uppercase"
                        />
                        <button className="h-16 px-10 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl hover:scale-105 transition-all shadow-xl">
                            Join
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
}
