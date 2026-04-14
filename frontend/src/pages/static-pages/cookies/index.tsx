import { motion } from 'framer-motion';
import { Cookie, Database, Shield, Settings, Info } from 'lucide-react';
import { SEO } from '../../../components/shared/SEO';
import { PageWrapper } from '../components/PageWrapper';

const CookieSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 p-10 md:p-14 rounded-[3rem] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-500 group shadow-sm dark:shadow-none">
    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
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
  </div>
);

export default function CookiePolicyPage() {
  return (
    <PageWrapper>
      <SEO
        title="Cookie Policy - Oru ERP"
        description="Learn about how Oru ERP uses cookies and similar technologies at Easyio Technologies."
      />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-32 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all">
            <Database className="w-3 h-3" />
            <span>Data Operations</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-zinc-950 dark:text-white mb-8 tracking-tighter uppercase leading-[0.8] transition-colors">
            COOKIE <br /><span className="text-zinc-300 dark:text-zinc-800 italic uppercase">MANIFESTO.</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em] transition-colors">
            Protocol Update: Dec 1, 2024
          </p>
        </motion.div>

        <div className="grid gap-8">
          <CookieSection icon={Info} title="Protocol Definition">
            Cookies are modular data packets stored on your device that optimize interaction speed and help us understand system node behavior across our infrastructure at <strong className="text-zinc-950 dark:text-white italic transition-colors">Easyio Technologies</strong>.
          </CookieSection>

          <CookieSection icon={Settings} title="Packet Categories">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {[
                { label: 'Essential', desc: 'Required Core Functions' },
                { label: 'Analytics', desc: 'Usage Trajectories' },
                { label: 'Preferences', desc: 'User State Persistence' },
                { label: 'Performance', desc: 'Cache Optimization' },
              ].map((item) => (
                <li key={item.label} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-2 group/item hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 group-hover/item:text-zinc-900 dark:group-hover/item:text-white transition-colors">{item.label}</span>
                    <span className="text-lg font-black text-zinc-600 dark:text-zinc-400 tracking-tighter transition-colors">{item.desc}</span>
                </li>
              ))}
            </ul>
          </CookieSection>

          <CookieSection icon={Shield} title="Modulation Control">
            System administrators can modulate cookie settings through browser preferences. Disabling specific data packets may lead to suboptimal system performance and latency in platform response.
          </CookieSection>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-40 p-16 md:p-24 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
          >
            <p className="opacity-60 font-medium mb-12 transition-colors text-lg md:text-xl">For deep-level telemetry forensics and data storage protocols, contact us.</p>
            <div className="font-black text-2xl md:text-4xl tracking-[0.1em] transition-all uppercase italic">
                privacy@easyio.tech
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03] scale-150 rotate-[12deg] group-hover:rotate-0 transition-transform duration-1000">
                <Cookie className="w-80 h-80 text-white dark:text-black" />
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
