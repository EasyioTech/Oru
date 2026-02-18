import React, { Suspense } from 'react';
import Navigation from './sections/Navigation';
import { Hero } from './sections/Hero';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load sections below the fold
const LogoCloud = React.lazy(() => import('./sections/LogoCloud').then(module => ({ default: module.default || module.LogoCloud })));
const BentoFeatures = React.lazy(() => import('./sections/BentoFeatures').then(module => ({ default: module.BentoFeatures })));
const ProductShowcase = React.lazy(() => import('./sections/ProductShowcase').then(module => ({ default: module.ProductShowcase })));
const Stats = React.lazy(() => import('./sections/Stats').then(module => ({ default: module.Stats })));
const Testimonials = React.lazy(() => import('./sections/Testimonials').then(module => ({ default: module.Testimonials })));
const Pricing = React.lazy(() => import('./sections/Pricing').then(module => ({ default: module.Pricing })));
const FAQ = React.lazy(() => import('./sections/FAQ').then(module => ({ default: module.FAQ })));
const CTA = React.lazy(() => import('./sections/CTA').then(module => ({ default: module.CTA })));
const Footer = React.lazy(() => import('./sections/Footer').then(module => ({ default: module.Footer })));

const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center py-20">
    <div className="space-y-4 w-full max-w-4xl px-4">
      <Skeleton className="h-12 w-3/4 mx-auto bg-zinc-800/50" />
      <Skeleton className="h-64 w-full bg-zinc-800/50 rounded-xl" />
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white antialiased selection:bg-blue-500/20 selection:text-white overflow-x-hidden">
      <Navigation />
      <Hero />

      <Suspense fallback={<SectionLoader />}>
        <SectionWrapper delay={0.2}>
          <LogoCloud />
        </SectionWrapper>

        <SectionWrapper id="features">
          <BentoFeatures />
        </SectionWrapper>

        <SectionWrapper>
          <ProductShowcase />
        </SectionWrapper>

        <SectionWrapper>
          <Stats />
        </SectionWrapper>

        <SectionWrapper>
          <Testimonials />
        </SectionWrapper>

        <SectionWrapper id="pricing">
          <Pricing />
        </SectionWrapper>

        <SectionWrapper>
          <FAQ />
        </SectionWrapper>

        <SectionWrapper>
          <CTA />
        </SectionWrapper>

        <Footer />
      </Suspense>
    </div>
  );
}

