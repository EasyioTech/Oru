import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export default function TermsPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">Terms of Service</h1>
          </div>
          <p className="text-sm text-zinc-500 mb-8">Last updated: December 1, 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-zinc-400">By accessing or using Oru, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Use of Service</h2>
              <p className="text-zinc-400">You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the security of your account.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Subscription and Payment</h2>
              <p className="text-zinc-400">Paid features require a subscription. Payments are non-refundable except as required by law. We may change pricing with 30 days notice.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Termination</h2>
              <p className="text-zinc-400">We may terminate or suspend your account for violations of these terms. You may cancel your subscription at any time.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
