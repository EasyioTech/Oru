import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsultingFirms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Consulting Firms & Management Consultants"
        description="ERP for consulting firms. Manage billable hours, consultant utilization, and client projects with Oru."
        keywords="consulting firm erp, management consulting software, consultant management system, billable hours tracking"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">For Consulting</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            The <span className="text-primary">only ERP</span> consultants actually trust.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Maximize consultant utilization, track billable hours per project, and know your true profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything consultants need to grow</h2>
            <p className="text-lg text-muted-foreground">From engagement tracking to utilization analytics to revenue forecasting.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Engagement Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track engagements by partner, consultant, and project. Manage staffing, timelines, and deliverables.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Utilization & Realization Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Monitor utilization rates per consultant. Track realization against billing rates. Identify optimization opportunities.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Consultant Capacity Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Real-time view of consultant availability. Balance workload across engagements. Prevent burnout.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru gave us visibility into consultant profitability we never had before. Game changer."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">MC</div>
              <div>
                <p className="font-bold">Michael Chen</p>
                <p className="text-sm text-muted-foreground">Managing Partner, Summit Consulting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Scale your consulting firm with confidence</h2>
          <Link to="/agency-signup?industry=consulting">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 150+ consulting firms using Oru worldwide.</p>
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

export default ConsultingFirms;
