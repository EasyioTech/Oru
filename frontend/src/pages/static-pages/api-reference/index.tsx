import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';

const apis = [
  { method: 'GET', endpoint: '/projects', description: 'List all projects' },
  { method: 'POST', endpoint: '/projects', description: 'Create a new project' },
  { method: 'GET', endpoint: '/clients', description: 'List all clients' },
  { method: 'GET', endpoint: '/invoices', description: 'List all invoices' },
];

export default function APIReferencePage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">API Reference</h1>
          <p className="text-lg text-zinc-400 mb-8">Build integrations with the Oru API.</p>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-8">
            <p className="text-sm text-blue-400">Base URL: <code className="bg-black/30 px-2 py-1 rounded">https://api.Oru.io/v1</code></p>
          </div>

          <div className="space-y-4">
            {apis.map((api) => (
              <div key={api.endpoint} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-mono ${api.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {api.method}
                </span>
                <code className="text-sm text-white font-mono">{api.endpoint}</code>
                <span className="text-sm text-zinc-500 ml-auto">{api.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
