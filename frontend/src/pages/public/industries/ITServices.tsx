import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITServices = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for IT Services & Software Development Companies"
        description="IT services ERP. Manage projects, developers, billable hours, and profitability with Oru."
        keywords="it services erp, software company management, developer time tracking, it project management"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">For IT & Software</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Run your <span className="text-primary">IT services company</span> with precision.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage developer allocation, track billable hours, and optimize project profitability.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Purpose-built for IT teams</h2>
            <p className="text-lg text-muted-foreground">Track development hours, manage projects, and maximize developer utilization.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Code2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Development Project Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track sprints, milestones, and deliverables. Link to GitHub, Jira, and Confluence for unified visibility.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Cpu className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Developer Utilization & Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Auto-sync time from Github commits. Track billable hours per developer, per project. Maximize realization.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Project Profitability Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Know which projects are profitable. Track cost vs revenue. Identify scope creep early.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru finally gave us the operational visibility we needed as we scaled from 5 to 50 developers."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">DK</div>
              <div>
                <p className="font-bold">David Kumar</p>
                <p className="text-sm text-muted-foreground">Founder, CloudTech Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Scale your IT services company</h2>
          <Link to="/agency-signup?industry=it-services">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 180+ IT services companies using Oru globally.</p>
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

export default ITServices;
