import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { ArrowRight, Briefcase, MapPin, Sparkles, Globe, Heart, Zap } from 'lucide-react';
import { SEO } from '../../../components/shared/SEO';

const positions = [
  { title: 'Senior Full-Stack Engineer', location: 'Remote / Mumbai', type: 'Full-time' },
  { title: 'Product Designer', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Manager', location: 'Mumbai', type: 'Full-time' },
  { title: 'Technical Writer', location: 'Remote', type: 'Part-time' },
];

export default function CareersPage() {
  return (
    <PageWrapper>
      <SEO
        title="Careers | Build the Trajectory"
        description="Join the Easyio team engineering the future of agency management. High-velocity roles for visionary talent."
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-32 relative pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 dark:text-zinc-600 mb-8 shadow-sm dark:shadow-none transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visionary Expansion</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-[8rem] font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.8] transition-colors uppercase"
          >
            BUILD THE <br /><span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">TRAJECTORY.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-medium transition-colors italic leading-relaxed"
          >
            We're building the infrastructure of high-velocity teams at <strong className="text-zinc-950 dark:text-zinc-200 not-italic">Easyio Technologies</strong>. Help us define the next era of operation protocol.
          </motion.p>
        </div>

        {/* Culture Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-40">
            {[
                { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world. We believe in high-fidelity talent over local timezones.' },
                { icon: Zap, title: 'High Velocity', desc: 'We ship daily. Our cycle time is measured in hours, engineering at the speed of thought.' },
                { icon: Heart, title: 'Deep Purpose', desc: 'Solving real structural problems for 500+ global agencies and counting.' }
            ].map((item, i) => (
                <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="p-10 rounded-[3rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all group duration-700 overflow-hidden relative"
                >
                    <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-10 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-all duration-700 shadow-inner">
                        <item.icon className="w-8 h-8 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-3xl font-black text-zinc-950 dark:text-white mb-4 tracking-tighter transition-colors uppercase italic leading-tight">{item.title}</h3>
                    <p className="text-xl text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed transition-colors italic leading-relaxed">{item.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-6 max-w-5xl mx-auto pb-40">
          <div className="flex items-center justify-between mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 transition-colors">Open Clusters</h2>
              <div className="h-[1px] flex-1 mx-12 bg-zinc-100 dark:bg-zinc-900 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-800 transition-colors">{positions.length} Openings</span>
          </div>
          {positions.map((job, i) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm dark:shadow-none transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div>
                <h3 className="text-3xl font-black text-zinc-950 dark:text-white group-hover:translate-x-1 transition-all tracking-tighter uppercase italic">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700 mt-4 transition-colors">
                  <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" />{job.type}</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:border-zinc-950 dark:group-hover:border-white transition-all flex items-center justify-center shrink-0">
                <ArrowRight className="w-6 h-6 text-zinc-300 dark:text-zinc-700 group-hover:text-white dark:group-hover:text-black transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <section className="pb-40">
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 md:p-24 rounded-[4rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center relative overflow-hidden group shadow-2xl transition-all duration-700"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-100 dark:bg-zinc-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h3 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter transition-colors uppercase italic leading-[0.8]">DON'T SEE A <br/><span className="text-zinc-300 dark:text-zinc-800 transition-colors">FIT?</span></h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium mb-12 transition-all italic leading-relaxed">
                        We're always looking for high-velocity talent. Send your trajectory manifest to <strong className="text-zinc-950 dark:text-zinc-200 not-italic underline underline-offset-8 decoration-zinc-200 dark:decoration-zinc-800">careers@aru.io</strong>
                    </p>
                    <button className="h-20 px-12 bg-zinc-950 dark:bg-white text-white dark:text-black font-black text-xs tracking-[0.3em] uppercase rounded-2xl hover:scale-105 transition-all shadow-xl">
                        Submit Manifest
                    </button>
                </div>
            </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
}
