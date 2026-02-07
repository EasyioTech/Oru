import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';

const releases = [
  { version: '2.1.0', date: 'Dec 10, 2024', changes: ['New dashboard widgets', 'Improved project templates', 'Bug fixes'] },
  { version: '2.0.0', date: 'Nov 15, 2024', changes: ['Complete UI redesign', 'New reporting engine', 'API v2 launch'] },
  { version: '1.9.0', date: 'Oct 20, 2024', changes: ['GST compliance features', 'Multi-currency support', 'Performance improvements'] },
];

export default function ChangelogPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Changelog</h1>
          <p className="text-lg text-zinc-400 mb-12">See what's new in Oru.</p>

          <div className="space-y-8">
            {releases.map((release, i) => (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-8 border-l border-white/[0.06]"
              >
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500" />
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-lg font-semibold text-white">v{release.version}</span>
                  <span className="text-sm text-zinc-500">{release.date}</span>
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change) => (
                    <li key={change} className="text-zinc-400">• {change}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
