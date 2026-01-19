/**
 * Onboarding Tour Type Definitions
 * Types and configuration for the dashboard onboarding tour
 */

/**
 * Position options for tour tooltip placement
 */
export type TooltipPosition = "top" | "bottom" | "left" | "right";

/**
 * Individual tour step configuration
 */
export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** CSS selector or data attribute to target the element */
  target: string;
  /** Main title of the step */
  title: string;
  /** Description text for the step */
  description: string;
  /** Preferred tooltip position relative to target */
  position: TooltipPosition;
  /** Optional action button text (defaults to "Next") */
  actionText?: string;
  /** Whether to highlight the element with a spotlight effect */
  spotlight?: boolean;
  /** Optional route to navigate to before showing this step */
  route?: string;
}

/**
 * Tour state managed by the context
 */
export interface TourState {
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Whether the tour has been completed by the user */
  hasCompleted: boolean;
  /** Whether to show "Don't show again" checkbox */
  showDontShowAgain: boolean;
  /** Whether the user checked "Don't show again" */
  dontShowAgain: boolean;
}

/**
 * Tour context actions
 */
export interface TourActions {
  /** Start the tour from the beginning */
  startTour: () => void;
  /** End the tour and optionally mark as completed */
  endTour: (markComplete?: boolean) => void;
  /** Go to the next step */
  nextStep: () => void;
  /** Go to the previous step */
  prevStep: () => void;
  /** Skip the tour without completing */
  skipTour: () => void;
  /** Jump to a specific step */
  goToStep: (stepIndex: number) => void;
  /** Toggle "Don't show again" preference */
  setDontShowAgain: (value: boolean) => void;
}

/**
 * Complete tour context value
 */
export interface TourContextValue extends TourState, TourActions {
  /** All tour steps configuration */
  steps: TourStep[];
  /** Current step configuration */
  currentStepConfig: TourStep | null;
  /** Total number of steps */
  totalSteps: number;
  /** Whether this is the first step */
  isFirstStep: boolean;
  /** Whether this is the last step */
  isLastStep: boolean;
}

/**
 * Props for target element calculation
 */
export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

/**
 * Tour step definitions for AssignX dashboard
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: "[data-tour='welcome']",
    title: "Welcome to AssignX!",
    description: "Let's show you around and help you get started with your academic success journey.",
    position: "bottom",
    actionText: "Get Started",
    spotlight: false,
  },
  {
    id: "create-project",
    target: "[data-tour='create-project']",
    title: "Create Your First Project",
    description: "Start by creating a project. Describe your assignment and our experts will help you succeed.",
    position: "top",
    spotlight: true,
    route: "/home",
  },
  {
    id: "browse-projects",
    target: "[data-tour='projects']",
    title: "Track Your Projects",
    description: "View and manage all your active projects, track progress, and communicate with experts.",
    position: "top",
    spotlight: true,
    route: "/home",
  },
  {
    id: "wallet",
    target: "[data-tour='wallet']",
    title: "Your Wallet",
    description: "Add funds to your wallet to start working with experts. Secure payments with full transparency.",
    position: "top",
    spotlight: true,
    route: "/home",
  },
  {
    id: "campus-connect",
    target: "[data-tour='connect']",
    title: "Campus Connect",
    description: "Connect with your college community. Find study groups, resources, and peer support.",
    position: "top",
    spotlight: true,
    route: "/home",
  },
  {
    id: "profile",
    target: "[data-tour='profile']",
    title: "Complete Your Profile",
    description: "Add your academic details for better expert matches and personalized recommendations.",
    position: "left",
    actionText: "Finish Tour",
    spotlight: true,
    route: "/home",
  },
];

/**
 * Local storage key for tour completion status
 */
export const TOUR_STORAGE_KEY = "assignx_tour_completed";

/**
 * Local storage key for "don't show again" preference
 */
export const TOUR_DONT_SHOW_KEY = "assignx_tour_dont_show";
