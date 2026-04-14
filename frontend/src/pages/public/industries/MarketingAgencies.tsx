import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Megaphone, Users, BarChart, ArrowRight, CheckCircle2, Sparkles, Zap, Layers, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketingAgenciesIndustry = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-600 dark:text-zinc-400 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white pt-24 pb-20 transition-colors duration-500">
      <SEO 
        title="Best ERP for Marketing & Advertising Agencies"
        description="Ranked #1 ERP for marketing agencies. Manage campaigns, creative resources, and agency profitability with Oru ERP."
        keywords="marketing agency erp, ad agency software, creative agency management, agency profitability tool"
      />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden border-b border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 dark:from-zinc-900/20 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-500 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm dark:shadow-none transition-all">
            <Megaphone className="w-3 h-3" />
            <span>Vertical Solutions</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 dark:text-white mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 uppercase">
            SCALING THE <br /><span className="text-zinc-400 dark:text-zinc-700 italic uppercase transition-colors">CREATIVES.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 transition-colors">
            Oru ERP handles the complexity of project margins and creative workflows so you can focus on the big ideas at <strong className="text-zinc-900 dark:text-zinc-300">Easyio Technologies</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] border-none">
                Start Free Trial
            </Button>
            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-black bg-transparent text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all duration-300">
                Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white mb-6 tracking-tighter uppercase transition-colors">BUILT FOR <span className="text-zinc-400 dark:text-zinc-800 italic">CREATIVE</span> VELOCITY.</h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-500 max-w-2xl mx-auto font-medium transition-colors">Standard ERPs are too rigid. Oru is as flexible as your agency's imagination.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <Rocket className="w-7 h-7 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Campaign Intelligence</h3>
                <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed max-w-2xl transition-colors">
                    Track every deliverable, deadline, and billable hour across multiple clients and platforms in one unified, high-performance view.
                </p>
            </div>

            <div className="md:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-end hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <Users className="w-7 h-7 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase transition-colors">Resource DNA</h3>
                <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">
                    Stop over-allocating staff. Use real-time capacity planning for stable profitability.
                </p>
            </div>

            <div className="md:col-span-4 bg-white dark:bg-zinc-900/10 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-end hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group">
                <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                    <BarChart className="w-7 h-7 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight uppercase transition-colors">Global Margins</h3>
                <p className="text-zinc-500 dark:text-zinc-500 font-medium transition-colors">
                    Know exactly which clients are profitable with granular job-costing and overhead analysis.
                </p>
            </div>

            <div className="md:col-span-8 bg-white dark:bg-zinc-900/20 backdrop-blur-xl border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-500 shadow-sm dark:shadow-none group flex items-center gap-12">
                <div className="flex-1">
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase transition-colors">Automated Billing</h3>
                    <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed transition-colors">
                        Convert approved timesheets into professional invoices in seconds. Support for multi-currency and global tax compliance.
                    </p>
                </div>
                <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-700 hidden lg:flex">
                    <Zap className="w-12 h-12 text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-4 relative overflow-hidden bg-zinc-100 dark:bg-black transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-200 dark:from-zinc-900/20 via-transparent to-transparent opacity-50 transition-opacity" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
            <Sparkles className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-10 transition-colors" />
            <h3 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white mb-12 tracking-tight italic leading-[1.1] transition-colors">
                "Oru converted our agency from a chaotic mess into a high-performance growth machine."
            </h3>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-zinc-950 dark:text-white text-2xl shadow-xl dark:shadow-none transition-all">JD</div>
              <div>
                <p className="font-black text-xl text-zinc-900 dark:text-white tracking-tight transition-colors transition-colors uppercase">John Doe</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em] transition-colors">CEO, CreativeBloom Agencies</p>
              </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-4 text-center relative border-t border-zinc-200 dark:border-zinc-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-zinc-200 dark:from-zinc-900/30 via-transparent to-transparent opacity-50 transition-colors" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-zinc-900 dark:text-white mb-10 tracking-tighter leading-[0.95] uppercase">
            READY TO TRANSFORM <br />YOUR <span className="text-zinc-400 dark:text-zinc-600 italic font-serif lowercase">identity?</span>
          </h2>
          <div className="flex flex-col items-center gap-8">
            <Link to="/agency-signup?industry=marketing">
              <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 transition-all duration-300 border-none shadow-2xl">
                Get Started Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <p className="text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] transition-colors">
                Join 500+ agencies using Oru globally.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingAgenciesIndustry;


