import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Shield, Target, Cpu, Users, Zap, Globe, ArrowRight, Layers, Layout, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-600 dark:text-zinc-400 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white transition-colors duration-500">
      <SEO
        title="About Oru ERP - By Easyio Technologies"
        description="Learn about Oru ERP, the next-generation business management platform built by Easyio Technologies. Discover our mission to redefine enterprise software."
        keywords="oru erp, easyio technologies, easyiotech, about oru, erp mission, cloud enterprise software"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 dark:from-zinc-900/20 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm dark:shadow-none">
            <Rocket className="w-3 h-3" />
            <span>The Future of Enterprise Software</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            EVERYTHING IS <span className="text-zinc-400 dark:text-zinc-500">ORU.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Oru ERP is a masterpiece of business engineering, designed by <strong className="text-zinc-900 dark:text-zinc-300 transition-colors">Easyio Technologies</strong> to empower the world's most ambitious agencies and enterprises.
          </p>
          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <Link to="/agency-signup">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] border-none">
                Join the Mission
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Brand Power - Bento Grid Style */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Vision Card */}
            <div className="md:col-span-8 bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 group shadow-sm dark:shadow-none">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-800 transition-colors">
                  <Target className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight transition-colors">
                  Easyio Technologies: The Visionary Behind Oru
                </h2>
                <div className="space-y-6 text-lg text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium transition-colors">
                  <p>
                    <strong className="text-zinc-900 dark:text-zinc-300">Easyio Technologies</strong> (EasyioTech) is a frontier software lab dedicated to building high-performance systems. Our flagship product, <strong className="text-zinc-900 dark:text-zinc-300">Oru</strong>, represents the pinnacle of our research into user experience and system architecture.
                  </p>
                  <p>
                    We built Oru to be a <span className="text-zinc-700 dark:text-zinc-300 font-bold dark:font-normal">"Digital Nervous System"</span>—a seamless connection across every part of a business, from CRM and HRM to complex Project Management and Automated Billing.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Card */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center justify-center text-center hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none relative overflow-hidden group">
              <div className="text-8xl font-black text-black/[0.03] dark:text-white/5 tracking-tighter absolute select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                ORU
              </div>
              <div className="relative z-10">
                <div className="text-7xl font-black text-zinc-950 dark:text-white mb-2 tracking-tighter">ORU</div>
                <div className="text-[10px] tracking-[0.6em] uppercase text-zinc-400 dark:text-zinc-600 font-black">By Easyio Technologies</div>
              </div>
            </div>

            {/* Scale Card */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 transition-colors">
                <Globe className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors uppercase tracking-tight">Global Scale</h3>
              <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">Multi-currency, multi-language, and multi-tenant by design. Oru is ready for the world.</p>
            </div>

            {/* Precision Card */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 transition-colors">
                <Shield className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors uppercase tracking-tight">Fortress Security</h3>
              <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">Prioritizing data sovereignty and bank-grade encryption across all products.</p>
            </div>

            {/* Speed Card */}
            <div className="md:col-span-4 bg-white dark:bg-zinc-900/30 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 transition-colors">
                <Zap className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors uppercase tracking-tight">Velocity First</h3>
              <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">Built on a modern stack to ensure blazing fast performance, even with millions of records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The DNA - Features list */}
      <section className="py-32 px-4 bg-zinc-100 dark:bg-black relative transition-colors duration-500">
        <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white mb-20 tracking-tighter uppercase">THE <span className="text-zinc-400 dark:text-zinc-700 italic">ORU</span> DNA.</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            {[
              { icon: Cpu, title: "AI-Integrated", desc: "Built with native AI capabilities to predict bottlenecks and automate workflows." },
              { icon: Users, title: "User-Centric", desc: "Designed for humans. Oru ERP features a zero-distraction UI that increases output." },
              { icon: Layers, title: "Modular Engine", desc: "Scale any part of your business independently with our modular architecture." },
              { icon: Layout, title: "Next-Gen UI", desc: "A premium interface that feels more like an immersive OS than a boring tool." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 transition-all duration-300 shadow-sm dark:shadow-none">
                  <item.icon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors uppercase">{item.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-lg leading-relaxed font-medium transition-colors">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 px-4 text-center relative border-t border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-200 dark:from-zinc-900/30 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-10 tracking-tighter max-w-4xl mx-auto leading-[0.95] uppercase">
            READY TO EXPERIENCE <br /><span className="text-zinc-400 dark:text-zinc-600 italic font-serif lowercase">AESTHETIC</span> PERFORMANCE?
          </h2>
          <div className="flex flex-col items-center gap-8">
            <Link to="/agency-signup">
              <Button size="lg" className="rounded-full h-16 px-12 text-xl font-bold bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 transition-all duration-300 border-none">
                Create Your Instance
              </Button>
            </Link>
            <div className="flex flex-col gap-2 items-center text-zinc-400 dark:text-zinc-600">
              <span className="text-sm font-black uppercase tracking-[0.3em]">Official Domains</span>
              <div className="flex gap-4 font-bold text-zinc-500 dark:text-zinc-400 transition-colors">
                <span>oruerp.com</span>
                <span className="text-zinc-200 dark:text-zinc-800 transition-colors">|</span>
                <span>easyiotech.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;


