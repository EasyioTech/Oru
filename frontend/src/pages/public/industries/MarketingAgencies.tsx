import React from 'react';
import { SEO } from '@/components/shared/SEO';
import LandingPage from '@/components/landing/LandingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Users, BarChart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketingAgenciesIndustry = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Best ERP for Marketing & Advertising Agencies"
        description="Ranked #1 ERP for marketing agencies. Manage campaigns, creative resources, and agency profitability with Oru ERP."
        keywords="marketing agency erp, ad agency software, creative agency management, agency profitability tool"
      />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Industry Specific Solutions</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Everything your <span className="text-primary">Marketing Agency</span> needs to scale.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From project margins to creative workflows, Oru ERP handles the complexity so you can focus on the big ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the modern creative agency</h2>
            <p className="text-lg text-muted-foreground">Standard ERPs are too rigid. Oru is as flexible as your team.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Megaphone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Campaign Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track every deliverable, deadline, and billable hour across multiple clients and platforms in one unified view.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Resource Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Stop over-allocating your creative staff. Use real-time capacity planning to ensure project stability and profitability.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <BarChart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Profitability Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Know exactly which clients are profitable and which ones aren't with granular job-costing and overhead analysis.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof / Comparison */}
      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru converted our agency from a chaotic mess of spreadsheets into a high-performance growth machine."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">JD</div>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-muted-foreground">CEO, CreativeBloom Agencies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to transform your agency?</h2>
          <Link to="/agency-signup?industry=marketing">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 500+ agencies using Oru globally.</p>
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

export default MarketingAgenciesIndustry;
