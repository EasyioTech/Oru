import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AsanaVsOru = () => {
  const comparison = [
    { feature: 'Project Management', asana: 'Excellent', oru: 'Enterprise + Profitability', advantage: 'oru' },
    { feature: 'Time Tracking', asana: 'Limited', oru: 'Native & Integrated', advantage: 'oru' },
    { feature: 'Financial Management', asana: 'None', oru: 'Complete Accounting', advantage: 'oru' },
    { feature: 'Team Utilization Analytics', asana: 'Basic', oru: 'Advanced Capacity Planning', advantage: 'oru' },
    { feature: 'Client Billing & Invoicing', asana: 'No', oru: 'Automated Workflows', advantage: 'oru' },
    { feature: 'Platform Cost', asana: '$10-30.50/user/month', oru: 'Flat $99-999/month', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Asana vs Oru ERP: Better Alternative for Agencies"
        description="Comparing Asana vs Oru ERP for agency management. Discover why Oru's unified platform beats Asana for profitability tracking."
        keywords="asana vs oru, asana alternative, agency project management, project management erp"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Asana + Oru = Profit Visibility</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Asana manages projects brilliantly, but it's blind to profitability. Oru sees everything.
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
                  <th className="p-6 font-bold text-lg text-center">Asana</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.asana}</td>
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
          <h2 className="text-3xl font-bold mb-6">Beautiful project management doesn't guarantee profits.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Asana shows you what's being done. Oru shows you what's profitable. Know your project margin in real-time, not in quarterly reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=asana-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Get Profit Visibility <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AsanaVsOru;
