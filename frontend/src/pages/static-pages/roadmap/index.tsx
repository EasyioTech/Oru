import React from 'react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';
import { CheckCircle2, Clock, Calendar, Rocket, Sparkles, ChevronRight, ArrowRight, Activity, Zap, Shield } from 'lucide-react';

const roadmapItems = [
  { 
    status: 'shipped', 
    title: 'MULTI-CURRENCY PROTOCOL', 
    description: 'Global financial operations with real-time exchange rates and automated conversion for international agencies.',
    quarter: 'Q1 2024'
  },
  { 
    status: 'progress', 
    title: 'MOBILE OS EXPERIENCE', 
    description: 'A fully native iOS and Android experience designed with the same high-velocity aesthetic as the desktop platform.',
    quarter: 'Q2 2024'
  },
  { 
    status: 'planned', 
    title: 'AI-POWERED ORCHESTRATION', 
    description: 'Predictive bottleneck detection and automated resource reallocation using our proprietary Easyio neural engine.',
    quarter: 'Q3 2024'
  },
  { 
    status: 'planned', 
    title: 'WHITE-LABEL ECOSYSTEM', 
    description: 'Complete brand sovereignty for enterprise partners. Custom domains, layouts, and design systems for client portals.',
    quarter: 'Q4 2024'
  },
];

export default function RoadmapPage() {
  return (
    <PageWrapper>
      <SEO
        title="Roadmap | The Trajectory of Oru"
        description="See what features and improvements are coming to Oru ERP by Easyio Technologies. Our development roadmap."
      />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Activity className="w-3 h-3" />
                <span>Operational Evolution</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                ORU <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">TRAJECTORY.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto transition-colors italic"
            >
                We're not just shipping features; we're architecting the terminal velocity of enterprise operations at <strong className="text-zinc-900 dark:text-zinc-200 not-italic">Easyio Technologies</strong>.
            </motion.p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative mb-40">
            {/* Timeline Line */}
            <div className="absolute left-[31px] top-0 bottom-0 w-[1px] bg-zinc-200 dark:bg-zinc-900 transition-colors hidden md:block" />
            
            <div className="space-y-12">
                {roadmapItems.map((item, i) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: -0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative flex gap-12 group"
                    >
                        {/* Milestone Indicator */}
                        <div className="hidden md:flex shrink-0 w-[64px] h-[64px] rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 items-center justify-center relative z-10 transition-all group-hover:border-zinc-400 dark:group-hover:border-zinc-700">
                            {item.status === 'shipped' ? (
                                <CheckCircle2 className="w-6 h-6 text-zinc-900 dark:text-white" />
                            ) : item.status === 'progress' ? (
                                <Sparkles className="w-6 h-6 text-zinc-400 animate-pulse" />
                            ) : (
                                <Clock className="w-6 h-6 text-zinc-200 dark:text-zinc-800" />
                            )}
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 p-10 md:p-14 rounded-[3rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none transition-all duration-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 relative overflow-hidden group/card">
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border transition-colors ${
                                        item.status === 'shipped' ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950 dark:border-white' :
                                        item.status === 'progress' ? 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800' :
                                        'bg-zinc-50 dark:bg-zinc-950 text-zinc-300 dark:text-zinc-700 border-zinc-100 dark:border-zinc-900'
                                    }`}>
                                        {item.status === 'shipped' ? 'DEPLOYED' : item.status === 'progress' ? 'ACTIVE R&D' : 'PROPOSED'}
                                    </span>
                                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {item.quarter}
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-zinc-200 dark:text-zinc-800 group-hover/card:translate-x-2 transition-all hidden lg:block" />
                            </div>
                            
                            <h3 className="text-3xl md:text-4xl font-black text-zinc-950 dark:text-white mb-6 tracking-tighter uppercase italic transition-colors group-hover/card:translate-x-1 duration-500">{item.title}</h3>
                            <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed italic transition-colors max-w-3xl">{item.description}</p>
                            
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.01] scale-150 transition-opacity">
                                <Rocket className="w-64 h-64 text-zinc-950 dark:text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Suggestion CTA */}
        <motion.div 
            whileHover={{ scale: 0.995 }}
            className="mb-40 p-16 md:p-28 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-black text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
        >
            <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9] transition-colors">
                    SHAPE THE <br/><span className="text-zinc-600 dark:text-zinc-200 italic">NEXT CORE.</span>
                </h3>
                <p className="opacity-60 text-xl font-medium mb-14 max-w-lg mx-auto leading-relaxed transition-colors">Our prioritisation grid is driven by enterprise feedback. Tell us what your agency requires to scale.</p>
                <button className="h-20 px-14 bg-white dark:bg-black text-black dark:text-white font-black text-xs tracking-[0.3em] uppercase rounded-full hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto shadow-2xl dark:shadow-none">
                    Submit Requirement <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Zap className="w-80 h-80 text-white dark:text-black" />
            </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}





