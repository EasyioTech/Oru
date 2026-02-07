import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, MapPin } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';

const positions = [
  { title: 'Senior Full-Stack Engineer', location: 'Remote / Mumbai', type: 'Full-time' },
  { title: 'Product Designer', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Manager', location: 'Mumbai', type: 'Full-time' },
  { title: 'Technical Writer', location: 'Remote', type: 'Part-time' },
];

export default function CareersPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">We're Hiring</span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mt-4 mb-4">Join Our Team</h1>
          <p className="text-lg text-zinc-400 mb-12">Help us build the future of agency management.</p>

          <div className="space-y-4">
            {positions.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors group flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <h3 className="font-semibold text-white mb-2">Don't see a fit?</h3>
            <p className="text-sm text-zinc-400 mb-4">We're always looking for talented people. Send your resume to careers@Oru.io</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
