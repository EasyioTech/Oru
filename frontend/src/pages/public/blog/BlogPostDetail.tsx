import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { BLOG_POSTS } from '@/data/blogPosts';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlignLeft,
  Bookmark,
  Share2,
  ChevronRight,
  BookOpen,
  Gauge,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const post = useMemo(() => {
    return BLOG_POSTS.find((p) => p.slug === slug);
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  }, [post]);

  // Parse H2 headings to construct Table of Contents and inject section IDs
  const { processedContent, headings } = useMemo(() => {
    if (!post) return { processedContent: '', headings: [] };
    const list: { id: string; text: string }[] = [];
    let index = 0;
    const processed = post.content.replace(/<h2>(.*?)<\/h2>/gi, (_, text) => {
      index++;
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const id = `heading-section-${index}`;
      list.push({ id, text: cleanText });
      return `<h2 id="${id}">${text}</h2>`;
    });
    return { processedContent: processed, headings: list };
  }, [post]);

  // Track reading progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = window.scrollY;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
      }

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(headings[i].id);
            return;
          }
        }
      }
      if (headings.length > 0) {
        setActiveSection(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setMobileTocOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (!post || typeof window === 'undefined') return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${post.title} — via @oru_erp by @easyio_tech`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (typeof window === 'undefined') return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (!post) {
    return (
      <div className="min-h-screen pt-36 pb-24 px-4 max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Article Not Found</h1>
        <p className="text-muted-foreground text-sm">The guide you are looking for may have moved or been updated.</p>
        <Link to="/blog">
          <Button variant="outline" className="gap-2 rounded-xl text-xs">
            <ArrowLeft className="w-4 h-4" /> Return to Knowledge Hub
          </Button>
        </Link>
      </div>
    );
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      image: post.author.avatar ? `https://oruerp.com${post.author.avatar}` : undefined,
      worksFor: {
        '@type': 'Organization',
        name: post.author.company,
        url: post.author.companyUrl,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Oru ERP',
      url: 'https://oruerp.com',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Easyio Technologies',
        url: 'https://easyio.tech',
      },
      logo: {
        '@type': 'ImageObject',
        url: 'https://oruerp.com/images/landing/light.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://oruerp.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SEO
        title={post.seoTitle}
        description={post.seoDescription}
        keywords={post.seoKeywords.join(', ')}
        ogType="article"
        schema={jsonLd}
      />

      {/* Reading Progress Bar (Fixed Top) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-border/40 z-[60]">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Editorial Header Section */}
      <header className="pt-28 sm:pt-32 pb-10 px-4 sm:px-6 lg:px-8 xl:px-12 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="w-full max-w-[1760px] mx-auto">
          <div className="max-w-4xl xl:max-w-[860px] 2xl:max-w-[920px] mx-auto space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-foreground font-semibold truncate">{post.category}</span>
            </nav>

            {/* Badges / Meta */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                {post.category}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.18]">
              {post.title}
            </h1>

            {/* Standfirst / Excerpt */}
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-4xl">
              {post.excerpt}
            </p>

            {/* Author Byline & Social Share Controls */}
            <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-sm shrink-0"
                    loading="eager"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-xs shrink-0">
                    BA
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm sm:text-base">{post.author.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">CTO</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>Chief Technology Officer at</span>
                    <a
                      href={post.author.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      {post.author.company} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg text-xs"
                  onClick={handleShareTwitter}
                >
                  <Twitter className="w-3.5 h-3.5" /> Tweet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg text-xs"
                  onClick={handleShareLinkedIn}
                >
                  <Linkedin className="w-3.5 h-3.5" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg text-xs"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Content Layout with Wide Viewport Spacing */}
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 xl:gap-14 2xl:gap-16">
          
          {/* LEFT RAIL (Pinned to the far left with comfortable breathing margin) */}
          <aside className="hidden lg:block w-64 xl:w-72 2xl:w-80 shrink-0 sticky top-24 self-start space-y-6">
            <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground pb-2 border-b border-border/50">
                <AlignLeft className="w-4 h-4 text-primary" />
                <span>On This Page</span>
              </div>

              {headings.length > 0 ? (
                <nav className="space-y-1.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
                  {headings.map((h) => {
                    const isActive = activeSection === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all leading-snug block ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                        }`}
                      >
                        {h.text}
                      </button>
                    );
                  })}
                </nav>
              ) : (
                <p className="text-xs text-muted-foreground">General guide overview.</p>
              )}
            </div>

            {/* Quick Share Widget */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Share This Guide
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1 rounded-lg"
                  onClick={handleShareTwitter}
                >
                  <Twitter className="w-3.5 h-3.5" /> X
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1 rounded-lg"
                  onClick={handleShareLinkedIn}
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 rounded-lg"
                  onClick={handleCopyLink}
                  title="Copy Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </aside>

          {/* CENTER MAIN ARTICLE COLUMN (Expands comfortably, spacious line-lengths, centered) */}
          <main className="flex-1 min-w-0 max-w-4xl xl:max-w-[860px] 2xl:max-w-[920px] mx-auto space-y-8 w-full">
            {/* Mobile / Tablet Collapsible Table of Contents */}
            <div className="lg:hidden p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <button
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-primary" /> Table of Contents ({headings.length} sections)
                </span>
                <span className="text-xs text-primary font-semibold">{mobileTocOpen ? 'Hide' : 'Show'}</span>
              </button>

              {mobileTocOpen && (
                <div className="pt-2 border-t border-border/40 space-y-1 max-h-64 overflow-y-auto">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      className="w-full text-left py-1 text-xs text-muted-foreground hover:text-foreground truncate block"
                    >
                      • {h.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Takeaways Callout Card */}
            <section className="p-6 rounded-2xl border-l-4 border-primary border border-border/80 bg-primary/[0.03] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <FileText className="w-4 h-4 text-primary" />
                <span>Executive Summary & Key Takeaways</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Native Indian Localization:</strong> Automated GST splitting, e-invoicing, INR Lakhs/Crores numbering, and statutory payroll built-in.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Zero-Bloat Architecture:</strong> Sub-100ms response times engineered by Easyio Technologies without monolithic software lag.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Unified Operations:</strong> CRM leads, project Kanban, billable hours, and multi-branch ledgers in a single single-pane interface.</span>
                </li>
              </ul>
            </section>

            {/* Formatted Article Body */}
            <article className="blog-content">
              <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </article>

            {/* High-Impact In-Article Conversion Card */}
            <section className="my-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border/80 shadow-md text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Operating System</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Switch from Spreadsheets to Oru ERP
              </h3>

              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Stop losing hours to manual invoices, untracked project changes, and fragmented accounting. Oru ERP combines project tracking, GST invoicing, and team operations into one unified system.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/agency-signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto font-bold rounded-xl px-7 shadow-sm">
                    Start Free Account <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto font-semibold rounded-xl px-7">
                    See Pricing Plans
                  </Button>
                </Link>
              </div>
            </section>

            {/* Author Bio Box */}
            <section className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm flex flex-col sm:flex-row items-start gap-5 shadow-sm">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 shrink-0 rounded-full object-cover border-2 border-border shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-sm">
                  BA
                </div>
              )}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Written by {post.author.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{post.author.role}</p>
                  </div>
                  <a
                    href={post.author.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20"
                  >
                    Easyio Technologies <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </section>
          </main>

          {/* RIGHT RAIL (Pinned to the far right with comfortable breathing margin) */}
          <aside className="hidden xl:block w-72 2xl:w-80 shrink-0 sticky top-24 self-start space-y-6">
            {/* Quick Highlights Card */}
            <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground pb-2 border-b border-border/50 block">
                Why Oru ERP?
              </span>

              <ul className="space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <Gauge className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Sub-100ms Reaction:</strong> High-performance web architecture with zero lag.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Receipt className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>100% Indian GST & UT-GST:</strong> Automated e-invoices, e-way bills, and ITC match.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Project Margin Tracking:</strong> Capture true billable utilization and real profit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Kashmir & India Support:</strong> Direct engineering backing by Easyio Technologies.</span>
                </li>
              </ul>
            </div>

            {/* Direct Try CTA Card */}
            <div className="p-6 rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">Experience Oru ERP Today</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Join hundreds of growing Indian agencies and regional businesses scaling with confidence.
                </p>
              </div>

              <Link to="/agency-signup" className="block w-full">
                <Button className="w-full font-bold text-xs rounded-xl shadow-sm">
                  Start Free Account
                </Button>
              </Link>
            </div>
          </aside>

        </div>

        {/* Related Guides Grid */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border/40 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Related Research in {post.category}</span>
              </h3>
              <Link to="/blog" className="text-xs font-bold text-primary hover:underline">
                View All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                      {related.category}
                    </span>
                    <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {related.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{related.readTime}</span>
                    <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform">Read Guide →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
