import React from 'react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '@/components/shared/SEO';
import { Target, History, Users2, Rocket, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { number: '500+', label: 'GLOBAL AGENCIES', icon: Users2 },
    { number: '12K+', label: 'PROJECT VOLUMES', icon: Target },
    { number: '₹75CR+', label: 'REVENUE OPTIMIZED', icon: Rocket },
  ];

  return (
    <PageWrapper>
      <SEO 
        title="About | The Agency Operating System"
        description="Oru is the operating system for modern agencies. Empowering creative teams with unified project and financial management at Easyio Technologies."
      />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <ShieldCheck className="w-3 h-3" />
                <span>The Architecture of Velocity</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                THE CORE <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">OS.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto transition-colors italic"
            >
                Oru is the definitive operating system for high-velocity agencies. We engineer transitions from operational chaos to absolute corporate clarity.
            </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-40">
            {stats.map((stat, i) => (
                <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                        <stat.icon className="w-5 h-5 text-zinc-400 dark:text-zinc-600 transition-colors" />
                    </div>
                    <div className="text-5xl md:text-6xl font-black text-zinc-950 dark:text-white mb-2 tracking-tighter transition-colors">{stat.number}</div>
                    <div className="text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.3em] transition-colors italic">{stat.label}</div>
                </motion.div>
            ))}
        </div>

        {/* Narrative Flow */}
        <div className="grid lg:grid-cols-2 gap-20 mb-40">
            <section className="space-y-8">
                <div className="inline-flex h-1 w-20 bg-zinc-200 dark:bg-zinc-900 rounded-full transition-colors" />
                <h2 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase italic transition-colors">THE GENESIS.</h2>
                <div className="space-y-6 text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic transition-colors">
                    <p>Founded in 2024 at <strong className="text-zinc-900 dark:text-zinc-200 not-italic">Easyio Technologies</strong>, Oru was born from a singular obsession: the elimination of operational friction.</p>
                    <p>We saw agencies drowning in disconnected spreadsheets and archaic ERPs. We chose to build a bridge to the future.</p>
                </div>
            </section>
            
            <section className="p-12 rounded-[3.5rem] bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 flex flex-col justify-between group transition-all">
                <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm transition-colors">
                        <Zap className="w-6 h-6 text-zinc-900 dark:text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight uppercase italic transition-colors">ACCELERATION PROTOCOL.</h3>
                    <p className="text-zinc-400 dark:text-zinc-600 font-medium uppercase text-xs tracking-widest leading-relaxed transition-colors">Our mission is absolute: to empower team leaders with data sovereignty. We minimize the noise so you can maximize the signal.</p>
                </div>
                <div className="mt-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0 self-end">
                    <Globe className="w-32 h-32 text-zinc-950 dark:text-white" />
                </div>
            </section>
        </div>

        {/* Global CTA */}
        <motion.div 
            whileHover={{ scale: 0.995 }}
            className="mb-40 p-16 md:p-28 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-black text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
        >
            <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9] transition-colors">
                    JOIN THE <span className="text-zinc-700 dark:text-zinc-200 italic">NEXT PHASE.</span>
                </h3>
                <p className="opacity-60 text-xl font-medium mb-14 max-w-lg mx-auto leading-relaxed transition-colors">Start scaling your agency with the infrastructure built for professional excellence at Easyio.</p>
                <button className="h-20 px-14 bg-white dark:bg-black text-black dark:text-white font-black text-xs tracking-[0.3em] uppercase rounded-full hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto shadow-2xl dark:shadow-none">
                    Initialize Setup <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            {/* Visual Echo */}
            <div className="absolute top-0 left-0 p-12 opacity-[0.03] dark:opacity-[0.01] scale-[4] rotate-[-12deg] group-hover:rotate-0 transition-transform duration-1000 select-none">
                <span className="text-[10rem] font-black text-white dark:text-black font-mono">ORU_CORE</span>
            </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

