import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NetSuiteVsOru = () => {
  const comparison = [
    { feature: 'Implementation Time', netsuite: '6-12 Months', oru: '10 Minutes', advantage: 'oru' },
    { feature: 'Implementation Cost', netsuite: '$100K+', oru: 'Free', advantage: 'oru' },
    { feature: 'Monthly Cost (100 users)', netsuite: '$5,000+', oru: '$299-999', advantage: 'oru' },
    { feature: 'Customization', netsuite: 'Developer Required', oru: 'No-Code Interface', advantage: 'oru' },
    { feature: 'Agency-Focused Features', netsuite: 'Generic Enterprise', oru: 'Purpose-Built', advantage: 'oru' },
    { feature: 'Time to ROI', netsuite: '12+ Months', oru: '1-3 Months', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="NetSuite vs Oru ERP: Why Oru is Better for Agencies"
        description="Comparing NetSuite vs Oru ERP. See why agencies choose Oru for faster implementation, lower cost, and better agency-specific features."
        keywords="netsuite vs oru, netsuite alternative, agency erp, enterprise resource planning for agencies"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">NetSuite is Overkill. Try <span className="text-primary">Oru</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            NetSuite costs 6 months and $100K+ to implement. Oru works in 10 minutes for a fraction of the price.
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
                  <th className="p-6 font-bold text-lg text-center">NetSuite</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.netsuite}</td>
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
          <h2 className="text-3xl font-bold mb-6">Enterprise power without enterprise costs.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Most agencies don't need NetSuite's complexity. They need profitability insights, team management, and financial control. That's what Oru delivers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=netsuite-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Get Started Free <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NetSuiteVsOru;
