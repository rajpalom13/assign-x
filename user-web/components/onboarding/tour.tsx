"use client";

import { TourOverlay } from "./tour-overlay";
import { TourTooltip } from "./tour-tooltip";
import { TourStep } from "./tour-step";
import { TourSkipFAB } from "./tour-skip-fab";

/**
 * Tour Component
 * Main component that combines all tour elements
 * Place this once in your layout to enable the tour
 *
 * @returns Complete tour UI (overlay, tooltip, step animations, and skip button)
 *
 * @example
 * ```tsx
 * // In your layout.tsx
 * import { TourProvider, Tour } from "@/components/onboarding";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <TourProvider autoStart>
 *       {children}
 *       <Tour />
 *     </TourProvider>
 *   );
 * }
 * ```
 */
export function Tour() {
  return (
    <>
      <TourOverlay />
      <TourTooltip />
      <TourStep />
      <TourSkipFAB />
    </>
  );
}
