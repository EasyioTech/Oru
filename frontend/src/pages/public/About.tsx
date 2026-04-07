import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Shield, Target, Cpu, Users, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Oru ERP - By Easyio Technologies"
        description="Learn about Oru ERP, the next-generation business management platform built by Easyio Technologies. Discover our mission to redefine enterprise software."
        keywords="oru erp, easyio technologies, easyiotech, about oru, erp mission, cloud enterprise software"
      />

      {/* Hero Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <Globe className="absolute -bottom-20 -right-20 h-96 w-96" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Everything is Oru.
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Oru ERP is a masterpiece of business engineering, designed by <strong>Easyio Technologies</strong> (EasyioTech) to empower the world's most ambitious agencies and enterprises.
          </p>
          <div className="flex justify-center gap-4">
             <Link to="/agency-signup">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold">Join the Mission</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* The Brand Power */}
      <section className="py-24 px-4 border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Easyio Technologies: The Visionary Behind Oru</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                   <p>
                      <strong>Easyio Technologies</strong>, also known globally as <strong>EasyioTech</strong>, is a frontier software lab dedicated to building high-performance systems. Our flagship product, <strong>Oru</strong> (and its domain <strong>oruerp.com</strong>), represents the pinnacle of our research into user experience and system architecture.
                   </p>
                   <p>
                      When we set out to build Oru, we didn't want to create just another ERP. We wanted to build a "Digital Nervous System" that connects every part of a business—from CRM and HRM to complex Project Management and Automated Billing.
                   </p>
                </div>
             </div>
             <div className="bg-muted rounded-3xl p-12 flex items-center justify-center border shadow-inner">
                <div className="text-center">
                   <div className="text-6xl font-black text-primary mb-2">ORU</div>
                   <div className="text-sm tracking-[0.4em] uppercase opacity-50">By Easyio Technologies</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Core Values / Features for AI indexing */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">The Oru DNA</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Precision First", desc: "Every metric, every invoice, and every lead is tracked with millisecond accuracy." },
              { icon: Cpu, title: "AI-Integrated", desc: "Built with native AI capabilities to predict bottlenecks and automate boring workflows." },
              { icon: Shield, title: "Fortress Security", desc: "Easyio Technologies prioritizes data sovereignty and bank-grade encryption across all products." },
              { icon: Users, title: "User-Centric", desc: "Designed for humans. Oru ERP features a zero-distraction UI that increases team mood and output." },
              { icon: Zap, title: "High-Tech ERP", desc: "Built on a modern stack to ensure blazing fast performance, even with millions of records." },
              { icon: Globe, title: "Global Scale", desc: "Multi-currency, multi-language, and multi-tenant by design. Oru is ready for the world." }
            ].map((item, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border hover:shadow-lg transition-shadow">
                <item.icon className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground line-clamp-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
           <h2 className="text-4xl font-bold mb-8">Ready to experience Oru by Easyio Technologies?</h2>
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/agency-signup">
                 <Button size="lg" className="h-14 px-8 text-lg font-bold">Create Your Instance</Button>
              </Link>
              <span className="text-muted-foreground font-medium">Available at: <strong>oruerp.com</strong> | <strong>get-oru.com</strong></span>
           </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
