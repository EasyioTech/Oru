import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';
import { Code2, Terminal, Cpu } from 'lucide-react';

const apis = [
  { method: 'GET', endpoint: '/v1/projects', description: 'Retrieve high-velocity project manifest' },
  { method: 'POST', endpoint: '/v1/projects', description: 'Initialize new project node' },
  { method: 'GET', endpoint: '/v1/clients', description: 'Synchronize client ecosystem data' },
  { method: 'GET', endpoint: '/v1/invoices', description: 'Extract financial protocol archives' },
];

export default function APIReferencePage() {
  return (
    <>
      <SEO
        title="API Reference | Oru Core Protocol"
        description="Build high-velocity integrations with the Oru API. Comprehensive documentation for Easyio Technologies developer ecosystem."
        keywords="api, developers, webhooks, integration, oru erp api"
      />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-24 relative">
              <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-400/10 dark:bg-zinc-900/10 blur-[120px] rounded-full -z-10 transition-colors" />
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[0.9] transition-colors uppercase">
                THE API <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">LAYER.</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-xl transition-colors">
                Interface directly with Oru's core engine. Build custom modules, automate sequences, and extend the ecosystem.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-zinc-950 dark:bg-white text-white dark:text-black mb-16 shadow-2xl transition-all relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-5 h-5 opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Core Endpoint</span>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xl md:text-2xl font-black tracking-tight bg-white/10 dark:bg-black/10 px-6 py-3 rounded-2xl">https://api.oru.tech</code>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 dark:bg-black/5 text-[10px] font-black uppercase tracking-widest opacity-40">
                    <Cpu className="w-3 h-3" />
                    v1.0.0
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 transform translate-x-12 translate-y-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Code2 className="w-64 h-64" />
              </div>
            </div>

            <div className="space-y-6">
              {apis.map((api, i) => (
                <motion.div 
                  key={api.endpoint} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all duration-500 flex flex-col md:flex-row md:items-center gap-8"
                >
                  <div className={`w-24 h-12 rounded-2xl flex items-center justify-center text-xs font-black tracking-widest border transition-all ${
                    api.method === 'GET' ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-900 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black' : 
                    'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950 dark:border-white'
                  }`}>
                    {api.method}
                  </div>
                  <div className="space-y-1">
                    <code className="text-lg font-black text-zinc-900 dark:text-white font-mono tracking-tight transition-colors">{api.endpoint}</code>
                    <p className="text-zinc-400 dark:text-zinc-600 font-medium text-sm transition-colors">{api.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-32 p-12 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-900 text-center transition-colors">
               <p className="text-zinc-300 dark:text-zinc-800 font-black uppercase tracking-[0.4em] text-[10px]">Developer Access Key Required</p>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}

