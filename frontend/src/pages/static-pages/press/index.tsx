import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../components/PageWrapper';

export default function PressPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-4">Press</h1>
          <p className="text-lg text-zinc-400 mb-12">Media resources and company news.</p>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8">
            <h3 className="font-semibold text-white mb-4">Press Contact</h3>
            <p className="text-zinc-400 mb-2">For media inquiries, please contact:</p>
            <a href="mailto:press@Oru.io" className="text-blue-400 hover:text-blue-300">press@Oru.io</a>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">Brand Assets</h2>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-zinc-400 mb-4">Download our logo, screenshots, and brand guidelines.</p>
            <Button className="bg-white text-black hover:bg-zinc-200">Download Press Kit</Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
