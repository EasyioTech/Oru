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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/[0.01] to-slate-500/[0.02] dark:from-transparent dark:via-slate-800/[0.03] dark:to-transparent" />

          {/* Top Hero / Header Aura (Cool Slate & Subtle Titanium Steel - Zero AI Purple) */}
          <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.10),rgba(203,213,225,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),rgba(148,163,184,0.02),transparent_70%)]" />

          {/* Mid-page Accent Glow (Deep Steel / Slate on Right) */}
          <div className="absolute top-[32%] -right-[150px] w-[650px] h-[650px] rounded-full blur-[150px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.08),rgba(226,232,240,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(71,85,105,0.12),rgba(15,23,42,0.08),transparent_70%)]" />

          {/* Mid-page Accent Glow (Precision Charcoal / Neutral Slate on Left) */}
          <div className="absolute top-[56%] -left-[150px] w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.08),rgba(203,213,225,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(51,65,85,0.14),rgba(30,41,59,0.08),transparent_70%)]" />

          {/* Bottom Pricing & CTA Aura (Deep Obsidian / Minimal Slate) */}
          <div className="absolute -bottom-[150px] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.10),rgba(226,232,240,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(71,85,105,0.10),rgba(15,23,42,0.05),transparent_70%)]" />

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

