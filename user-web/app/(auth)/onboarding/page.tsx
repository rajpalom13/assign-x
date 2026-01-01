"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SplashScreen } from "@/components/auth/splash-screen";
import { OnboardingCarousel } from "@/components/auth/onboarding-carousel";
import { RoleSelection } from "@/components/auth/role-selection";

/**
 * Onboarding page content component
 * Handles splash -> carousel -> role selection flow
 */
function OnboardingContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  const [showSplash, setShowSplash] = useState(true);

  // Skip splash if coming from a specific step
  useEffect(() => {
    if (step) {
      setShowSplash(false);
    }
  }, [step]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (step === "role") {
    return <RoleSelection />;
  }

  return <OnboardingCarousel />;
}

/**
 * Onboarding page with splash screen, carousel, and role selection
 */
export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
