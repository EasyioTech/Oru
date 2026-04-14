import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, TrendingUp, PhoneCall, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CRM = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CRM for Agencies | Customer Relationship Management | Oru ERP"
        description="Unified CRM for agencies. Manage leads, clients, contacts, and relationships all in one platform."
        keywords="crm software, customer relationship management, client management system, lead tracking software"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">CRM</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage all your <span className="text-primary">client relationships</span> in one place.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track leads, manage contacts, monitor communication history, and understand client needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for agency growth</h2>
            <p className="text-lg text-muted-foreground">Manage clients and track relationships seamlessly.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Contact & Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Store all client and contact information in one searchable database. Track organizational hierarchies and decision makers.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Mail className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Log all emails, calls, and interactions. Never lose context on what was discussed with a client.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <PhoneCall className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lead Pipeline Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track leads through your sales pipeline. Forecast revenue and identify bottlenecks in the sales process.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Client Insights & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Understand client lifetime value, project history, and profitability per client account.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Relationships are the foundation of your business</h2>
          <Link to="/agency-signup?feature=crm">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
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

export default CRM;
