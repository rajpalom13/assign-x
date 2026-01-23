"use client";

/**
 * Home Page REDESIGN - Premium Bento Grid Landing
 *
 * Inspired by:
 * - Dashboard: Warm brown/stone theme with bento cards & orange accents
 * - Projects: Glassmorphic premium design with dark hero cards
 * - Campus Connect: Vibrant gradients, feature carousels & community focus
 * - Experts: Mesh gradient backgrounds & proper spacing
 * - Wallet: 2-column layouts, glassmorphic cards, credit card style
 *
 * Design Features:
 * - Mesh gradient backgrounds with time-based classes
 * - Glassmorphic bento grid cards
 * - Dark hero cards with gradient overlays & decorative circles
 * - 2-column layouts (greeting + bento grid)
 * - Premium hover states with shadows
 * - Warm peach/pink/brown gradient palette
 *
 * Sections:
 * 1. Hero - 2-column with greeting + premium bento grid
 * 2. Features - Glassmorphic service bento cards
 * 3. How It Works - 4-step process with wallet-inspired layout
 * 4. CTA - Dark hero conversion section
 * 5. Footer - Minimal clean footer
 */

import "./landing.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import {
  Navigation,
  HeroSectionRedesign,
  FeaturesBento,
  HowItWorksRedesign,
  CTASectionRedesign,
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
          {/* Hero Section - Premium 2-column with bento grid */}
          <HeroSectionRedesign />

          {/* Features Bento - Service showcase with glassmorphic cards */}
          <FeaturesBento />

          {/* How It Works - 4-step process with premium cards */}
          <HowItWorksRedesign />

          {/* CTA Section - Dark hero conversion with stats */}
          <CTASectionRedesign />
        </main>

        {/* Footer - Minimal clean design */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
