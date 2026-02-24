import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../fragments';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small agencies just getting started',
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    features: [
      'Up to 5 team members',
      '10 active projects',
      'Basic project management',
      'Invoice generation',
      'Email support',
      '5GB storage',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing agencies with bigger teams',
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      'Advanced project management',
      'GST-compliant invoicing',
      'Client portal',
      'Financial reports',
      'Priority support',
      '50GB storage',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large agencies with custom needs',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unlimited team members',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training',
      'On-premise option',
      'Unlimited storage',
      'Advanced security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section ref={ref} id="pricing" className="relative py-24 lg:py-32 px-4 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <SectionTitle
          badge="Pricing"
          title="Simple, transparent pricing"
          description="Choose the plan that fits your agency. All plans include a 14-day free trial."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full bg-muted border border-border p-1 transition-colors"
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-primary shadow-sm"
              animate={{ x: isYearly ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-2 text-xs text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </span>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className={`group relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-xl shadow-primary/20">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`absolute -inset-px rounded-2xl transition-opacity duration-500 ${plan.popular
                ? 'bg-gradient-to-b from-primary/30 via-primary/10 to-transparent opacity-100'
                : 'bg-gradient-to-b from-foreground/5 to-transparent opacity-10 group-hover:opacity-100'
                }`} />

              <div className={`relative h-full p-6 lg:p-8 rounded-2xl border transition-colors ${plan.popular
                ? 'bg-card/80 border-primary/30 backdrop-blur-md'
                : 'bg-card/50 border-border group-hover:border-border/80'
                }`}>
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
                        ₹{(isYearly ? plan.yearlyPrice : plan.monthlyPrice)?.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  ) : (
                    <div className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
                      Custom
                    </div>
                  )}
                  {isYearly && plan.monthlyPrice && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed annually (₹{((plan.yearlyPrice || 0) * 12).toLocaleString()}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 + i * 0.05 + 0.5 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link to={plan.id === 'enterprise' ? '/contact' : '/auth'}>
                  <Button
                    className={`w-full h-11 font-medium rounded-xl transition-all duration-300 ${plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            All plans include SSL security, daily backups, and 99.9% uptime SLA.
            <br />
            <span className="text-muted-foreground">Need a custom plan?</span>
            <Link to="/contact" className="text-primary hover:text-primary/80 ml-1">
              Talk to our team
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
