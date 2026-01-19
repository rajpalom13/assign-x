/**
 * Onboarding Tour Components
 * Interactive step-by-step tutorial for first-time users
 */

// Main components
export { Tour } from "./tour";
export { TourProvider, useTour, useTourSafe } from "./tour-provider";
export { TourOverlay } from "./tour-overlay";
export { TourTooltip } from "./tour-tooltip";
export { TourProgress, TourProgressBar } from "./tour-progress";
export { TourStep, TourTarget } from "./tour-step";

// Types and configuration
export {
  TOUR_STEPS,
  TOUR_STORAGE_KEY,
  TOUR_DONT_SHOW_KEY,
  type TourStep as TourStepType,
  type TourState,
  type TourActions,
  type TourContextValue,
  type TooltipPosition,
  type TargetRect,
} from "./tour-types";
