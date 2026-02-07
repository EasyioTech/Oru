import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">Privacy Policy</h1>
          </div>
          <p className="text-sm text-zinc-500 mb-8">Last updated: December 1, 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="text-zinc-400">We collect information you provide directly to us, including name, email, company information, and usage data to improve our services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-zinc-400">We use collected information to provide, maintain, and improve our services, communicate with you, and ensure security.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
              <p className="text-zinc-400">We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular audits.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Your Rights</h2>
              <p className="text-zinc-400">You have the right to access, correct, or delete your personal data. Contact us at privacy@Oru.io for any requests.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
