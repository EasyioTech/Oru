import { motion } from 'framer-motion';
import { Globe, Shield, UserCheck, Trash2, ArrowRightLeft, Target } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';

const GDPRCard = ({ icon: Icon, title, children, num }: { icon: any, title: string, children: React.ReactNode, num?: string }) => (
    <div className="group p-10 md:p-14 rounded-[3rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-500 shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-all duration-500">
                <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    {num && <span className="font-black text-zinc-300 dark:text-zinc-800 text-2xl tracking-tighter italic transition-colors">{num}</span>}
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic leading-none transition-colors">{title}</h2>
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl transition-colors text-lg">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export default function GDPRPage() {
  return (
    <PageWrapper>
      <SEO
        title="GDPR Compliance - Oru ERP"
        description="Learn about Oru's commitment to GDPR and your data privacy rights under EU law. Provided by Easyio Technologies."
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-32 relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Shield className="w-3 h-3" />
                <span>Regulatory Protocol</span>
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-8 transition-colors uppercase leading-[0.85]">EUROPEAN <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">GDPR.</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 transition-colors">Sanctity of Data: Dec 1, 2024</p>
          </div>

          <div className="grid gap-8">
            <GDPRCard icon={Globe} title="Operational Commitment">
                Oru is committed to absolute GDPR compliance and protecting the fundamental privacy rights of EU citizens. Our architecture at <strong className="text-zinc-950 dark:text-white italic">Easyio Technologies</strong> is engineered with privacy-by-design as the primary axiom.
            </GDPRCard>

            <section className="space-y-8 mt-12 mb-24">
                <div className="flex items-center gap-4 px-6">
                    <div className="h-px bg-zinc-200 dark:bg-zinc-900 flex-1" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700 italic">User Sovereignty Matrix</h3>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-900 flex-1" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { icon: UserCheck, label: 'Access Protocol', desc: 'Right to acquire mirrors of your data' },
                        { icon: Target, label: 'Rectification', desc: 'Sovereign right to correct telemetry' },
                        { icon: Trash2, label: 'Erasure Matrix', desc: 'Absolute right to be forgotten' },
                        { icon: ArrowRightLeft, label: 'Portability', desc: 'Seamless data migration stream' }
                    ].map((right, i) => (
                        <div key={right.label} className="p-8 rounded-3xl bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group">
                            <right.icon className="w-6 h-6 text-zinc-300 dark:text-zinc-800 mb-6 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                            <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic mb-2">{right.label}</h4>
                            <p className="text-sm text-zinc-500 font-medium">{right.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 md:p-24 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
            >
                <h3 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter transition-colors uppercase leading-[0.9]">DATA PROTECTION <span className="text-zinc-600 dark:text-zinc-200 italic transition-colors">OFFICER.</span></h3>
                <p className="opacity-60 text-lg md:text-xl font-medium mb-12 transition-colors">Contact our DPO for inquiries regarding the trajectory of your digital identity.</p>
                <div className="font-black text-2xl md:text-4xl tracking-tighter hover:opacity-70 transition-all uppercase italic">
                    dpo@oru.io
                </div>
                <div className="absolute top-0 left-0 p-8 opacity-[0.05] dark:opacity-[0.03] scale-150 rotate-[-12deg] group-hover:rotate-0 transition-transform duration-1000">
                    <Globe className="w-80 h-80 text-white dark:text-black" />
                </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
