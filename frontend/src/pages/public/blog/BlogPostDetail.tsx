import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { api } from '@/utils/api';

interface PostDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

const BlogPostDetail = () => {
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
      <div className="container mx-auto py-24 px-4 max-w-4xl space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-24 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <Link to="/blog">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  // Blog Posting Schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.featuredImage || "https://oruerp.com/default-blog.png",
    "author": {
      "@type": "Organization",
      "name": "Oru ERP Team",
      "url": "https://oruerp.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Oru ERP",
      "logo": {
        "@type": "ImageObject",
        "url": "https://oruerp.com/logo.png"
      }
    },
    "datePublished": post.publishedAt,
    "description": post.excerpt
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        keywords={post.seoKeywords?.join(', ')}
        schema={blogSchema}
      />

      <article className="pb-24">
        {/* Header Section */}
        <header className="py-16 bg-muted/50 border-b relative">
           <div className="container mx-auto max-w-4xl px-4">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-8 hover:underline">
                 <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
              <div className="flex gap-2 mb-6">
                 <Badge variant="secondary" className="px-3 py-1">{post.category}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                 {post.title}
              </h1>
              {post.subtitle && (
                <p className="text-xl text-muted-foreground mb-8 line-clamp-2">
                   {post.subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t pt-8">
                 <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">O</div>
                    <span className="font-semibold text-foreground">Oru Editorial Team</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                 </div>
                 <div className="flex-1" />
                 <div className="flex items-center gap-3">
                    <Share2 className="h-4 w-4 cursor-pointer hover:text-primary" />
                    <Twitter className="h-4 w-4 cursor-pointer hover:text-primary" />
                    <Linkedin className="h-4 w-4 cursor-pointer hover:text-primary" />
                 </div>
              </div>
           </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
           <div className="container mx-auto max-w-5xl px-4 -mt-10">
              <img src={post.featuredImage} alt={post.title} className="w-full h-auto aspect-[21/9] object-cover rounded-3xl shadow-2xl border bg-card" />
           </div>
        )}

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 py-16">
           <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-a:text-primary">
              {/* Note: In a real app we'd use a markdown renderer like react-markdown */}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
           </div>
           
           <div className="mt-20 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center">
              <h3 className="text-2xl font-bold mb-4">Master your agency's productivity</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                 Oru ERP is built specifically for modern agencies and development houses. Optimize your workflow today.
              </p>
              <div className="flex gap-4 justify-center">
                 <Link to="/agency-signup">
                    <Button size="lg" className="px-8 font-bold h-12">Start Trial</Button>
                 </Link>
                 <Link to="/pricing">
                    <Button size="lg" variant="outline" className="px-8 font-bold h-12">View Plans</Button>
                 </Link>
              </div>
           </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostDetail;
