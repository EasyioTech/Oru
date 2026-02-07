import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, Code, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../components/PageWrapper';

const categories = [
  { icon: BookOpen, title: 'Getting Started', description: 'Learn the basics of Oru', articles: 12 },
  { icon: Users, title: 'Team Management', description: 'Managing your team effectively', articles: 8 },
  { icon: FileText, title: 'Billing & Invoicing', description: 'Financial features guide', articles: 15 },
  { icon: Code, title: 'API & Integrations', description: 'Developer documentation', articles: 10 },
];

export default function HelpCenterPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Help Center</h1>
          <p className="text-lg text-zinc-400">Find answers to common questions and learn how to use Oru.</p>
          
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15]"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors cursor-pointer group"
            >
              <cat.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{cat.title}</h3>
              <p className="text-sm text-zinc-500 mt-1">{cat.description}</p>
              <p className="text-xs text-zinc-600 mt-3">{cat.articles} articles</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <MessageCircle className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <h3 className="font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-sm text-zinc-400 mb-4">Our support team is here to help you.</p>
          <Link to="/contact">
            <Button className="bg-white text-black hover:bg-zinc-200 font-medium rounded-xl">Contact Support</Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
