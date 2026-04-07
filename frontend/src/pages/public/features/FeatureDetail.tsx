import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, CheckCircle2, Globe, Shield, Zap } from 'lucide-react';
import { api } from '@/utils/api';

interface FeatureData {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  icon?: string;
  category: string;
}

const FeatureDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [feature, setFeature] = useState<FeatureData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        setLoading(true);
        // Using the new public detailed route
        const response = await api.get(`/catalog/public/${slug}`);
        if (response.data.success) {
          setFeature(response.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching feature:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchFeature();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 space-y-8">
        <Skeleton className="h-12 w-2/3 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Feature not found</h1>
        <p className="text-muted-foreground mb-8">The feature you are looking for might have moved or is under maintenance.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={feature.seoTitle || `${feature.title} - Oru ERP Feature`}
        description={feature.seoDescription || feature.description}
        keywords={feature.seoKeywords?.join(', ')}
      />

      {/* Hero Section */}
      <section className="py-24 px-4 bg-primary/5 border-b relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <Zap className="absolute top-10 right-10 h-64 w-64" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Feature: {feature.category}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {feature.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {feature.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg font-bold">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">Compare Plans</Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <h2 className="text-3xl font-bold">Why choose Oru for {feature.title.toLowerCase()}?</h2>
                <div className="space-y-4">
                  {[
                    "Enterprise-grade security and encryption.",
                    "Real-time sync across all your agency devices.",
                    "Native AI assistance to speed up workflows.",
                    "Zero-config implementation for your team."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="text-lg">{text}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Link to="/agency-signup">
                    <Button variant="ghost" className="text-lg gap-2 p-0 hover:bg-transparent hover:text-primary underline">
                      See it in action <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
             </div>
             
             <div className="bg-card border rounded-3xl p-8 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                   #1
                </div>
                <div className="space-y-6">
                   <div className="h-8 w-1/3 bg-muted rounded"></div>
                   <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-5/6 bg-muted rounded"></div>
                      <div className="h-4 w-4/6 bg-muted rounded"></div>
                   </div>
                   <div className="pt-4 border-t space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="font-bold">Efficiency Increase</span>
                         <span className="text-primary font-bold">+45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="font-bold">Team Collaboration</span>
                         <span className="text-primary font-bold">+92%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Global Trust */}
      <section className="py-20 bg-muted/30 border-y px-4">
         <div className="container mx-auto text-center">
            <div className="flex justify-center gap-12 flex-wrap opacity-50 grayscale">
               <div className="flex items-center gap-2 font-bold text-2xl"><Globe /> GLOBAL</div>
               <div className="flex items-center gap-2 font-bold text-2xl"><Shield /> SECURE</div>
               <div className="flex items-center gap-2 font-bold text-2xl"><Zap /> FAST</div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Empower your team with better {feature.title.toLowerCase()}.</h2>
          <Button size="lg" className="h-16 px-12 text-xl shadow-xl hover:shadow-2xl transition-all">
            Join the Oru Revolution Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FeatureDetail;
