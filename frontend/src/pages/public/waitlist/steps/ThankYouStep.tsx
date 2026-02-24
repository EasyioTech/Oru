import { motion } from 'framer-motion';
import { PartyPopper, CalendarCheck, ArrowRight, Check } from 'lucide-react';

const perks = [
    'Priority queue for early access',
    'Personalized workspace configuration',
    'Direct founder support channel',
];

export default function ThankYouStep() {
    return (
        <div className="space-y-10 text-center py-4">
            {/* Celebration Icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-foreground/[0.04] border border-border/30 mx-auto"
            >
                <PartyPopper className="w-9 h-9 text-foreground/80" />
                <div className="absolute -inset-3 rounded-3xl bg-foreground/[0.02] blur-xl" />
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight"
                >
                    You're on the list.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-[13px] text-muted-foreground/70 max-w-sm mx-auto leading-relaxed"
                >
                    Your spot for early access is confirmed. We're rolling out invites in batches to ensure stability.
                </motion.p>
            </div>

            {/* Perks */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="flex flex-col items-center gap-2.5"
            >
                {perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                        {perk}
                    </div>
                ))}
            </motion.div>

            <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

            {/* Skip the Line CTA */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="space-y-4"
            >
                <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
                    Want to <strong className="text-foreground/80">skip the line</strong>? We're hand-picking founders to shape our final MVP. Give us brutal, honest feedback and we'll fast-track your account.
                </p>

                <a
                    href="https://calendly.com/easyio-tech/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-foreground text-background font-semibold text-[14px] hover:opacity-90 transition-all shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.25)]"
                >
                    <CalendarCheck className="w-4 h-4" />
                    Book a 10-min Founder Demo
                    <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Skip the waitlist entirely</p>
            </motion.div>

            {/* Return Link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                <a href="/" className="text-[12px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    ← Return to Oru Suite
                </a>
            </motion.div>
        </div>
    );
}
