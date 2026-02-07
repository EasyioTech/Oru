import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export default function CookiePolicyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">Cookie Policy</h1>
          </div>
          <p className="text-sm text-zinc-500 mb-8">Last updated: December 1, 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">What Are Cookies</h2>
              <p className="text-zinc-400">Cookies are small text files stored on your device that help us improve your experience and understand how our service is used.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Types of Cookies We Use</h2>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li><strong className="text-white">Essential:</strong> Required for the service to function</li>
                <li><strong className="text-white">Analytics:</strong> Help us understand usage patterns</li>
                <li><strong className="text-white">Preferences:</strong> Remember your settings</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Managing Cookies</h2>
              <p className="text-zinc-400">You can control cookies through your browser settings. Disabling certain cookies may affect functionality.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
