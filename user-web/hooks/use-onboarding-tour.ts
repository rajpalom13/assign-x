"use client";

import { useCallback, useEffect, useState } from "react";

import { useTourSafe } from "@/components/onboarding/tour-provider";
import {
  TOUR_STORAGE_KEY,
  TOUR_DONT_SHOW_KEY,
} from "@/components/onboarding/tour-types";

/**
 * Hook return type for onboarding tour
 */
interface UseOnboardingTourReturn {
  /** Whether the tour has been completed */
  hasCompletedTour: boolean;
  /** Whether the user opted out of seeing the tour */
  hasOptedOut: boolean;
  /** Whether the tour is currently active */
  isTourActive: boolean;
  /** Start the onboarding tour */
  startTour: () => void;
  /** Reset the tour state (for testing/debugging) */
  resetTour: () => void;
  /** Mark the tour as completed (for manual completion) */
  markComplete: () => void;
  /** Whether the tour system is ready */
  isReady: boolean;
}

/**
 * Custom hook for managing the onboarding tour
 * Provides utilities for checking tour status and controlling the tour
 *
 * @returns Tour state and control functions
 *
 * @example
 * ```tsx
 * const { hasCompletedTour, startTour, isTourActive } = useOnboardingTour();
 *
 * if (!hasCompletedTour && !isTourActive) {
 *   return <button onClick={startTour}>Start Tour</button>;
 * }
 * ```
 */
export function useOnboardingTour(): UseOnboardingTourReturn {
  const tourContext = useTourSafe();
  const [localState, setLocalState] = useState({
    hasCompleted: false,
    hasOptedOut: false,
    isReady: false,
  });

  // Initialize from local storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    const hasOptedOut = localStorage.getItem(TOUR_DONT_SHOW_KEY) === "true";

    setLocalState({
      hasCompleted,
      hasOptedOut,
      isReady: true,
    });
  }, []);

  // Sync with context if available
  useEffect(() => {
    if (tourContext?.hasCompleted !== undefined) {
      setLocalState((prev) => ({
        ...prev,
        hasCompleted: tourContext.hasCompleted,
      }));
    }
  }, [tourContext?.hasCompleted]);

  /**
   * Start the onboarding tour
   */
  const startTour = useCallback(() => {
    if (tourContext) {
      tourContext.startTour();
    }
  }, [tourContext]);

  /**
   * Reset the tour state (for testing/debugging)
   */
  const resetTour = useCallback(() => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_DONT_SHOW_KEY);

    setLocalState({
      hasCompleted: false,
      hasOptedOut: false,
      isReady: true,
    });

    // Reload the page to reset context state
    window.location.reload();
  }, []);

  /**
   * Mark the tour as completed
   */
  const markComplete = useCallback(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(TOUR_STORAGE_KEY, "true");

    setLocalState((prev) => ({
      ...prev,
      hasCompleted: true,
    }));

    if (tourContext) {
      tourContext.endTour(true);
    }
  }, [tourContext]);

  return {
    hasCompletedTour: localState.hasCompleted,
    hasOptedOut: localState.hasOptedOut,
    isTourActive: tourContext?.isActive ?? false,
    startTour,
    resetTour,
    markComplete,
    isReady: localState.isReady,
  };
}

/**
 * Hook to check if a user should see the tour
 * Combines completion status and opt-out preferences
 *
 * @returns Whether the tour should be shown
 */
export function useShouldShowTour(): boolean {
  const { hasCompletedTour, hasOptedOut, isReady } = useOnboardingTour();

  if (!isReady) return false;
  return !hasCompletedTour && !hasOptedOut;
}

/**
 * Hook for server/database sync of tour completion
 * Can be extended to save tour completion to user profile in Supabase
 *
 * @param saveToDatabase - Function to save completion to database
 * @returns Functions to sync tour state
 */
export function useTourSync(
  saveToDatabase?: (completed: boolean) => Promise<void>
) {
  const { hasCompletedTour, markComplete } = useOnboardingTour();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * Complete tour and sync to database
   */
  const completeTourAndSync = useCallback(async () => {
    markComplete();

    if (!saveToDatabase) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await saveToDatabase(true);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Failed to sync");
    } finally {
      setIsSyncing(false);
    }
  }, [markComplete, saveToDatabase]);

  return {
    hasCompletedTour,
    completeTourAndSync,
    isSyncing,
    syncError,
  };
}
