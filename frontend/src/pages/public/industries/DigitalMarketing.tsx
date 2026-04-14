import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DigitalMarketing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Digital Marketing Agencies"
        description="Digital marketing agency ERP. Manage campaigns, clients, billing, and team resources with Oru ERP."
        keywords="digital marketing agency software, marketing agency erp, campaign management, client management system"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Digital Marketing</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Run your <span className="text-primary">digital agency</span> like a business.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unify campaign management, team resources, client billing, and agency analytics in one platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for digital marketers</h2>
            <p className="text-lg text-muted-foreground">Manage multiple campaigns across multiple clients without losing profitability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-Campaign Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage hundreds of campaigns across SEO, SEM, social, email, and more. Track deliverables and KPIs per campaign.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Import campaign data from Google Ads, Facebook, HubSpot, and more. Centralize all metrics in one dashboard.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Client Profitability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Know which clients are truly profitable. Track ad spend, team time, and overhead per client.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"We went from losing money on clients we thought were profitable to actually understanding our metrics."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">RP</div>
              <div>
                <p className="font-bold">Rachel Perry</p>
                <p className="text-sm text-muted-foreground">CEO, Digital Momentum</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Scale your digital marketing agency</h2>
          <Link to="/agency-signup?industry=digital-marketing">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 300+ digital agencies using Oru globally.</p>
        </div>
      </section>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

export default DigitalMarketing;
