import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Landmark, Clock, Wallet, LayoutPanelLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SapVsOru = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="SAP Business One Alternative for Agencies | Oru ERP"
        description="Looking for an SAP Business One alternative? Oru ERP provides the same enterprise power with much lower complexity and cost."
        keywords="sap business one alternative, enterprise erp for agencies, sap vs oru, best large agency software"
      />

      <section className="py-24 px-4 bg-slate-50 border-b">
        <div className="container mx-auto text-center">
          <Landmark className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Enterprise Power, <br/>Without the Enterprise <span className="text-primary">Tax</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SAP is built for massive hardware manufacturers. Oru is built for modern, agile enterprises that need to move fast.
          </p>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
           <h2 className="text-3xl font-bold mb-12 text-center">Why large agencies are choosing Oru over SAP</h2>
           <div className="grid md:grid-cols-2 gap-12">
              <div className="flex gap-4">
                 <Clock className="h-8 w-8 text-primary shrink-0" />
                 <div>
                    <h3 className="font-bold text-xl mb-2">6-Month vs 1-Day</h3>
                    <p className="text-muted-foreground">Typical SAP implementations take 6-12 months. Oru agencies are fully migrated and productive within 48 hours.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <Wallet className="h-8 w-8 text-primary shrink-0" />
                 <div>
                    <h3 className="font-bold text-xl mb-2">Cost Optimization</h3>
                    <p className="text-muted-foreground">Eliminate the $100k+ licensing and consulting fees. Oru offers a flat, predictable subscription model.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <LayoutPanelLeft className="h-8 w-8 text-primary shrink-0" />
                 <div>
                    <h3 className="font-bold text-xl mb-2">Modern UX</h3>
                    <p className="text-muted-foreground">Users actually enjoy using Oru. No more training sessions for basic tasks or navigating 90s-style interfaces.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <Building2 className="h-8 w-8 text-primary shrink-0" />
                 <div>
                    <h3 className="font-bold text-xl mb-2">Cloud Native</h3>
                    <p className="text-muted-foreground">No on-premise servers required. No complicated VPNs. Access Oru securely from anywhere in the world.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Stop paying the "Brand Tax".</h2>
          <Link to="/agency-signup?source=sap-compare">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-xl gap-2">
              Start Your Migration <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="mt-6 opacity-80">Free white-glove migration for enterprise SAP users.</p>
        </div>
      </section>
    </div>
  );
};

export default SapVsOru;
