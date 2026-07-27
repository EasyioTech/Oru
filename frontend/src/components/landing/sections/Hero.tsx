import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '../fragments';
import { GridPattern, GlowOrb } from '../fragments';
import { Link } from 'react-router-dom';

const TextReveal = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const words = children.split(' ');

  return (
    <span className="inline-flex flex-wrap justify-center">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] py-2">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.08,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const ShimmerBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-md group mb-8 cursor-default"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
    <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      Oru ERP 2.0 is now available
    </span>
    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
  </motion.div>
);

const DashboardPreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
    className="relative mt-20 lg:mt-32 group/dashboard w-full max-w-5xl mx-auto"
  >
    {/* Enhanced Glow Effect */}
    <div
      className="absolute -inset-4 sm:-inset-8 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] blur-3xl opacity-50 group-hover/dashboard:opacity-70 transition-opacity duration-700 pointer-events-none will-change-transform transform-gpu"
      style={{ transform: 'translateZ(0)' }}
    />

    {/* Main Browser Window */}
    <div className="relative rounded-2xl border border-border/50 bg-background/40 backdrop-blur-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(var(--background),0.5)]">
      {/* Browser Top Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 sm:px-6 py-1 rounded-full bg-muted/60 border border-border/50 text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium tracking-wide flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            oru.agency/pulse
          </div>
        </div>
        <div className="hidden sm:block w-[48px]" />
      </div>

      {/* Internal Content */}
      <div className="p-4 sm:p-6 lg:p-10 space-y-8">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          {/* Revenue Chart Section */}
          <motion.div
            className="col-span-12 lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-end justify-between">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Revenue Velocity</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Auto-synced from all pipelines</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-500 flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  +24.5%
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1">Growth Index</p>
              </div>
            </div>

            <div className="flex items-end gap-1 sm:gap-2 h-44 sm:h-56 pb-2 border-b border-border/20">
              {[35, 50, 42, 68, 55, 85, 72, 95, 82, 110, 88, 120].map((h, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end group/bar relative">
                  <motion.div
                    className="w-full bg-gradient-to-t from-foreground/20 via-foreground/10 to-transparent rounded-t-[4px] relative z-10 min-w-[6px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(h / 120) * 100}%` }}
                    transition={{ delay: 1 + i * 0.05, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none mb-2 z-20">
                      <div className="bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-2xl whitespace-nowrap">
                        ₹{h}.5k
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-[4px]" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Stats */}
          <motion.div
            className="col-span-12 lg:col-span-5 space-y-6"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {/* Workforce pipeline widget */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Efficiency Score</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">Live Now</span>
              </div>
              <div className="text-4xl font-bold text-foreground font-display tabular-nums tracking-tighter">147 <span className="text-sm font-normal text-muted-foreground ml-1 tracking-normal">Active Tasks</span></div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-xl bg-muted border-2 border-background overflow-hidden relative group-hover:translate-y-[-2px] transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                      <img src={`https://i.pravatar.cc/100?u=agency-${i}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-xl bg-background border-2 border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    +12
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">94.2%</div>
                  <div className="text-[10px] text-muted-foreground underline underline-offset-4 decoration-primary/30">Utilization</div>
                </div>
              </div>
            </div>

            {/* Momentum Gauge */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-all relative overflow-hidden group/gauge">
              <div className="flex justify-between items-center mb-3 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Agency Momentum</span>
                <TrendingUp className="w-4 h-4 text-emerald-500 group-hover/gauge:translate-x-1 group-hover/gauge:-translate-y-1 transition-transform" />
              </div>
              <div className="text-4xl font-bold font-display tracking-tight text-foreground relative z-10">₹1.4 Cr</div>
              <div className="mt-4 h-1.5 bg-muted rounded-full relative z-10">
                <motion.div
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ delay: 1.5, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Metrics Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          {[
            { label: 'Agency Margin', value: '42.8%', trend: '+8.2%', sub: 'Healthy' },
            { label: 'Billable Cap', value: '94%', trend: '+12%', sub: 'Optimized' },
            { label: 'Churn Rate', value: '1.2%', trend: '-0.5%', sub: 'Minimal' },
            { label: 'Avg. Ticket', value: '₹8.4L', trend: '+15%', sub: 'Growing' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground tracking-tighter tabular-nums">{stat.value}</span>
                <span className={`text-[10px] font-bold ${stat.trend.startsWith('-') ? 'text-blue-500' : 'text-emerald-500'}`}>{stat.trend}</span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/60">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>

    {/* Responsive Floating Badges - Hidden on mobile */}
    <motion.div
      className="hidden lg:flex absolute -right-12 top-1/4 px-5 py-3 rounded-2xl bg-card border border-border/50 shadow-2xl backdrop-blur-xl z-20 flex-col gap-1"
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 1.4, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 blur-[2px] animate-ping opacity-50" />
        </div>
        <span className="text-[11px] font-bold text-foreground tracking-tight">Real-time Global Sync</span>
      </div>
      <span className="text-[9px] text-muted-foreground font-medium pl-5">Connected to all nodes</span>
    </motion.div>

    <motion.div
      className="hidden lg:flex absolute -left-16 bottom-1/4 px-5 py-4 rounded-2xl bg-card border border-border/50 shadow-2xl backdrop-blur-xl z-20 max-w-[180px] flex-col gap-3"
      initial={{ opacity: 0, x: -40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 1.6, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[11px] font-bold text-foreground leading-[1.3]">Operational Audit <strong>Completed</strong></span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 2.5 }}
        />
      </div>
    </motion.div>
  </motion.div>
);

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-16 overflow-hidden bg-background">
      {/* Subtle top-center radial gradient for depth */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <ShimmerBadge />

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-4xl sm:text-5xl lg:text-7xl font-sans font-bold text-foreground leading-[1.05] tracking-tighter"
        >
          The operating system for
          <br className="hidden sm:block" />
          <span className="text-muted-foreground"> modern agencies</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Manage projects, track finances, automate workflows, and scale your agency
          with one powerful platform built for the way you work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/agency-signup">
            <Button
              size="lg"
              variant="primary"
              className="px-8 h-11 text-[15px] font-medium rounded-full shadow-sm hover:shadow transition-all group"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>

          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-11 text-[15px] font-medium rounded-full border-border/50 hover:bg-secondary/50 transition-all"
            >
              Sign In
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border md:block hidden" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>14-day free trial</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border md:block hidden" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Cancel anytime</span>
          </div>
        </motion.div>

        <DashboardPreview />
      </div>
    </section>
  );
};
