import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Building2, Users, FolderKanban, TrendingUp } from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2 }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (value) => setDisplayValue(Math.round(value)),
    });

    return () => controls.stop();
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const stats = [
  {
    id: 'agencies',
    value: 500,
    suffix: '+',
    label: 'Agencies',
    description: 'Trust Oru daily',
    icon: Building2,
    color: 'blue',
  },
  {
    id: 'users',
    value: 12000,
    suffix: '+',
    label: 'Active Users',
    description: 'Across the globe',
    icon: Users,
    color: 'emerald',
  },
  {
    id: 'projects',
    value: 50000,
    suffix: '+',
    label: 'Projects',
    description: 'Successfully delivered',
    icon: FolderKanban,
    color: 'purple',
  },
  {
    id: 'growth',
    value: 340,
    suffix: '%',
    label: 'Avg Growth',
    description: 'Client efficiency boost',
    icon: TrendingUp,
    color: 'orange',
  },
];

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', ring: 'ring-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', ring: 'ring-orange-500/20' },
};

export const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 px-4 overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4">
            Trusted worldwide
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground tracking-tight">
            Numbers that speak for themselves
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const colors = colorMap[stat.color];

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-6 lg:p-8 rounded-2xl bg-card border border-border group-hover:border-border/80 transition-colors h-full">
                  <div className={`inline-flex p-3 rounded-xl ${colors.bg} ring-1 ${colors.ring.replace('ring-', 'ring-offset-background ring-')} mb-4`}>
                    <stat.icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>

                  <div className="text-3xl lg:text-4xl font-display font-semibold text-foreground tracking-tight mb-1">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  </div>

                  <div className="text-sm font-medium text-muted-foreground mb-0.5">{stat.label}</div>
                  <div className="text-xs text-muted-foreground/60">{stat.description}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-6 py-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'bg-blue-500',
                  'bg-emerald-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-pink-500',
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} ring-2 ring-background flex items-center justify-center text-xs font-medium text-white`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Joined by</span>
                <span className="text-foreground font-medium ml-1">100+ agencies</span>
                <span className="text-muted-foreground"> this month</span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-warning fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9/5 from 500+ reviews</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
