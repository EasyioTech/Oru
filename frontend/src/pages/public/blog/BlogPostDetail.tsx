import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { PageWrapper } from '../../static-pages/components/PageWrapper';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Twitter, Linkedin, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { api } from '@/utils/api';
import { format } from 'date-fns';

interface PostDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  created_at: string;
  featured_image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetail | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/blog/public/${slug}`);
        if (response.data.success) {
          setPost(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6 py-40">
           <div className="space-y-12">
             <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
             <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-3xl" />
             <div className="h-96 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[3rem]" />
           </div>
        </div>
      </PageWrapper>
    );
  }

  if (!post) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-8">Signal Lost.</h1>
          <Link to="/blog" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 dark:text-zinc-50 hover:gap-5 transition-all">
            <ArrowLeft className="w-4 h-4" /> Return to Journal
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SEO 
        title={`${post.seoTitle || post.title} | Journal`}
        description={post.seoDescription || post.excerpt}
        keywords={post.seoKeywords?.join(', ')}
      />

      <div className="max-w-4xl mx-auto px-6 pt-20">
        {/* Navigation */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] font-black mb-20 hover:text-zinc-950 dark:hover:text-zinc-200 transition-all group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Journal
        </Link>

        {/* Header Section */}
        <header className="mb-20">
            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100">
                    {post.category || 'JOURNAL'}
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.publishedAt || post.created_at), 'MMMM dd, yyyy')}
                </div>
                <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    5 MIN READ
                </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[1] uppercase italic">
                {post.title}
            </h1>

            {post.subtitle && (
                <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic border-l-2 border-zinc-200 dark:border-zinc-800 pl-8 mt-12 mb-12">
                    {post.subtitle}
                </p>
            )}

            <div className="flex items-center justify-between py-10 border-y border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-950 dark:bg-white flex items-center justify-center font-black text-white dark:text-black">
                        E
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-950 dark:text-white">Easyio Editorial</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Protocol Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Twitter className="w-4 h-4 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer" />
                    <Linkedin className="w-4 h-4 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer" />
                    <Share2 className="w-4 h-4 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer" />
                </div>
            </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
            <div className="relative mb-24 rounded-[3rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50">
                <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-auto aspect-[16/9] object-cover grayscale-[1] hover:grayscale-0 transition-all duration-1000 opacity-90 hover:opacity-100"
                />
            </div>
        )}

        {/* Content Area */}
        <article className="prose prose-zinc dark:prose-invert max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic
            prose-p:text-xl prose-p:text-zinc-500 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:font-medium prose-p:italic
            prose-blockquote:border-zinc-200 dark:prose-blockquote:border-zinc-800 prose-blockquote:font-black prose-blockquote:uppercase prose-blockquote:tracking-widest prose-blockquote:text-zinc-900 dark:prose-blockquote:text-zinc-100
            prose-strong:text-zinc-950 dark:prose-strong:text-zinc-200 prose-strong:not-italic
            prose-img:rounded-[2.5rem] prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800
            pb-40">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* CTA Section */}
        <section className="pb-40">
            <div className="p-16 rounded-[4rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 dark:bg-zinc-900/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10 text-center">
                    <Sparkles className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-8" />
                    <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase mb-6">Scale the <span className="italic">Agency.</span></h2>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto mb-12 italic leading-relaxed">
                        Join the next generation of agency owners engineering velocity with the Easyio operating system.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/waitlist" className="w-full sm:w-auto">
                            <button className="w-full h-16 px-10 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
                                Join Protocol <ArrowRight className="inline-block ml-2 w-4 h-4" />
                            </button>
                        </Link>
                        <Link to="/pricing" className="w-full sm:w-auto">
                            <button className="w-full h-16 px-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                                View Pricing
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </PageWrapper>
  );
}
