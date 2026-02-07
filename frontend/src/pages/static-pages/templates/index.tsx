import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

const templates = ['Project Plan', 'Invoice Template', 'Client Brief', 'Meeting Notes'];

export default function TemplatesPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Templates</h1>
          <p className="text-lg text-zinc-400 mb-12">Get started quickly with pre-built templates.</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {templates.map((template, i) => (
              <motion.div
                key={template}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors cursor-pointer group"
              >
                <Layers className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{template}</h3>
                <p className="text-sm text-zinc-500 mt-2">Ready-to-use template to get you started.</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
