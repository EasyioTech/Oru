import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Check, 
  X, 
  Zap, 
  Building2,
  Crown,
  Star,
  Globe,
  ArrowRight,
  Sparkles,
  Activity,
  Shield,
  Rocket
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { SEO } from "@/components/shared/SEO";
import { PageWrapper } from "@/pages/static-pages/components/PageWrapper";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const { currency, loading, formatPrice } = useCurrency();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "CORE",
      price: 29,
      description: "The baseline for emerging creative teams.",
      icon: Activity,
      popular: false,
      features: [
        "5 Project Nodes",
        "10 Active Clusters",
        "Essential Intelligence",
        "Ledger Access",
        "Standard Encryption"
      ]
    },
    {
      name: "ORBIT",
      price: 99,
      description: "Industrial-grade project orchestration.",
      icon: Zap,
      popular: true,
      features: [
        "Unlimited Nodes",
        "Full Data Sovereignty",
        "Predictive Protocols",
        "Global Collaboration",
        "24/7 Command Support",
        "Neural Optimization",
        "Custom API Pipeline"
      ]
    },
    {
      name: "ENTERPRISE",
      price: 299,
      description: "Absolute sovereignty for global firms.",
      icon: Shield,
      popular: false,
      features: [
        "Dedicated Hardware",
        "Neural Grid Access",
        "White-label OS",
        "Bespoke Integration",
        "Advanced Gov-Cloud",
        "Quantum-Resist Arch",
        "Custom SLA Protocols"
      ]
    }
  ];

  const featureComparison = [
    {
      category: "COMPUTE ARCHITECTURE",
      features: [
        { name: "Project Nodes", core: "5", orbit: "Unlimited", enterprise: "Bespoke" },
        { name: "Data Transfer", core: "10GB", orbit: "100GB", enterprise: "Unmetered" },
        { name: "Neural Tokens", core: "Basic", orbit: "Advanced", enterprise: "Infinite" },
        { name: "Compute Priority", core: "Standard", orbit: "High", enterprise: "Dedicated" },
      ]
    },
    {
      category: "OPERATIONAL PROTOCOLS",
      features: [
        { name: "Financial Ledger", core: true, orbit: true, enterprise: true },
        { name: "Predictive Analytics", core: false, orbit: true, enterprise: true },
        { name: "Client Sovereignty", core: false, orbit: true, enterprise: true },
        { name: "Advanced Automation", core: false, orbit: false, enterprise: true },
      ]
    }
  ];

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-zinc-950 dark:text-white mx-auto transition-colors" />
      ) : (
        <X className="h-4 w-4 text-zinc-200 dark:text-zinc-800 mx-auto transition-colors" />
      );
    }
    return <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 transition-colors uppercase tracking-widest">{value}</span>;
  };

  return (
    <PageWrapper>
      <SEO 
        title="Pricing | The Investment in Velocity"
        description="Choose the right plan for your agency evolution. High-fidelity plans for high-growth teams."
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-32 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Resource Allocation Protocols</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                THE <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors"> INVESTMENT.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto transition-colors italic"
            >
                Select your operational tier. We engineer software for those who prioritize absolute professional performance at <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Easyio Technologies</strong>.
            </motion.p>
            
            {/* Toggle Switch */}
            <div className="mt-16 flex items-center justify-center gap-6">
                <span className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors ${!isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-800'}`}>Monthly</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-16 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex transition-colors overflow-hidden"
                >
                  <motion.div 
                    animate={{ x: isAnnual ? 32 : 0 }}
                    className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white shadow-xl" 
                  />
                </button>
                <span className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors ${isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-800'}`}>Annually</span>
            </div>
        </div>

        {/* Pricing Grid */}
        {loading ? (
             <div className="flex justify-center py-40">
                <div className="animate-spin w-12 h-12 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-400 rounded-full" />
             </div>
        ) : (
            <div className="grid lg:grid-cols-3 gap-8 mb-40 items-stretch">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-10 md:p-14 rounded-[3.5rem] flex flex-col transition-all duration-500 relative overflow-hidden group ${
                            plan.popular 
                            ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-2xl scale-[1.02] border-none ring-8 ring-zinc-100/10 dark:ring-zinc-900/10 z-20' 
                            : 'bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 shadow-sm dark:shadow-none'
                        }`}
                    >
                        <div className="mb-12 flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                                plan.popular 
                                ? 'bg-white/10 dark:bg-black/5 border-white/20 dark:border-black/10' 
                                : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900'
                            }`}>
                                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white dark:text-black' : 'text-zinc-400 dark:text-zinc-600'}`} />
                            </div>
                            {plan.popular && (
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-white dark:bg-black text-black dark:text-white shadow-lg">Standard Issue</span>
                            )}
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter uppercase italic transition-colors">{plan.name}</h2>
                        <p className="text-lg font-medium opacity-60 mb-10 leading-relaxed italic">{plan.description}</p>
                        
                        <div className="mb-12 mt-auto">
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-black tracking-tighter transition-all">
                                    {formatPrice(plan.price)}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">/ mth</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-14 border-t pt-8 transition-colors border-zinc-100 dark:border-zinc-900">
                            {plan.features.map(feature => (
                                <div key={feature} className="flex items-center gap-3">
                                    <Check className={`w-4 h-4 shrink-0 transition-colors ${plan.popular ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-800'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${plan.popular ? 'text-zinc-100 dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400'}`}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Link to={`/agency-signup?plan=${plan.name.toLowerCase()}&source=pricing`}>
                            <button className={`h-20 w-full rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4 group/btn ${
                                plan.popular 
                                ? 'bg-white dark:bg-black text-black dark:text-white hover:scale-105 shadow-2xl dark:shadow-none' 
                                : 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black hover:scale-[1.02]'
                            }`}>
                                Initialize Tier <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                        
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.01] scale-150 select-none">
                            <Rocket className="w-64 h-64" />
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-40">
            <div className="text-center mb-24">
                 <h2 className="text-4xl md:text-[6rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-6 uppercase transition-colors">THE <span className="text-zinc-400 dark:text-zinc-800 italic">ARCHITECTURE.</span></h2>
                 <p className="text-xl text-zinc-500 dark:text-zinc-500 max-w-2xl mx-auto font-medium transition-colors italic leading-relaxed">Detailed breakdown of the Oru infrastructure protocol.</p>
            </div>

            <div className="space-y-24">
                {featureComparison.map((category, idx) => (
                    <div key={idx}>
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[9px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-700 mb-8 transition-colors">
                            {category.category}
                        </div>
                        <div className="p-8 md:p-14 rounded-[3rem] bg-white dark:bg-zinc-900/5 border border-zinc-200 dark:border-zinc-900 transition-all overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-100 dark:border-zinc-900 transition-colors">
                                            <th className="pb-8 text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-800">Segment</th>
                                            <th className="pb-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-800">Core</th>
                                            <th className="pb-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-800">Orbit</th>
                                            <th className="pb-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-800">Enterprise</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-950 transition-colors">
                                        {category.features.map((feature, fIdx) => (
                                            <tr key={fIdx} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                                                <td className="py-8 text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 transition-colors group-hover:text-zinc-950 dark:group-hover:text-white">
                                                    {feature.name}
                                                </td>
                                                <td className="py-8 text-center">{renderFeatureValue(feature.core)}</td>
                                                <td className="py-8 text-center">{renderFeatureValue(feature.orbit)}</td>
                                                <td className="py-8 text-center">{renderFeatureValue(feature.enterprise)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Global CTA */}
        <motion.div 
            whileHover={{ scale: 0.995 }}
            className="mb-40 p-16 md:p-28 rounded-[4rem] bg-zinc-950 dark:bg-white text-white dark:text-black text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
        >
            <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9] transition-colors">
                    INITIALIZE <br/><span className="text-zinc-700 dark:text-zinc-200 italic"> MODERNIZATION.</span>
                </h3>
                <p className="opacity-60 text-xl font-medium mb-14 max-w-lg mx-auto leading-relaxed transition-colors">Ready to upgrade your operational infrastructure? Consult our architecture team for a bespoke pilot.</p>
                <Link to="/agency-signup?source=pricing-footer">
                  <button className="h-20 px-14 bg-white dark:bg-black text-black dark:text-white font-black text-xs tracking-[0.3em] uppercase rounded-full hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto shadow-2xl dark:shadow-none">
                      Consult Architect <Globe className="w-5 h-5" />
                  </button>
                </Link>
            </div>
            {/* Visual Echo */}
            <div className="absolute right-0 bottom-0 p-12 opacity-[0.05] dark:opacity-[0.1] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Shield className="w-64 h-64" />
            </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}



