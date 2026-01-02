"use client";

/**
 * Home page - Landing page for AssignX
 * Matches saas template structure exactly with same sections
 */

import "./landing.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import {
  Navigation,
  HeroSection,
  HorizontalShowcase,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <LenisProvider>
      <div className="landing-page min-h-screen bg-[var(--landing-bg-primary)]">
        {/* Navigation - Fixed with pill style on scroll */}
        <Navigation />

        {/* Main content */}
        <main>
          {/* Hero Section - Light background, 55/45 split */}
          <HeroSection />

          {/* Horizontal Showcase - Text-based horizontal scroll */}
          <HorizontalShowcase />

          {/* CTA Section - Final call to action */}
          <CTASection />
        </main>

        {/* Footer - Dark with ghost text animation */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
