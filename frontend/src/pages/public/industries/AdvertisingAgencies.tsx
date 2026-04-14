import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvertisingAgencies = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Advertising & Full-Service Agencies"
        description="Advertising agency management software. Manage creative teams, client projects, and agency profitability with Oru."
        keywords="advertising agency software, ad agency erp, creative team management, advertising project management"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Advertising & Creative</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The operating system for <span className="text-primary">modern ad agencies</span>.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage creative workflows, client budgets, team capacity, and agency growth from one platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for advertising excellence</h2>
            <p className="text-lg text-muted-foreground">Manage creative, strategy, and accounts teams with real-time profitability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Creative Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage creative briefs, concepting, production, and revisions with clear timelines and approvals.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Team & Resource Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Allocate creatives, strategists, and account teams across multiple accounts. Optimize utilization.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Account & Campaign Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track margin per account and campaign. Understand true profitability across your entire agency.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru helped us transition from a project shop to a profitable, scalable agency."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">TW</div>
              <div>
                <p className="font-bold">Tom Wilson</p>
                <p className="text-sm text-muted-foreground">CEO, Nexus Advertising</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Transform your agency today</h2>
          <Link to="/agency-signup?industry=advertising">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 250+ advertising agencies using Oru.</p>
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

export default AdvertisingAgencies;
