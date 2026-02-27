import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { Button, GlowOrb } from '../fragments';
import { Link } from 'react-router-dom'; // Added Link import

export const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="pricing" className="relative py-24 lg:py-32 px-4 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.8)_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-zinc-400 mb-6">
            <Zap className="w-3 h-3 text-yellow-400" />
            Start your free trial today
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground tracking-tight leading-tight"
        >
          Your Agency's Best Year
          <br />
          <span className="text-muted-foreground/60">Starts Here.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Stop letting inefficiency eat your profits. Join the 500+ founders who switched to Oru and never looked back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/waitlist">
            <Button
              size="lg"
              variant="primary"
              className="px-8 h-12 text-base rounded-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join the Waitlist
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>

          <Link to="/waitlist">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base rounded-xl"
            >
              Get Early Access
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { icon: Clock, text: '14-day free trial' },
            { icon: Shield, text: 'No Credit Card. No Lock-in. Just Results.' },
            { icon: Zap, text: 'Setup in 5 minutes' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-muted-foreground/60" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 p-6 rounded-2xl bg-card/50 border border-border inline-flex items-center gap-6"
        >
          <div className="flex -space-x-3">
            {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500'].map((color, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${color} ring-2 ring-background flex items-center justify-center text-xs font-medium text-white`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs font-medium text-muted-foreground">
              +96
            </div>
          </div>
          <div className="text-left">
            <div className="text-sm text-foreground font-medium">Join this month's cohort</div>
            <div className="text-xs text-muted-foreground mt-0.5">100+ agencies signed up in the last 30 days</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
