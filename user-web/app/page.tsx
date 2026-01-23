"use client";

/**
 * Home Page V2 - Systematic Design with Clear User Segmentation
 *
 * Design System:
 * ============
 * SYSTEMATIC COLOR PALETTE:
 * - Students: Orange/Amber (#FF6B35, #FFB88C) - Energy, youth
 * - Employees: Indigo/Blue (#4F46E5, #818CF8) - Professional, trust
 * - Business: Violet/Purple (#7C3AED, #A78BFA) - Premium, growth
 * - Quality: Emerald/Teal (#10B981, #14B8A6) - Trust, reliability
 * - Base: Brown/Stone - Neutral foundation
 *
 * SEAMLESS GRADIENT FLOW:
 * - No abrupt section endings
 * - Smooth transitions with overlapping gradients
 * - Consistent mesh background throughout
 * - Fade effects between sections (32px/8rem)
 *
 * USER TYPE CLARITY:
 * - Clear segmentation in hero (3 pills)
 * - Dedicated user types section
 * - Color-coded throughout entire page
 * - Multi-segment CTAs
 *
 * Inspired by:
 * - Dashboard: Warm theme, systematic colors
 * - Projects: Glassmorphic cards, premium feel
 * - Campus Connect: Vibrant but organized gradients
 * - Experts: Mesh backgrounds, proper spacing
 * - Wallet: Clean layouts, professional design
 *
 * Sections:
 * 1. Hero - User type selector + dynamic content
 * 2. User Types - Clear 3-segment cards
 * 3. Features - Systematic trust indicators
 * 4. How It Works - Color-coded process flow
 * 5. CTA - Multi-segment final conversion
 * 6. Footer - Smooth fadeout
 */

import "./landing.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import {
  Navigation,
  HeroSectionV2,
  UserTypesSection,
  FeaturesSystematic,
  HowItWorksV2,
  CTASectionV2,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <LenisProvider>
      <div className="landing-page min-h-screen bg-[var(--landing-bg-primary)]">
        {/* Navigation - Fixed with pill style on scroll */}
        <Navigation />

        {/* Main content - Seamless gradient flow throughout */}
        <main className="relative">
          {/* Hero - User type selector with dynamic content */}
          <HeroSectionV2 />

          {/* User Types - Clear 3-segment differentiation */}
          <UserTypesSection />

          {/* Features - Systematic trust & quality indicators */}
          <FeaturesSystematic />

          {/* How It Works - Color-coded process flow */}
          <HowItWorksV2 />

          {/* CTA - Multi-segment final conversion */}
          <CTASectionV2 />
        </main>

        {/* Footer - Smooth fadeout */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
