import React from 'react';
import { Hero } from './sections/Hero';
import LogoCloud from './sections/LogoCloud';
import { BentoFeatures } from './sections/BentoFeatures';
import { ProductShowcase } from './sections/ProductShowcase';
import { Stats } from './sections/Stats';
import { Testimonials } from './sections/Testimonials';
import { Pricing } from './sections/Pricing';
import { FAQ } from './sections/FAQ';
import { CTA } from './sections/CTA';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { SEO } from '@/components/shared/SEO';

export default function LandingPage() {
  return (
    <>
      <SEO
        title="All-in-One Agency Management Platform"
        description="Manage projects, teams, finances, and clients with Oru ERP. Complete SaaS built for modern agencies."
        ogImage="https://oruerp.com/og-image-home.png"
      />
      <div className="relative min-h-screen bg-gradient-to-b from-slate-50/70 via-background to-slate-50/40 dark:from-background dark:via-background dark:to-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground overflow-x-clip">
        {/* Ambient Mesh Gradients & Lighting */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle full-height ambient vertical tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-primary/[0.025] dark:from-transparent dark:via-primary/[0.015] dark:to-primary/[0.03]" />

          {/* Top Hero / Header Aura */}
          <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),rgba(168,85,247,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),rgba(147,51,234,0.15),transparent_70%)]" />

          {/* Mid-page Accent Glow (Emerald / Cyan on Right) */}
          <div className="absolute top-[32%] -right-[150px] w-[650px] h-[650px] rounded-full blur-[150px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.09),rgba(20,184,166,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),rgba(20,184,166,0.06),transparent_70%)]" />

          {/* Mid-page Accent Glow (Indigo / Violet on Left) */}
          <div className="absolute top-[56%] -left-[150px] w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.10),rgba(139,92,246,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),rgba(99,102,241,0.10),transparent_70%)]" />

          {/* Bottom Pricing & CTA Aura */}
          <div className="absolute -bottom-[150px] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),rgba(59,130,246,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.20),rgba(59,130,246,0.10),transparent_70%)]" />

          {/* Fine geometric dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, black 40%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 50%, black 40%, transparent 95%)',
            }}
          />
        </div>

        {/* Content layers */}
        <div className="relative z-10">
          <Hero />

          <SectionWrapper delay={0.2}>
            <LogoCloud />
          </SectionWrapper>

          <SectionWrapper id="features">
            <BentoFeatures />
          </SectionWrapper>

          <SectionWrapper id="product">
            <ProductShowcase />
          </SectionWrapper>

          <SectionWrapper id="stats">
            <Stats />
          </SectionWrapper>

          <SectionWrapper id="testimonials">
            <Testimonials />
          </SectionWrapper>

          <SectionWrapper id="pricing">
            <Pricing />
          </SectionWrapper>

          <SectionWrapper id="faq">
            <FAQ />
          </SectionWrapper>

          <SectionWrapper id="cta">
            <CTA />
          </SectionWrapper>
        </div>
      </div>
    </>
  );
}

