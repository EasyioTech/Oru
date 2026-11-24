import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { BLOG_POSTS, BlogPost } from '@/data/blogPosts';
import { Search, Calendar, Clock, ArrowRight, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  'All Articles',
  'Kashmir & J&K',
  'India Compliance',
  'Agency Operations',
  'Enterprise & Tech',
] as const;

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Articles');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Articles': BLOG_POSTS.length };
    BLOG_POSTS.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All Articles' || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.isFeatured) || BLOG_POSTS[0];
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Oru ERP Journal — Enterprise Guides, GST & Agency Operations"
        description="Practical business guides on the best ERP systems in Kashmir, Jammu & Kashmir, and India. Real benchmarks, GST compliance guides, and agency profitability systems."
        keywords="best erp system in kashmir, best erp in jammu and kashmir, best erp in india, agency erp, easyio technologies, burhan ali"
      />

      {/* Editorial Hero Header */}
      <section className="pt-32 pb-14 px-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-semibold text-muted-foreground">
            <span>Engineering & Business Journal</span>
            <span>•</span>
            <a
              href="https://easyio.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline inline-flex items-center gap-1 font-bold"
            >
              Easyio Technologies <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            The ERP & Operations Journal
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-world guides on cloud ERP systems, Indian GST compliance, and agency profitability across Kashmir, India, and global markets. Written by engineers and business builders.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g., Kashmir, GST, Tally, Profitability)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  selectedCategory === cat ? 'bg-background/20 text-background' : 'bg-background/80 text-muted-foreground'
                }`}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article Banner */}
      {!searchQuery && selectedCategory === 'All Articles' && featuredPost && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="p-7 sm:p-9 rounded-2xl border border-border bg-card/60 shadow-sm hover:border-foreground/30 transition-all">
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
                    Featured Research
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                  </span>
                </div>

                <Link to={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground hover:text-primary transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {featuredPost.author.avatar ? (
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-[11px] shrink-0">
                        BA
                      </div>
                    )}
                    <span className="font-semibold text-foreground">{featuredPost.author.name}</span>
                    <span>• {featuredPost.author.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-44 w-full flex lg:flex-col justify-end pt-2 lg:pt-0">
                <Link to={`/blog/${featuredPost.slug}`} className="w-full">
                  <Button className="w-full font-bold rounded-xl gap-1.5 shadow-sm">
                    Read Guide <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/40">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {selectedCategory === 'All Articles' ? 'All Guides & Research' : selectedCategory}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
          </span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between p-6 rounded-xl border border-border bg-card/40 hover:border-foreground/30 hover:shadow-sm transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-primary text-[11px] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-[10px] text-foreground shrink-0">
                        BA
                      </div>
                    )}
                    <span className="font-medium text-foreground">{post.author.name}</span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                  >
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-base font-bold text-foreground">No matching articles found</p>
            <p className="text-xs text-muted-foreground mt-1">Try another search term or click a category above.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg text-xs"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Articles');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Engineering Authority & Company Attribution */}
      <section className="py-14 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <img
              src="/images/Burhan-Ali.webp.jpg"
              alt="Burhan Ali"
              className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-md"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-semibold text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>Parent Agency: Easyio Technologies</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Engineered by Easyio Technologies
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Oru ERP was developed by <strong>Easyio Technologies</strong> under Chief Technology Officer <strong>Burhan Ali</strong> to provide Indian businesses and global agencies with an enterprise-grade cloud operating system free of legacy bloat.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <a
              href="https://easyio.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Company Website: easyio.tech <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-muted-foreground">•</span>
            <Link to="/agency-signup" className="text-foreground hover:underline">
              Start Free Oru ERP Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
