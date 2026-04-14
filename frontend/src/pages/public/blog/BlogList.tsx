import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../static-pages/components/PageWrapper';
import { SEO } from '@/components/shared/SEO';
import { Calendar, Clock, ArrowRight, Newspaper, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/utils/api';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  created_at: string;
  featured_image?: string;
  categories?: string[];
}

export default function BlogList() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/blog/public?limit=12');
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to fetch journal entries.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <PageWrapper>
      <SEO 
        title="Journal | The Architecture of Agency"
        description="Deep dives into operational excellence, agency growth, and the future of enterprise software by Oru."
      />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Operational Intelligence</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                THE <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors"> JOURNAL.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto transition-colors italic"
            >
                Deep dives into the engineering of agency velocity and the future of corporate software design at <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Easyio Technologies</strong>.
            </motion.p>
        </div>

        {/* Content Section */}
        {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[500px] rounded-[3rem] bg-zinc-100 dark:bg-zinc-900/10 animate-pulse border border-zinc-200 dark:border-zinc-800/10" />
                ))}
            </div>
        ) : error ? (
            <div className="py-20 text-center">
                <p className="text-zinc-500 font-black uppercase tracking-widest italic">Signal Error: Failed to fetch journal entries.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-40">
                {posts?.map((post, i) => (
                    <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex flex-col h-full"
                    >
                        <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-all duration-700">
                                {post.featured_image ? (
                                    <img 
                                        src={post.featured_image} 
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100 grayscale-[1] group-hover:grayscale-0"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Sparkles className="w-20 h-20 text-zinc-500" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex items-center gap-2">
                                     <span className="px-4 py-1.5 rounded-full bg-white dark:bg-zinc-950 text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                                        {post.categories?.[0] || post.category || 'JOURNAL'}
                                     </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 px-4">
                                <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(post.publishedAt || post.created_at), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        5 MIN READ
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-950 dark:text-white mb-4 tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform duration-500 leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed italic mb-8">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 dark:text-white group-hover:gap-5 transition-all">
                                    Read Entry <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </motion.article>
                ))}
            </div>
        )}

        {/* Categories / Newsletter */}
        <section className="mb-40 grid lg:grid-cols-2 gap-20 py-20 border-t border-zinc-100 dark:border-zinc-900 transition-colors">
            <div className="space-y-8">
                <div className="inline-flex h-1 w-20 bg-zinc-200 dark:bg-zinc-900 rounded-full transition-colors" />
                <h2 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase italic transition-colors">ARCHITECTURAL <br/>UPDATES.</h2>
                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic transition-colors">Subscribe to the protocol updates and strategic insights from the Easyio team.</p>
            </div>
            
            <div className="flex flex-col justify-center">
                <div className="relative group/input max-w-lg">
                    <input 
                        type="email" 
                        placeholder="ENTER TERMINAL EMAIL" 
                        className="w-full h-20 px-10 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] text-xs font-black tracking-widest uppercase focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all font-mono"
                    />
                    <button className="absolute right-3 top-3 bottom-3 px-8 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl">
                        Subscribe
                    </button>
                </div>
                <p className="mt-6 text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-widest italic">Deployment frequency: Bi-weekly</p>
            </div>
        </section>
      </div>
    </PageWrapper>
  );
}
