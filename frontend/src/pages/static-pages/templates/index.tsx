import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '@/components/shared/SEO';

const templates = ['Project Plan', 'Invoice Template', 'Client Brief', 'Meeting Notes'];

export default function TemplatesPage() {
  return (
    <PageWrapper>
      <SEO 
        title="Templates | Fast Performance Starters"
        description="Get started quickly with pre-built agency templates. Project plans, invoices, and more at Oru."
      />
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-24 relative">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[0.9] transition-colors uppercase">
              TEMPLATES <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">OS.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-2xl transition-colors">
              Get started quickly with pre-built templates designed for high-velocity agency operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {templates.map((template, i) => (
              <motion.div
                key={template}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 transition-all cursor-pointer group shadow-sm dark:shadow-none"
              >
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors shadow-sm dark:shadow-none">
                  <Layers className="w-6 h-6 text-zinc-400 dark:text-zinc-700 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:translate-x-1 transition-all tracking-tight transition-colors uppercase">{template}</h3>
                <p className="text-zinc-500 font-medium mt-4 leading-relaxed transition-colors">Ready-to-use template to get you started in minutes.</p>
                
                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 transition-colors uppercase">Template Module</span>
                   <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

