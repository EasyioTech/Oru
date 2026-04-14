import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ZohoVsOru = () => {
  const comparison = [
    { feature: 'Learning Curve', zoho: 'Steep / Complex', oru: 'Intuitive / 10-Minute Setup', advantage: 'oru' },
    { feature: 'Integration Depth', zoho: 'Surface Level', oru: 'Deep Native', advantage: 'oru' },
    { feature: 'CRM + ERP + Billing', zoho: 'Separate Apps', oru: 'Unified Platform', advantage: 'oru' },
    { feature: 'Agency-Specific Features', zoho: 'Generic', oru: 'Purpose-Built', advantage: 'oru' },
    { feature: 'Team Capacity Planning', zoho: 'Limited', oru: 'Advanced', advantage: 'oru' },
    { feature: 'Support Quality', zoho: 'Community-Heavy', oru: 'Dedicated Support', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Zoho vs Oru ERP: Better Alternative for Agencies"
        description="Comparing Zoho vs Oru ERP. Discover why Oru's unified platform beats Zoho's separate apps for agency management."
        keywords="zoho vs oru, zoho alternative, agency erp software, unified business platform"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Replace Zoho with <span className="text-primary">Oru</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Zoho's many apps create complexity. Oru unifies everything agencies need in one platform.
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
                  <th className="p-6 font-bold text-lg text-center">Zoho</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.zoho}</td>
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
          <h2 className="text-3xl font-bold mb-6">Stop juggling multiple apps. Get one unified platform.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Agencies managing CRM, Billing, HR, and Analytics across Zoho's ecosystem waste time on integration. Oru gives you everything in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=zoho-compare">
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

export default ZohoVsOru;
