import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MondayVsOru = () => {
  const comparison = [
    { feature: 'Project Management', monday: 'Basic', oru: 'Enterprise-Grade', advantage: 'oru' },
    { feature: 'Financial Management', monday: 'None', oru: 'Full Suite', advantage: 'oru' },
    { feature: 'Profitability Analytics', monday: 'No', oru: 'Real-Time Dashboards', advantage: 'oru' },
    { feature: 'Resource Planning', monday: 'Limited', oru: 'Advanced Capacity Planning', advantage: 'oru' },
    { feature: 'Billable Hours Tracking', monday: 'Add-on', oru: 'Native', advantage: 'oru' },
    { feature: 'Price Point', monday: '$8-16/user/month', oru: 'Flat Rate from $99/month', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Monday.com vs Oru ERP: Which is Better for Agencies?"
        description="Comparing Monday.com vs Oru ERP for agency management. See why Oru is better for profitability tracking, financial management, and billable hours."
        keywords="monday vs oru, monday.com alternative, best project management erp, agency management software"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Move from Monday.com to <span className="text-primary">Oru</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Monday.com is great for task management, but it's not built for agency profitability. Oru is.
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
                  <th className="p-6 font-bold text-lg text-center">Monday.com</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.monday}</td>
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
          <h2 className="text-3xl font-bold mb-6">Project management without profit visibility is just chaos.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oru combines Monday's ease of use with financial management, profitability analytics, and team capacity planning—so you can see which projects actually make money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=monday-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Try Oru Free <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MondayVsOru;
