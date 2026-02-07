import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';

const items = [
  { status: 'done', title: 'Multi-currency Support', description: 'Handle invoices in multiple currencies' },
  { status: 'progress', title: 'Mobile App', description: 'Native iOS and Android apps' },
  { status: 'planned', title: 'AI-Powered Insights', description: 'Smart recommendations for your agency' },
  { status: 'planned', title: 'White-label Solution', description: 'Custom branding for your clients' },
];

export default function RoadmapPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Roadmap</h1>
          <p className="text-lg text-zinc-400 mb-12">See what we're building next.</p>

          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-start gap-4">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {item.status === 'done' ? 'Shipped' : item.status === 'progress' ? 'In Progress' : 'Planned'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
