import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';

const integrations = [
  { name: 'Google Calendar', category: 'Productivity', status: 'Available' },
  { name: 'Stripe', category: 'Payments', status: 'Available' },
  { name: 'QuickBooks', category: 'Accounting', status: 'Coming Soon' },
  { name: 'Zapier', category: 'Automation', status: 'Available' },
  { name: 'Figma', category: 'Design', status: 'Coming Soon' },
];

export default function IntegrationsPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Integrations</h1>
          <p className="text-lg text-zinc-400 mb-12">Connect Oru with your favorite tools.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((int, i) => (
              <motion.div
                key={int.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 mb-4" />
                <h3 className="font-semibold text-white">{int.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{int.category}</p>
                <span className={`inline-block mt-3 text-xs px-2 py-1 rounded ${
                  int.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'
                }`}>
                  {int.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
