import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClickupVsOru = () => {
  const comparison = [
    { feature: 'Task Management', clickup: 'Advanced', oru: 'Enterprise + Operations', advantage: 'oru' },
    { feature: 'Time Tracking', clickup: 'Feature-Limited', oru: 'Full Time Tracking', advantage: 'oru' },
    { feature: 'Billing & Invoicing', clickup: 'No', oru: 'Automated', advantage: 'oru' },
    { feature: 'Financial Reports', clickup: 'No', oru: 'Complete Accounting', advantage: 'oru' },
    { feature: 'Resource Allocation', clickup: 'Basic', oru: 'Advanced Planning', advantage: 'oru' },
    { feature: 'Learning Curve', clickup: 'Steep', oru: 'Intuitive', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ClickUp vs Oru ERP: Which is Better for Agencies?"
        description="Comparing ClickUp vs Oru ERP. See why Oru is better for agencies needing billing, financial management, and profitability tracking."
        keywords="clickup vs oru, clickup alternative, agency management software, unified erp platform"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">ClickUp Does Too Much, Oru Does Enough</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ClickUp is feature-rich but lacks financial management. Oru combines project management with billing and profitability tracking.
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
                  <th className="p-6 font-bold text-lg text-center">ClickUp</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.clickup}</td>
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
          <h2 className="text-3xl font-bold mb-6">Complexity costs time and money.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            ClickUp's steep learning curve isn't worth it for most agencies. Oru is simpler, purpose-built for agencies, and includes the financial management ClickUp lacks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=clickup-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Switch to Oru <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClickupVsOru;
