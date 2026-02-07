import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

export default function GDPRPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-semibold tracking-[-0.02em]">GDPR Compliance</h1>
          </div>
          <p className="text-sm text-zinc-500 mb-8">Last updated: December 1, 2024</p>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Our Commitment</h2>
              <p className="text-zinc-400">Oru is committed to GDPR compliance and protecting the privacy rights of EU citizens.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Your Rights Under GDPR</h2>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Protection Officer</h2>
              <p className="text-zinc-400">Contact our DPO at dpo@Oru.io for any GDPR-related inquiries.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
