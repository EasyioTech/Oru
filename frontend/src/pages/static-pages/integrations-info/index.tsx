import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';
import { Globe, Zap, CreditCard, Layers, Search, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

const integrations = [
  { name: 'Google Workspace', category: 'Productivity', status: 'Available', icon: Globe },
  { name: 'Stripe Global', category: 'Payments', status: 'Available', icon: CreditCard },
  { name: 'Zapier Engine', category: 'Automation', status: 'Available', icon: Zap },
  { name: 'Slack Connect', category: 'Communication', status: 'Coming Soon', icon: Sparkles },
  { name: 'QuickBooks Pro', category: 'Accounting', status: 'Coming Soon', icon: Layers },
  { name: 'Figma Design', category: 'Design', status: 'Coming Soon', icon: Search },
];

export default function IntegrationsPage() {
  return (
    <PageWrapper>
      <SEO
        title="Integrations | The Oru Ecosystem"
        description="Connect Oru with your favorite tools. Seamlessly integrate Stripe, Google Workspace, Zapier, and more."
      />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Layers className="w-3.5 h-3.5" />
                <span>Ecosystem Expansion</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                PLUG INTO <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">POWER.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-medium transition-colors italic leading-relaxed"
            >
                Create a unified <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Digital Nervous System</strong> by synchronizing your favorite protocol interfaces with the Easyio engine.
            </motion.p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-32">
            <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-zinc-700 transition-colors" />
                <input 
                    type="text" 
                    placeholder="SEARCH THE ECOSYSTEM..." 
                    className="w-full h-20 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl pl-16 pr-6 text-zinc-950 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 shadow-sm dark:shadow-none transition-all font-black text-xs uppercase tracking-widest font-mono"
                />
            </div>
            <button className="h-20 px-10 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center gap-3 text-zinc-400 dark:text-zinc-500 font-black text-xs uppercase tracking-[0.2em] hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm dark:shadow-none transition-all">
                <Filter className="w-4 h-4" />
                Categories
            </button>
        </div>

        {/* Integrations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
            {integrations.map((int, i) => (
                <motion.div
                    key={int.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-10 rounded-[3rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all duration-700 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-700 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                        <ArrowUpRight className="w-12 h-12 text-zinc-950 dark:text-white" />
                    </div>

                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-10 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-all duration-700 shadow-inner">
                        <int.icon className="w-8 h-8 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-500" />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-3xl font-black text-zinc-950 dark:text-white tracking-tighter group-hover:translate-x-1 transition-all uppercase italic leading-[0.9]">{int.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 mt-2 transition-colors">{int.category}</p>
                        </div>
                        
                        <div className="pt-8 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 group-hover:border-zinc-200 dark:group-hover:border-zinc-800 transition-colors duration-700">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border transition-all duration-500 ${
                                int.status === 'Available' 
                                ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950 dark:border-white' 
                                : 'bg-transparent text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-800'
                            }`}>
                                {int.status}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Custom Integration CTA */}
        <section className="pb-40">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 md:p-24 rounded-[4rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-100 dark:bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <Sparkles className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-10" />
                    <h3 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter transition-colors uppercase italic leading-[0.8]">NEED A CUSTOM <br/><span className="text-zinc-300 dark:text-zinc-800 transition-colors">CONNECTION?</span></h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium mb-12 transition-all italic leading-relaxed">Our open API at <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Easyio Technologies</strong> allows your engineering team to build bespoke protocol bridges in minutes.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="h-20 px-12 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.3em] uppercase rounded-2xl hover:scale-105 transition-all shadow-xl">
                            View API Docs
                        </button>
                        <button className="h-20 px-12 bg-white dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 font-black text-xs tracking-[0.3em] uppercase rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
                            Talk to Devs
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
}
