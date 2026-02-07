import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

const sections = [
  { title: 'Quick Start Guide', items: ['Creating your agency', 'Inviting team members', 'Setting up projects'] },
  { title: 'Project Management', items: ['Creating projects', 'Task management', 'Time tracking', 'Milestones'] },
  { title: 'Financial Management', items: ['Invoicing', 'Expense tracking', 'GST compliance', 'Reports'] },
];

export default function DocsPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Documentation</h1>
          <p className="text-lg text-zinc-400 mb-12">Everything you need to know about using Oru.</p>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      <FileText className="w-4 h-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
