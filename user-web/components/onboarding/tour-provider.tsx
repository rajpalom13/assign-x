"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  type TourContextValue,
  type TourState,
  TOUR_STEPS,
  TOUR_STORAGE_KEY,
  TOUR_DONT_SHOW_KEY,
} from "./tour-types";
import { getTourCompletionStatus } from "@/lib/actions/data";

/**
 * Default tour state
 */
const defaultState: TourState = {
  isActive: false,
  currentStep: 0,
  hasCompleted: false,
  showDontShowAgain: false,
  dontShowAgain: false,
};

/**
 * Tour Context
 */
const TourContext = createContext<TourContextValue | null>(null);

/**
 * Props for TourProvider
 */
interface TourProviderProps {
  children: ReactNode;
  /** Auto-start tour for new users */
  autoStart?: boolean;
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
}

/**
 * TourProvider Component
 * Manages the onboarding tour state and provides context to child components
 *
 * @param props - Provider props
 * @returns Tour provider wrapper
 */
export function TourProvider({
  children,
  autoStart = false,
  onComplete,
  onSkip,
}: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<TourState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from database AND local storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeTourState = async () => {
      // Check database first (source of truth)
      const dbStatus = await getTourCompletionStatus();

      // Check local storage as fallback
      const localCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
      const dontShow = localStorage.getItem(TOUR_DONT_SHOW_KEY) === "true";

      // Database takes precedence
      const hasCompleted = dbStatus.completed || localCompleted;

      // If DB says completed but local storage doesn't, sync it
      if (dbStatus.completed && !localCompleted) {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      }

      setState((prev) => ({
        ...prev,
        hasCompleted,
        dontShowAgain: dontShow,
      }));

      setIsInitialized(true);
    };

    initializeTourState();
  }, []);

  // Auto-start tour for new users
  useEffect(() => {
    if (!isInitialized) return;
    if (!autoStart) return;
    if (state.hasCompleted || state.dontShowAgain) return;
    if (state.isActive) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isActive: true, currentStep: 0 }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInitialized, autoStart, state.hasCompleted, state.dontShowAgain, state.isActive]);

  // Handle route navigation for steps
  useEffect(() => {
    if (!state.isActive) return;

    const currentStepConfig = TOUR_STEPS[state.currentStep];
    if (!currentStepConfig) return;

    // Navigate to required route if different
    if (currentStepConfig.route && pathname !== currentStepConfig.route) {
      router.push(currentStepConfig.route);
    }
  }, [state.isActive, state.currentStep, pathname, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          skipTour();
          break;
        case "Enter":
        case "ArrowRight":
          nextStep();
          break;
        case "ArrowLeft":
          prevStep();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isActive, state.currentStep]);

  /**
   * Start the tour from the beginning
   */
  const startTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      currentStep: 0,
    }));
  }, []);

  /**
   * End the tour and optionally mark as completed
   */
  const endTour = useCallback(
    (markComplete = true) => {
      setState((prev) => {
        const newState = {
          ...prev,
          isActive: false,
          hasCompleted: markComplete,
        };

        // Save to local storage
        if (markComplete) {
          localStorage.setItem(TOUR_STORAGE_KEY, "true");
        }

        if (prev.dontShowAgain) {
          localStorage.setItem(TOUR_DONT_SHOW_KEY, "true");
        }

        return newState;
      });

      if (markComplete) {
        onComplete?.();
      }
    },
    [onComplete]
  );

  /**
   * Go to the next step
   */
  const nextStep = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentStep + 1;

      // If we've reached the end, complete the tour
      if (nextIndex >= TOUR_STEPS.length) {
        // Save completion
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        if (prev.dontShowAgain) {
          localStorage.setItem(TOUR_DONT_SHOW_KEY, "true");
        }

        onComplete?.();

        return {
          ...prev,
          isActive: false,
          hasCompleted: true,
        };
      }

      return {
        ...prev,
        currentStep: nextIndex,
        showDontShowAgain: nextIndex === TOUR_STEPS.length - 1,
      };
    });
  }, [onComplete]);

  /**
   * Go to the previous step
   */
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      showDontShowAgain: false,
    }));
  }, []);

  /**
   * Skip the tour without completing
   */
  const skipTour = useCallback(() => {
    setState((prev) => {
      if (prev.dontShowAgain) {
        localStorage.setItem(TOUR_DONT_SHOW_KEY, "true");
      }

      return {
        ...prev,
        isActive: false,
      };
    });

    onSkip?.();
  }, [onSkip]);

  /**
   * Jump to a specific step
   */
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= TOUR_STEPS.length) return;

    setState((prev) => ({
      ...prev,
      currentStep: stepIndex,
      showDontShowAgain: stepIndex === TOUR_STEPS.length - 1,
    }));
  }, []);

  /**
   * Toggle "Don't show again" preference
   */
  const setDontShowAgain = useCallback((value: boolean) => {
    setState((prev) => ({
      ...prev,
      dontShowAgain: value,
    }));
  }, []);

  // Computed values
  const contextValue = useMemo<TourContextValue>(() => {
    const currentStepConfig = TOUR_STEPS[state.currentStep] || null;

    return {
      ...state,
      steps: TOUR_STEPS,
      currentStepConfig,
      totalSteps: TOUR_STEPS.length,
      isFirstStep: state.currentStep === 0,
      isLastStep: state.currentStep === TOUR_STEPS.length - 1,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipTour,
      goToStep,
      setDontShowAgain,
    };
  }, [state, startTour, endTour, nextStep, prevStep, skipTour, goToStep, setDontShowAgain]);

  return (
    <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
  );
}

/**
 * Hook to access tour context
 * @returns Tour context value
 * @throws Error if used outside TourProvider
 */
export function useTour(): TourContextValue {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }

  return context;
}

/**
 * Hook to check if tour context is available
 * Safe to use without throwing errors
 * @returns Tour context value or null
 */
export function useTourSafe(): TourContextValue | null {
  return useContext(TourContext);
}
