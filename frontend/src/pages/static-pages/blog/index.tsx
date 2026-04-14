import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Layers } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';

const posts = [
  { title: 'The Future of Agency Management Systems', date: 'Dec 15, 2024', category: 'Protocol', readTime: '5 min' },
  { title: 'Scaling Agency Velocity Without Traditional Overhead', date: 'Dec 10, 2024', category: 'Growth', readTime: '8 min' },
  { title: 'Financial Management Protocols for High-Growth Teams', date: 'Dec 5, 2024', category: 'Finance', readTime: '6 min' },
  { title: 'Project Orchestration in a Post-Sync World', date: 'Nov 28, 2024', category: 'Remote', readTime: '7 min' },
];

export default function BlogPage() {
  return (
    <>
      <SEO
        title="Blog | Oru ERP Insights"
        description="Insights, tips, and stories from the Oru team at Easyio Technologies. Learn about agency management and growth."
        keywords="blog, agency growth, erp insights, management tips"
      />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-24 relative">
              <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-400/10 dark:bg-zinc-900/10 blur-[120px] rounded-full -z-10 transition-colors" />
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[0.9] transition-colors uppercase">
                THE <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">INTEL.</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-xl transition-colors">
                Deep dives into the mechanics of agency operations, growth protocols, and the future of enterprise software.
              </p>
            </div>

            <div className="space-y-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 rounded transition-colors">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 dark:text-zinc-700 transition-colors uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white group-hover:translate-x-1 transition-all uppercase tracking-tight leading-tight mb-8">
                      {post.title}
                    </h2>

                    <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-950 dark:group-hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
                      Read Protocol <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.01] transition-opacity group-hover:opacity-10 dark:group-hover:opacity-5">
                    <Layers className="w-32 h-32 text-zinc-950 dark:text-white" />
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-32 text-center">
              <div className="inline-flex items-center gap-4 text-zinc-200 dark:text-zinc-900 py-4 px-8 rounded-full border border-zinc-100 dark:border-zinc-900 transition-colors">
                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-800 animate-pulse" />
                <p className="font-black uppercase tracking-widest text-xs">Awaiting Next Sequence</p>
              </div>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}

