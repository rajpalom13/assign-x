"use client";

/**
 * Home page - Modern landing page for AssignX
 * Features GSAP animations, Lenis smooth scroll, and horizontal showcase
 */

import "./landing.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import {
  Navigation,
  HeroSection,
  HorizontalShowcase,
  FeaturesSection,
  HowItWorks,
  TestimonialsSection,
  StatsSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <LenisProvider>
      <div className="relative bg-background">
        {/* Navigation */}
        <Navigation />

        {/* Main content */}
        <main>
          {/* Hero Section - Animated headline with magnetic buttons */}
          <HeroSection />

          {/* Horizontal Showcase - Services with horizontal scroll */}
          <HorizontalShowcase />

          {/* Features Section - 8-feature grid with staggered reveals */}
          <FeaturesSection />

          {/* How It Works - 4-step process with line animation */}
          <HowItWorks />

          {/* Stats Section - Counting number animations */}
          <StatsSection />

          {/* Testimonials - Customer reviews with parallax */}
          <TestimonialsSection />

          {/* CTA Section - Final call to action */}
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
