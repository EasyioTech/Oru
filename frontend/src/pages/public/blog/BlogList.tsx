import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { api } from '@/utils/api';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
}

const BlogList = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/blog/public?limit=12');
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Oru ERP Blog - Industry Insights & ERP Best Practices" 
        description="Stay ahead with the latest trends in agency management, ERP implementation, and business automation from the Oru ERP experts." 
      />

      {/* Hero */}
      <section className="py-24 px-4 bg-muted/30 border-b">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Oru Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Deep dives into automation, agency growth, and the future of enterprise resource planning.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[400px] rounded-2xl" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-muted">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                     {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                           <Badge variant="outline" className="text-4xl opacity-10 font-bold">ORU</Badge>
                        </div>
                     )}
                     <div className="absolute top-4 left-4">
                        <Badge className="bg-white/80 backdrop-blur text-primary hover:bg-white">{post.category}</Badge>
                     </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                       <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><User className="h-3 w-3" /> Oru Team</span>
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link to={`/blog/${post.slug}`} className="w-full">
                      <Button variant="ghost" className="w-full justify-between items-center group/btn">
                         Read Article <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
               <h3 className="text-2xl font-bold mb-2">No articles yet</h3>
               <p className="text-muted-foreground">Check back soon for our first insights!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4 bg-primary text-primary-foreground">
         <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay updated on the future of ERP</h2>
            <p className="text-primary-foreground/80 mb-10 text-lg">Join 5,000+ agency owners who receive our bi-weekly deep dives into business automation.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
               <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-xl text-foreground outline-none" />
               <Button variant="secondary" className="h-auto py-4 px-8 font-bold">Subscribe</Button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default BlogList;
