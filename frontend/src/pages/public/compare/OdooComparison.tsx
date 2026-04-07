import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OdooVsOru = () => {
  const comparison = [
    { feature: 'Setup Time', odoo: 'Days/Weeks', oru: 'Minutes', advantage: 'oru' },
    { feature: 'Pricing', odoo: 'Per User/App (Costly)', oru: 'Flat Tiered (Savings)', advantage: 'oru' },
    { feature: 'Modern AI Integration', odoo: 'Basic', oru: 'Deep / Native', advantage: 'oru' },
    { feature: 'Mobile Strategy', odoo: 'Separate App', oru: 'High-Perf PWA', advantage: 'oru' },
    { feature: 'User Interface', odoo: 'Functional / Dated', oru: 'Premium / Modern', advantage: 'oru' },
    { feature: 'Customizable Workflows', odoo: 'Developer Required', oru: 'No-Code Builder', advantage: 'oru' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Odoo vs Oru ERP: Why Oru is the Better Choice for Agencies"
        description="Comparing Odoo vs Oru ERP. Discover why agencies are switching to Oru for lower costs, faster setup, and a better user experience."
        keywords="odoo vs oru, odoo alternative, best erp for agencies, affordable erp software"
      />

      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Switch from Odoo to <span className="text-primary">Oru</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Odoo is powerful, but it's built for manufacturing in the 2010s. Oru is built for agencies in the 2020s.
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
                  <th className="p-6 font-bold text-lg text-center">Odoo</th>
                  <th className="p-6 font-bold text-lg text-center bg-primary/5 text-primary">Oru ERP</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-6 font-medium">{row.feature}</td>
                    <td className="p-6 text-center text-muted-foreground">{row.odoo}</td>
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
          <h2 className="text-3xl font-bold mb-6">Don't get locked into complex systems.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Most Odoo implementations cost $10,000+ in consultancy fees before you even send your first invoice. With Oru, you're live in 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/agency-signup?source=odoo-compare">
              <Button size="lg" className="h-14 px-10 text-xl gap-2">
                Get Started for Free <Zap className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OdooVsOru;
