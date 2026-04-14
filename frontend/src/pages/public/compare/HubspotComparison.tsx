import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HubspotVsOru = () => {
  const comparison = [
    { feature: 'CRM', hubspot: 'Excellent', oru: 'Full CRM + ERP', advantage: 'oru' },
    { feature: 'Financial Management', hubspot: 'None', oru: 'Complete Suite', advantage: 'oru' },
    { feature: 'Project Management', hubspot: 'Limited', oru: 'Enterprise-Grade', advantage: 'oru' },
    { feature: 'Team Capacity Planning', hubspot: 'No', oru: 'Advanced Allocation', advantage: 'oru' },
    { feature: 'Profitability Analytics', hubspot: 'Reporting Only', oru: 'Real-Time Dashboards', advantage: 'oru' },
    { feature: 'Price Point', hubspot: '$50-3,200/month (HubSpot+)', oru: '$99-999/month (All-in)', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="HubSpot vs Oru ERP: Complete Business Platform Comparison"
        description="Comparing HubSpot vs Oru ERP for agencies. See why Oru's unified platform is better for CRM, project management, and profitability."
        keywords="hubspot vs oru, hubspot alternative, agency management, crm with erp"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">HubSpot + Oru = Complete Platform</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            HubSpot is powerful for CRM, but you'll need other tools for project management, billing, and profitability. Oru does it all.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-6 font-bold text-lg">Feature Comparison</th>
                  <th className="p-6 font-bold text-lg text-center">HubSpot</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.hubspot}</td>
                    <td className="p-6 text-center bg-primary/5 font-bold">{row.oru}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">CRM is not enough. You need operations.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Keep HubSpot for lead management or replace it entirely with Oru's unified CRM + ERP platform that handles sales, operations, and profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=hubspot-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Try Oru Today <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HubspotVsOru;
