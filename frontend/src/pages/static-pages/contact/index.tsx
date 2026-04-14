import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, MessageSquare, Send, Phone, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SEO } from '../../../components/shared/SEO';
import { PageWrapper } from '../components/PageWrapper';

export default function ContactPage() {
  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <SEO
        title="Contact | Connect with Oru ERP"
        description="Reach out to Oru ERP support at Easyio Technologies. We're here to help you scale your business operations."
      />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-24 relative">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
            >
                <MessageSquare className="w-3 h-3" />
                <span>Transmission Terminal</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
            >
                ESTABLISH <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">LINK.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-medium transition-colors italic leading-relaxed"
            >
                Have questions about Oru? Our team at <strong className="text-zinc-900 dark:text-zinc-300 transition-colors italic not-italic">Easyio Technologies</strong> is ready to accelerate your trajectory.
            </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-40">
          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-sm dark:shadow-none transition-all"
          >
            {submitted ? (
              <div className="py-20 text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center mx-auto mb-10 transition-all">
                  <Send className="w-8 h-8 text-zinc-400 dark:text-zinc-600 transition-colors" />
                </div>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 tracking-tighter transition-colors uppercase italic">TRANSMISSION RECEIVED.</h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-lg font-medium transition-colors">Our communications cluster will respond within 24 hours.</p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-12 text-zinc-400 dark:text-zinc-600 hover:text-zinc-950 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors underline underline-offset-8"
                >
                    INITIATE NEW TRANSMISSION
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 block pl-1 transition-colors">Identity</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Cooper"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full h-16 px-6 rounded-2xl bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-black text-xs uppercase tracking-widest shadow-sm dark:shadow-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 block pl-1 transition-colors">Access Node (Email)</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full h-16 px-6 rounded-2xl bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-black text-xs uppercase tracking-widest shadow-sm dark:shadow-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 block pl-1 transition-colors">Corporate Entity</label>
                  <input
                    type="text"
                    placeholder="Acme Design Labs"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="w-full h-16 px-6 rounded-2xl bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all font-black text-xs uppercase tracking-widest shadow-sm dark:shadow-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700 block pl-1 transition-colors">Manifest Data (Message)</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Describe your operational requirements..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full p-8 rounded-3xl bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all resize-none font-medium text-lg leading-relaxed shadow-sm dark:shadow-none"
                  />
                </div>
                <button type="submit" className="w-full h-20 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.2em] uppercase rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-2xl dark:shadow-none flex items-center justify-center gap-4">
                  DISPATCH TRANSMISSION
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.01] transition-opacity">
                <MessageSquare className="w-64 h-64 text-zinc-950 dark:text-white" />
            </div>
          </motion.div>

          {/* Info Section */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-[3rem] p-10 md:p-14 shadow-sm dark:shadow-none transition-all"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-700 mb-12 transition-colors italic">Direct Access Nodes</h3>
              <div className="space-y-12">
                {[
                    { icon: Mail, label: 'Email Protocol', value: 'hello@oruerp.com', href: 'mailto:hello@oruerp.com' },
                    { icon: Phone, label: 'Direct Stream', value: '+91 98765 43210' },
                    { icon: MapPin, label: 'Physical Terminal', value: 'Easyio Labs, BKC, Mumbai 400051' }
                ].map((item) => (
                    <div key={item.label} className="flex gap-8 group">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center shrink-0 group-hover:border-zinc-400 dark:group-hover:border-zinc-700 transition-all">
                            <item.icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                            <span className="block text-zinc-300 dark:text-zinc-800 text-[10px] font-black uppercase tracking-widest transition-colors">{item.label}</span>
                            {item.href ? (
                                <a href={item.href} className="text-2xl font-black text-zinc-900 dark:text-white hover:text-zinc-500 transition-colors tracking-tighter truncate block uppercase italic">{item.value}</a>
                            ) : (
                                <div className="text-2xl font-black text-zinc-910 dark:text-white transition-colors tracking-tighter uppercase italic">{item.value}</div>
                            )}
                        </div>
                    </div>
                ))}
              </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-950 dark:bg-white border border-zinc-950 dark:border-white rounded-[3rem] p-12 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-pointer shadow-2xl"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-white dark:text-black mb-2 tracking-tighter uppercase italic">ENTERPRISE CLUSTER.</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium transition-colors text-lg">Custom deployment for large fleets.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 shadow-2xl">
                    <ArrowUpRight className="w-7 h-7 text-black dark:text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.03] scale-150 rotate-[12deg] group-hover:rotate-0 transition-transform duration-1000">
                <Globe className="w-64 h-64 text-white dark:text-black" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}



