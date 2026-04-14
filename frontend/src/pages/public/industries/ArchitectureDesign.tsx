import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArchitectureDesign = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Best ERP for Architecture & Design Studios"
        description="Architecture and design studio ERP. Manage design projects, teams, and profitability with Oru."
        keywords="architecture firm software, design studio management, architecture project management, design studio erp"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Architecture & Design</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage your <span className="text-primary">design studio</span> with precision.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track design projects, manage creative teams, and understand project profitability in real-time.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for creative studios</h2>
            <p className="text-lg text-muted-foreground">From concept to delivery, manage every design project with complete visibility.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Palette className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Design Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage design briefs, concept phases, revisions, and final deliverables. Track creative assets and client approvals.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Creative Team Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Allocate designers, developers, and project managers across multiple projects. Optimize utilization and prevent burnout.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Project Profitability Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Know which projects are truly profitable. Track hourly rates, scope changes, and project margin in real-time.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-y px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-2xl border">
            <h3 className="text-2xl font-bold mb-8 text-center italic">"Oru helped us finally understand our design project economics and scale profitably."</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">SA</div>
              <div>
                <p className="font-bold">Sarah Anderson</p>
                <p className="text-sm text-muted-foreground">Creative Director, Design Forward Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Build a scalable design business</h2>
          <Link to="/agency-signup?industry=architecture-design">
            <Button size="lg" className="h-14 px-10 text-xl gap-2">
              Get Started Now <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground">Join 95+ design studios using Oru globally.</p>
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

export default ArchitectureDesign;
