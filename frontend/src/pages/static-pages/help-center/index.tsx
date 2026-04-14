import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, Code, HelpCircle, MessageCircle, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';

const categories = [
  { icon: BookOpen, title: 'Getting Started', description: 'Initialize your Oru framework knowledge.', articles: 12 },
  { icon: Users, title: 'Team Protocol', description: 'Managing team nodes and hierarchies effectively.', articles: 8 },
  { icon: FileText, title: 'Financial Layer', description: 'Invoicing, billing, and ledger maintenance.', articles: 15 },
  { icon: Code, title: 'Core API', description: 'Developer documentation and integration maps.', articles: 10 },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-zinc-800 selection:text-white pt-32 pb-24">
      <SEO
        title="Help Center | Oru ERP Support"
        description="Find answers and learn how to use Oru ERP. Knowledge base, tutorials, and support documentation at Easyio Technologies."
        keywords="help, documentation, support, faq, knowledge base, tutorials"
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600 mb-8">
            <HelpCircle className="w-3 h-3" />
            <span>Support Infrastructure</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            HELP <br /><span className="text-zinc-800 italic uppercase">Center.</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
            Find answers to common questions and learn how to modulate Oru at high velocity.
          </p>
          
          <div className="mt-12 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              <input
                type="text"
                placeholder="Search the infrastructure..."
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-zinc-900/10 border border-zinc-900 text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-800 focus:bg-zinc-900/30 transition-all font-medium"
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
              className="p-10 rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-xl border border-zinc-900 hover:border-zinc-800 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-900 transition-colors">
                <cat.icon className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase tracking-[0.05em] group-hover:text-zinc-400 transition-colors">{cat.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">{cat.description}</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">{cat.articles} articles</span>
                <ArrowRight className="w-5 h-5 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 rounded-[2.5rem] bg-zinc-900/10 border border-zinc-900/50 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <MessageCircle className="w-10 h-10 text-zinc-700 mx-auto mb-6 transition-transform group-hover:scale-110" />
          <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">STILL NEED HELP?</h3>
          <p className="text-lg text-zinc-500 max-w-md mx-auto mb-8 font-medium">Our support infrastructure is online and ready for intervention.</p>
          <Link to="/contact">
            <Button className="rounded-full h-14 px-10 text-lg font-black bg-white text-black hover:bg-zinc-200 transition-all shadow-xl">
                Contact Support
            </Button>
          </Link>
          <div className="mt-12 text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">
            EASYIO SUPPORT PROTOCOL V4.0
          </div>
        </div>
      </div>
    </div>
  );
}

