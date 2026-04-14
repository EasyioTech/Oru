import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Scale, AlertCircle, Ban } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';

const TermSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 p-10 md:p-14 rounded-[3rem] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-500 group shadow-sm dark:shadow-none relative overflow-hidden">
    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors shrink-0">
            <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic leading-none transition-colors">{title}</h2>
            <div className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed transition-colors text-lg">
                {children}
            </div>
        </div>
    </div>
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.01] scale-150 group-hover:scale-100 group-hover:rotate-12 transition-all duration-1000">
        <Icon className="w-40 h-40 text-zinc-950 dark:text-white" />
    </div>
  </div>
);

export default function TermsPage() {
  return (
    <PageWrapper>
      <SEO
        title="Terms of Service - Oru ERP"
        description="Read Oru ERP's terms and conditions at Easyio Technologies. Understand our service agreement and your rights as a user."
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-32 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all">
            <Scale className="w-3 h-3" />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-5xl md:text-[8rem] font-black text-zinc-950 dark:text-white mb-8 tracking-tighter uppercase leading-[0.8] transition-colors">
            SERVICE <br /><span className="text-zinc-300 dark:text-zinc-800 italic uppercase">MANIFESTO.</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em] transition-colors">
            Revision Protocol: Dec 1, 2024
          </p>
        </motion.div>

        <div className="grid gap-8">
          <TermSection icon={ShieldCheck} title="01. Protocol Acceptance">
            By accessing or using the Oru high-velocity ERP environment, you agree to be bound by these Terms of Service. Protocol adherence is mandatory for all system nodes within the <strong className="text-zinc-950 dark:text-white italic">Easyio ecosystem</strong>.
          </TermSection>

          <TermSection icon={FileText} title="02. Core Usage">
            You agree to use the service only for lawful strategic purposes. You are responsible for maintaining the security of your access keys and high-velocity account integrity at all times.
          </TermSection>

          <TermSection icon={Scale} title="03. Resource Allocation">
            Premium infrastructure requires active subscription. Payments are processed through high-velocity gateways and are strictly non-refundable except where mandated by international law.
          </TermSection>

          <TermSection icon={Ban} title="04. Node Termination">
            We reserve the right to suspend or terminate access for violations of these protocols. Nodes may disconnect from the cluster at any time without prior latency notification.
          </TermSection>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-40 p-16 md:p-24 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
          >
            <p className="opacity-60 font-medium mb-12 transition-colors text-lg md:text-xl">For deep-level inquiries regarding these protocols, contact our legal infrastructure.</p>
            <div className="font-black text-2xl md:text-4xl tracking-[0.1em] transition-all uppercase italic">
                legal@easyio.tech
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03] scale-150 rotate-[12deg] group-hover:rotate-0 transition-transform duration-1000">
                <FileText className="w-80 h-80 text-white dark:text-black" />
            </div>
          </motion.div>
        </div>

        <div className="mt-40 pt-16 border-t border-zinc-100 dark:border-zinc-900 text-center pb-24">
            <p className="text-zinc-300 dark:text-zinc-800 font-black uppercase tracking-[0.4em] text-[10px]">Easyio Legal Protocol &copy; 2024</p>
        </div>
      </div>
    </PageWrapper>
  );
}
