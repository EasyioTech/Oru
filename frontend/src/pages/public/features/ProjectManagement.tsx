import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Users, Clock, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Project Management Software for Agencies | Oru ERP"
        description="Enterprise-grade project management for agencies. Track projects, timelines, budgets, and team capacity with real-time visibility."
        keywords="project management software, agency project management, project tracking tool, project planning software"
      />

      <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Project Management</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage projects from <span className="text-primary">concept to completion</span>.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track deadlines, budgets, resources, and deliverables. Know exactly what's due, who's working on it, and how profitable it is.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-lg">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage projects</h2>
            <p className="text-lg text-muted-foreground">From planning to delivery, with visibility into profitability.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Timeline & Milestone Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Set project timelines and track milestones. Get alerts when tasks are at risk of missing deadlines.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Team Assignment & Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Assign team members to tasks. Collaborate in real-time and keep everyone aligned on project status.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Budget & Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track project budget vs actual spend. Monitor labor costs and prevent budget overruns.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-card">
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Deliverable Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Define project deliverables, track approval workflows, and maintain a complete audit trail.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Control project chaos with one platform</h2>
          <Link to="/agency-signup?feature=project-management">
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

export default ProjectManagement;
