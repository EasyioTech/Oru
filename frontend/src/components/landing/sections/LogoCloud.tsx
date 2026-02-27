import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Container } from '../fragments';
import { FadeIn } from '../animations';

const logos = [
  { name: 'TechVision', width: 'w-24' },
  { name: 'DigitalFirst', width: 'w-28' },
  { name: 'CloudNine', width: 'w-24' },
  { name: 'ScaleUp Labs', width: 'w-32' },
  { name: 'InnovatePro', width: 'w-28' },
  { name: 'GrowthEngine', width: 'w-32' },
];

export default function LogoCloud() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-16 border-y border-border overflow-hidden bg-background">
      <Container>
        <FadeIn isVisible={mounted} delay={100}>
          <p className="text-center text-[13px] text-muted-foreground mb-8 tracking-[0.02em] uppercase">
            Trusted by leading agencies
          </p>
        </FadeIn>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <InfiniteScroll />
        </div>
      </Container>
    </section>
  );
}

function InfiniteScroll() {
  return (
    <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <style>{`
        @keyframes logo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 2rem)); } 
        }
        .animate-logo-scroll {
          animation: logo-scroll 30s linear infinite;
          will-change: transform;
        }
      `}</style>
      <div
        className="flex gap-16 animate-logo-scroll w-max"
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 items-center justify-center transition-colors duration-200',
              logo.width
            )}
          >
            <span className="text-[18px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap select-none cursor-default">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
