import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Bug, Rocket, ArrowRight, Zap, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const SoftwareDevIndustry = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="ERP for Software Development Agencies & IT Services"
        description="Streamline your software development agency. Manage sprints, resource billing, and dev capacity with Oru ERP."
        keywords="software agency erp, it services management software, dev shop erp, agile agency tool"
      />
      
      {/* Hero */}
      <section className="py-24 px-4 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Terminal size={400} />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Built by developers, <br/><span className="text-primary">for developers.</span></h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Stop forcing your dev team into rigid corporate ERPs. Use Oru to align your git workflows with your billing and project management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">Upgrade Your Stack</Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8">View API Docs</Button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Manage your tech stack and your bottom line.</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Integrated Code Metrics</h3>
                  <p className="text-muted-foreground">Pull data from GitHub/GitLab to track velocity and correlate it with project budgets automatically.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Bug />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Automated Sprint Billing</h3>
                  <p className="text-muted-foreground">Generate invoices directly from completed sprint points or billable hours tracked in JIRA or Oru's native tracker.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Rocket />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Deployment Tracking</h3>
                  <p className="text-muted-foreground">Track releases and associate them with client approvals and payment milestones.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-8 shadow-inner border">
             <div className="space-y-4">
                <div className="h-4 w-3/4 bg-primary/20 rounded"></div>
                <div className="h-4 w-1/2 bg-muted-foreground/20 rounded"></div>
                <div className="grid grid-cols-3 gap-2 py-4">
                  <div className="h-20 bg-primary/30 rounded flex items-center justify-center font-mono text-xs">SPRINT-01</div>
                  <div className="h-20 bg-primary/30 rounded flex items-center justify-center font-mono text-xs">SPRINT-02</div>
                  <div className="h-20 bg-primary/10 rounded flex items-center justify-center font-mono text-xs">BACKLOG</div>
                </div>
                <div className="h-32 bg-card rounded border flex items-center justify-center text-sm font-medium">
                   PROFITABILITY: +24.5%
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">No more $50,000 implementation fees.</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Oru ERP costs less than a single Senior Dev's monthly coffee budget.
          </p>
          <Link to="/pricing">
             <Button size="lg" variant="secondary" className="px-10 h-14 text-lg">See Pricing</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SoftwareDevIndustry;
