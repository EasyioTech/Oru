import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../components/PageWrapper';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em]">Get in Touch</h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
            Have questions about Oru? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-zinc-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15]"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Company</label>
                  <input
                    type="text"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15]"
                    placeholder="Acme Inc"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium rounded-xl">
                  Send Message
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <a href="mailto:hello@Oru.io" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                  hello@Oru.io
                </a>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="w-5 h-5" />
                  +91 98765 43210
                </div>
                <div className="flex items-start gap-3 text-zinc-400">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>WeWork, Bandra Kurla Complex<br />Mumbai, Maharashtra 400051</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <h3 className="font-semibold text-white mb-2">Enterprise Sales</h3>
              <p className="text-sm text-zinc-400 mb-4">Need a custom solution for your large team? Let's talk.</p>
              <Link to="/auth" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Schedule a demo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
