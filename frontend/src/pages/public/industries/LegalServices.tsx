import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalServices = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Law Firms & Legal Services"
        description="Law firm ERP software. Manage cases, billable hours, client matters, and firm profitability with Oru."
        keywords="law firm software, legal case management, billable hours tracking for law firms, legal project management"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Legal Services</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage your <span className="text-primary">law practice</span> efficiently.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track billable hours, manage cases, control overhead, and maximize firm profitability.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for law practices</h2>
            <p className="text-lg text-muted-foreground">From case intake to billing and collections, manage your entire practice workflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Briefcase className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Case & Matter Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track cases from intake through resolution. Manage documents, deadlines, and client communication in one place.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Time & Billable Hours Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Capture billable time per attorney, per case. Ensure accurate billing and prevent revenue leakage.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Practice Profitability Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Understand realization rates per attorney. Track matter profitability and identify cost drivers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru transformed how we track billable hours and understand matter profitability across the firm."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">RJ</div>
              <div>
                <p className="font-bold">Richard Johnson</p>
                <p className="text-sm text-muted-foreground">Managing Partner, Justice Legal Group</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Scale your law practice profitably</h2>
          <Link to="/agency-signup?industry=legal-services">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 110+ law firms using Oru.</p>
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

export default LegalServices;
