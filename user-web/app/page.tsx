"use client";

/**
 * Home page - Landing page for AssignX
 * Clean, modern design inspired by Canva/Linear
 *
 * Sections:
 * 1. Hero - Clean headline with CTA
 * 2. User Type Cards - Students, Professionals, Business Owners
 * 3. Trust Stats - Animated counters for key metrics
 * 4. Value Proposition - End-to-end expert handling banner
 * 5. Horizontal Scroll - Feature showcase
 * 6. CTA - Final call to action
 */

import "./landing.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import {
  Navigation,
  HeroSection,
  UserTypeCards,
  TrustStats,
  ValueProposition,
  HorizontalScroll,
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
          {/* Hero Section - Clean, centered layout */}
          <HeroSection />

          {/* User Type Cards - Students, Professionals, Business Owners */}
          <UserTypeCards />

          {/* Trust Stats - Animated counters */}
          <TrustStats />

          {/* Value Proposition Banner - End-to-end handling */}
          <ValueProposition />

          {/* Horizontal Scroll - Feature showcase */}
          <HorizontalScroll />

          {/* CTA Section - Final call to action */}
          <CTASection />
        </main>

        {/* Footer - Dark with ghost text animation */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
