import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, Clock, BarChart3, ArrowRight, Sparkles, Layers, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectManagement = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-600 dark:text-zinc-400 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white pt-24 pb-20 transition-colors duration-500">
      <SEO
        title="Project Management Software for Agencies | Oru ERP"
        description="Enterprise-grade project management for agencies. Track projects, timelines, budgets, and team capacity with real-time visibility at Easyio Technologies."
        keywords="project management software, agency project management, project tracking tool, project planning software"
      />

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden border-b border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 dark:from-zinc-900/20 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
          >
            <Layers className="w-3 h-3" />
            <span>Core Infrastructure</span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[0.9] uppercase">
            CONCEPT TO <br /><span className="text-zinc-400 dark:text-zinc-800 italic uppercase transition-colors">Completion.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium transition-colors">
            Track deadlines, budgets, and deliverables at <strong className="text-zinc-900 dark:text-zinc-300">Easyio Technologies</strong>. High-fidelity visibility into project profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl border-none">
                Start Free Trial
            </Button>
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-transparent text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all">
                Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid / Bento */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white mb-6 tracking-tighter uppercase tracking-[0.1em] transition-colors">THE ARCHITECTURE OF <span className="text-zinc-400 dark:text-zinc-800 italic">ORU.</span></h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed transition-colors">From planning to delivery, with high-velocity visibility into every project node.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Timeline Bento */}
            <div className="md:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 md:p-14 group hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <Clock className="w-8 h-8 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Timeline & Milestone Tracking</h3>
                <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed max-w-xl transition-colors">
                    Set high-velocity timelines and track critical path milestones. Automated alerts for nodes at risk of latency.
                </p>
                <div className="mt-12 flex -space-x-1">
                    {[1,2,3,4].map(n => (
                        <div key={n} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-400 dark:text-zinc-700 transition-colors">T{n}</div>
                    ))}
                </div>
            </div>

            {/* Team Bento */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 flex flex-col justify-end hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 group shadow-sm dark:shadow-none">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <Users className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase transition-colors">Team DNA</h3>
                <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">
                    Assign global teams to clusters. Collaborate in real-time with zero friction.
                </p>
            </div>

            {/* Budget Bento */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 flex flex-col justify-end hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 group shadow-sm dark:shadow-none">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <BarChart3 className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase transition-colors">Profit Nodes</h3>
                <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">
                    Track budget vs actual spend. Prevent overrun with predictive analytics.
                </p>
            </div>

            {/* Deliverable Bento */}
            <div className="md:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 md:px-14 flex items-center gap-10 group hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none">
                <div className="flex-1">
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Deliverable Management</h3>
                    <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed transition-colors">
                        Define project assets, track approval workflows, and maintain a complete audit trajectory automatically.
                    </p>
                </div>
                <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-700 hidden lg:flex">
                    <Target className="w-12 h-12 text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="py-40 px-4 text-center relative border-t border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-200 dark:from-zinc-900/30 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto relative z-10 max-w-4xl">
          <h2 className="text-4xl md:text-7xl font-black text-zinc-900 dark:text-white mb-10 tracking-tighter leading-[0.95] uppercase">
            CONTROL THE <br /><span className="text-zinc-400 dark:text-zinc-600 italic transition-colors lowercase">chaos.</span>
          </h2>
          <div className="flex flex-col items-center gap-8">
            <Link to="/agency-signup?feature=project-management">
              <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-2xl border-none">
                Get Started Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <p className="text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] transition-colors">
                EASYIO TECHNOLOGIES &copy; 2024
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectManagement;


