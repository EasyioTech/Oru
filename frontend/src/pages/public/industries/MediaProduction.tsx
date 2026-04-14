import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Users, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MediaProduction = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Media Production & Video Production Companies"
        description="Media production ERP. Manage production projects, crew scheduling, budgets, and post-production workflows with Oru."
        keywords="media production software, video production erp, production management system, crew scheduling software"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">For Media & Production</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage <span className="text-primary">production chaos</span> like a pro.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule crews, track budgets, manage post-production, and bill clients with confidence.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for production teams</h2>
            <p className="text-lg text-muted-foreground">From pre-production through delivery, manage every phase with precision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Film className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Production Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage shoots, post-production phases, and deliverables. Track creative assets and approvals.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Crew & Equipment Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Schedule cinematographers, editors, and gear. Avoid double-booking. Maximize utilization.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Budget & Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track production costs in real-time. Manage talent fees, equipment rental, and post-production expenses.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru brought sanity to our production scheduling and budgeting. Best investment we made."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">JM</div>
              <div>
                <p className="font-bold">Jessica Martinez</p>
                <p className="text-sm text-muted-foreground">Producer, Creative Motion Studios</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Streamline your production pipeline</h2>
          <Link to="/agency-signup?industry=media-production">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 120+ production companies using Oru.</p>
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

export default MediaProduction;
