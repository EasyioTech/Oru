import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] mb-8">About Oru</h1>
          
          <div className="prose prose-invert prose-zinc max-w-none">
            <p className="text-xl text-zinc-400 leading-relaxed mb-8">
              Oru is the operating system for modern agencies. We help creative teams manage projects, track finances, automate workflows, and scale their businesses with one powerful, integrated platform.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 my-12">
              {[
                { number: '500+', label: 'Agencies' },
                { number: '10K+', label: 'Projects Managed' },
                { number: '₹50Cr+', label: 'Revenue Tracked' },
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <div className="text-3xl font-semibold text-white">{stat.number}</div>
                  <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Mission</h2>
            <p className="text-zinc-400">
              To empower agencies worldwide with tools that simplify operations, enhance collaboration, and drive growth. We believe that great software should get out of the way and let creative teams focus on what they do best.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Story</h2>
            <p className="text-zinc-400">
              Founded in 2024, Oru was born from the frustration of managing an agency with disconnected tools. Our founders experienced firsthand the chaos of juggling spreadsheets, multiple apps, and manual processes. They set out to build something better—a unified platform designed specifically for how modern agencies work.
            </p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
