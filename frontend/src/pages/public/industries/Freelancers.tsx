import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Freelancers = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Freelancers & Solo Consultants"
        description="Freelancer and solo consultant management software. Track projects, invoices, and income with Oru ERP."
        keywords="freelancer project management, freelance invoicing software, solo consultant tools, freelancer time tracking"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Freelancers & Solo</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Run your <span className="text-primary">freelance business</span> professionally.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage projects, track time, invoice clients, and grow your independent consulting business.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for independent professionals</h2>
            <p className="text-lg text-muted-foreground">Simple enough for solo work, powerful enough to scale your business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Project & Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Organize all your client projects in one place. Track deliverables, deadlines, and project status with ease.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Time Tracking & Invoicing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Log billable hours and automatically generate professional invoices. Get paid faster with online payment links.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Income & Business Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Understand your income patterns, client profitability, and business growth metrics.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru replaced 5 different tools and gave me back 5 hours per week on admin work."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">ML</div>
              <div>
                <p className="font-bold">Michael Lee</p>
                <p className="text-sm text-muted-foreground">Independent UX Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Grow your freelance business</h2>
          <Link to="/agency-signup?industry=freelancers">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 2,000+ freelancers and solo consultants using Oru.</p>
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

export default Freelancers;
