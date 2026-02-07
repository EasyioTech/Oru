import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

const posts = [
  { title: 'The Future of Agency Management', date: 'Dec 15, 2024', category: 'Industry', readTime: '5 min' },
  { title: 'How to Scale Your Agency Without Burning Out', date: 'Dec 10, 2024', category: 'Growth', readTime: '8 min' },
  { title: 'Financial Management Best Practices', date: 'Dec 5, 2024', category: 'Finance', readTime: '6 min' },
  { title: 'Project Management Tips for Remote Teams', date: 'Nov 28, 2024', category: 'Remote Work', readTime: '7 min' },
];

export default function BlogPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Blog</h1>
          <p className="text-lg text-zinc-400 mb-12">Insights, tips, and stories from the Oru team.</p>

          <div className="space-y-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{post.category}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{post.title}</h2>
              </motion.article>
            ))}
          </div>

          <p className="text-center text-zinc-500 mt-12">More posts coming soon...</p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
