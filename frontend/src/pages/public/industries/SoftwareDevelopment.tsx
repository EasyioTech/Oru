import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Code2, Bug, Rocket, ArrowRight, Zap, Terminal, Cpu, GitBranch, ShieldCheck, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SoftwareDevIndustry = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-600 dark:text-zinc-400 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white pt-24 pb-20 transition-colors duration-500">
      <SEO 
        title="ERP for Software Development Agencies & IT Services"
        description="Streamline your software development agency. Manage sprints, resource billing, and dev capacity with Oru ERP. Built by Easyio Technologies."
        keywords="software agency erp, it services management software, dev shop erp, agile agency tool"
      />
      
      {/* Hero */}
      <section className="relative py-32 px-4 overflow-hidden border-b border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-200/50 dark:from-zinc-900/20 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
          >
            <Terminal className="w-3 h-3" />
            <span>Developer-First Platform</span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[0.9] uppercase transition-colors">
            BUILT BY <span className="text-zinc-400 dark:text-zinc-800 italic uppercase">DEVS</span>, <br/><span className="text-zinc-950 dark:text-white uppercase">FOR THE FAST.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium transition-colors">
            Stop forcing your engineers into rigid corporate legacy systems. Align your <strong className="text-zinc-900 dark:text-zinc-300">Git workflows</strong> with your billing at Easyio Technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-2xl border-none">
                Upgrade Your Stack
            </Button>
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-transparent text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all">
                View API Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid / Bento */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Large Bento Card */}
                <div className="md:col-span-12 lg:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-10 transition-colors">
                                <Code2 className="w-8 h-8 text-zinc-950 dark:text-white transition-colors" />
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white mb-6 tracking-tighter uppercase transition-colors">DECOUPLE YOUR <br />CORE <span className="text-zinc-400 dark:text-zinc-800 italic uppercase">LOGIC.</span></h2>
                            <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed max-w-xl transition-colors">
                                Pull real-time data from GitHub and GitLab to track velocity and correlate it with project budgets automatically.
                            </p>
                        </div>
                        <div className="mt-12 flex items-center gap-4">
                            <div className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 font-mono text-xs text-zinc-400 dark:text-zinc-600 transition-colors">v1.2.0-stable</div>
                            <div className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 font-mono text-xs text-zinc-400 dark:text-zinc-600 transition-colors">git-sync-active</div>
                        </div>
                    </div>
                </div>

                {/* Vertical Bento Card */}
                <div className="md:col-span-6 lg:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                    <div>
                        <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 transition-colors">
                            <Bug className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Automated Sprint Billing</h3>
                        <p className="text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed transition-colors">
                            Generate professional invoices directly from completed sprint points or billable hours tracked in JIRA.
                        </p>
                    </div>
                    <div className="mt-10 py-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between transition-colors">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700 transition-colors">Integrations</span>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 shadow-2xl transition-colors" />
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-950 shadow-2xl transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Small Bento Cards */}
                <div className="md:col-span-6 lg:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 transition-colors">
                        <Rocket className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase transition-colors">Deployment Tracking</h3>
                    <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">
                        Associate releases with client approvals and payment milestones automatically.
                    </p>
                </div>

                <div className="md:col-span-12 lg:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 md:px-16 flex items-center gap-12 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                    <div className="flex-1">
                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Security & Compliance</h3>
                        <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed transition-colors">
                            Enterprise-grade encryption for your financial data. SOC2 Type II compliant infrastructure as standard.
                        </p>
                    </div>
                    <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-700 hidden lg:flex">
                        <ShieldCheck className="w-14 h-14 text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-40 px-4 text-center relative border-t border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-200/50 dark:from-zinc-900/30 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto relative z-10 max-w-4xl">
          <h2 className="text-4xl md:text-7xl font-black text-zinc-950 dark:text-white mb-10 tracking-tighter leading-[0.95] uppercase transition-colors">
            NO MORE <span className="text-zinc-400 dark:text-zinc-600 italic uppercase transition-colors">$50,000</span> <br />IMPLEMENTATION FEES.
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium mb-12 max-w-2xl mx-auto transition-colors">
            Oru ERP costs less than a single Senior Dev's monthly compute budget. No hidden fees. Just velocity.
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link to="/pricing">
              <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 transition-all duration-300 border-none shadow-2xl">
                See Pricing <Zap className="ml-2 w-6 h-6 fill-current" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SoftwareDevIndustry;


