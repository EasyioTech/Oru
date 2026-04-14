import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Share2 } from 'lucide-react';
import { SEO } from '../../../components/shared/SEO';
import { PageWrapper } from '../components/PageWrapper';

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <SEO
        title="Privacy Policy - Oru ERP"
        description="Learn how Oru ERP protects your data and privacy. Full GDPR compliance and data security practices at Easyio Technologies."
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-32 relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Lock className="w-3 h-3" />
                <span>Security Protocol</span>
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-8 transition-colors uppercase leading-[0.85]">PRIVACY <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">MANIFESTO.</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 transition-colors">Effective: December 1, 2024</p>
          </div>

          <div className="grid gap-8">
            {[
                { 
                    icon: Eye, 
                    num: "01", 
                    title: "Information Acquisition", 
                    content: "We collect information you provide directly to us at Easyio Technologies, including identity markers, corporate metadata, and usage telemetry to optimize platform velocity." 
                },
                { 
                    icon: FileText, 
                    num: "02", 
                    title: "Utilization Framework", 
                    content: "We deploy collected telemetry to maintain, secure, and accelerate our services. Your data is used strictly for operational integrity and performance enhancement." 
                },
                { 
                    icon: ShieldCheck, 
                    num: "03", 
                    title: "Security Infrastructure", 
                    content: "Oru utilizes industry-leading encryption protocols, isolated server clusters, and continuous security audits to ensure the absolute sanctity of your data." 
                },
                { 
                    icon: Share2, 
                    num: "04", 
                    title: "Data Sovereignty", 
                    content: "You retain full ownership of your data. You have the right to access, rectify, or purge your trajectory from our systems at any moment." 
                }
            ].map((section, i) => (
                <section key={section.num} className="group relative p-10 md:p-14 rounded-[3rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm dark:shadow-none transition-all duration-500">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-all duration-500">
                            <section.icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="font-black text-zinc-300 dark:text-zinc-800 text-2xl transition-colors tracking-tighter italic">{section.num}</span>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter transition-colors uppercase italic">{section.title}</h2>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl transition-colors text-lg">
                                {section.content}
                            </p>
                        </div>
                    </div>
                </section>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-40 p-16 md:p-24 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
          >
            <p className="opacity-60 font-medium mb-12 transition-colors text-lg md:text-xl">For depth-queries regarding our privacy architecture, contact our compliance cluster.</p>
            <a href="mailto:privacy@oru.io" className="font-black text-2xl md:text-4xl tracking-[0.1em] hover:opacity-70 transition-all uppercase italic">
                privacy@oru.io
            </a>
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03] scale-150 rotate-[12deg] group-hover:rotate-0 transition-transform duration-1000">
                <ShieldCheck className="w-80 h-80 text-white dark:text-black" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}



