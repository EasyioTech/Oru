import { motion } from 'framer-motion';
import { Users, ExternalLink } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export default function CommunityPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Community</h1>
          <p className="text-lg text-zinc-400 mb-12 max-w-xl mx-auto">Join thousands of agency professionals sharing tips, tricks, and best practices.</p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a href="https://discord.gg/Oru" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors group">
              <h3 className="font-semibold text-white mb-2 flex items-center justify-center gap-2">Discord <ExternalLink className="w-4 h-4" /></h3>
              <p className="text-sm text-zinc-400">Chat with the community in real-time</p>
            </a>
            <a href="https://github.com/Oru" target="_blank" rel="noopener noreferrer" className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors group">
              <h3 className="font-semibold text-white mb-2 flex items-center justify-center gap-2">GitHub <ExternalLink className="w-4 h-4" /></h3>
              <p className="text-sm text-zinc-400">Contribute to our open-source projects</p>
            </a>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
