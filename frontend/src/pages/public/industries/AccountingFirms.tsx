import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, BarChart3, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountingFirms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Accounting Firms & CPA Practices"
        description="Accounting firm software. Manage clients, billable hours, engagements, and firm profitability with Oru."
        keywords="accounting firm software, cpa firm management, accounting practice management, billable hours software for accountants"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Accounting & CPA</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Run your <span className="text-primary">accounting practice</span> like a business.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage client engagements, track billable time, and maximize firm profitability with real-time analytics.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Purpose-built for accounting firms</h2>
            <p className="text-lg text-muted-foreground">From engagement setup to billing and collections, manage your entire practice.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Calculator className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Engagement & Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track all client engagements. Manage scope, deadlines, and deliverables with complete visibility across the firm.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Accountant Utilization & Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track billable hours per accountant, per engagement. Monitor realization rates and prevent revenue leakage.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Firm Profitability Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Understand engagement profitability. Track margin by service type and identify optimization opportunities.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru gave us the profitability insights we needed to make better pricing and staffing decisions."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">PK</div>
              <div>
                <p className="font-bold">Patricia Kim</p>
                <p className="text-sm text-muted-foreground">Managing Partner, Apex Accounting Group</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Scale your accounting firm</h2>
          <Link to="/agency-signup?industry=accounting-firms">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 130+ accounting and CPA firms using Oru.</p>
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

export default AccountingFirms;
