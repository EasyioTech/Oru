import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FreshworksVsOru = () => {
  const comparison = [
    { feature: 'CRM', freshworks: 'Solid', oru: 'Full CRM + ERP', advantage: 'oru' },
    { feature: 'Support Ticketing', freshworks: 'Excellent', oru: 'Available', advantage: 'freshworks' },
    { feature: 'Project Management', freshworks: 'Limited', oru: 'Enterprise-Grade', advantage: 'oru' },
    { feature: 'Financial Management', freshworks: 'None', oru: 'Complete Suite', advantage: 'oru' },
    { feature: 'Agency-Specific Features', freshworks: 'Generic', oru: 'Purpose-Built', advantage: 'oru' },
    { feature: 'Unified Platform', freshworks: 'Multi-App', oru: 'Single Dashboard', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Freshworks vs Oru ERP: Comparison for Agencies"
        description="Comparing Freshworks vs Oru ERP. See why Oru's unified platform is better for agencies needing operations and profitability management."
        keywords="freshworks vs oru, freshworks alternative, agency crm erp, business management software"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Freshworks for CRM, Oru for Operations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Freshworks excels at customer support. Oru adds project management, billing, and profitability—all in one platform.
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
                  <th className="p-6 font-bold text-lg text-center">Freshworks</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.freshworks}</td>
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
          <h2 className="text-3xl font-bold mb-6">CRM is just one piece of the puzzle.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Keep Freshworks for support if you love it, but replace the rest of your stack with Oru's all-in-one platform for projects, billing, and profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=freshworks-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Complete Your Stack <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreshworksVsOru;
