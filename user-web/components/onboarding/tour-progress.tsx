"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useTour } from "./tour-provider";

/**
 * TourProgress Component
 * Displays progress dots and step counter for the tour
 *
 * @returns Progress indicator UI
 */
export function TourProgress() {
  const { currentStep, totalSteps } = useTour();

  return (
    <div className="flex items-center gap-3">
      {/* Step counter text */}
      <span className="text-xs font-medium text-muted-foreground">
        {currentStep + 1} of {totalSteps}
      </span>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <ProgressDot
            key={index}
            index={index}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual progress dot component
 */
interface ProgressDotProps {
  index: number;
  currentStep: number;
  totalSteps: number;
}

function ProgressDot({ index, currentStep }: ProgressDotProps) {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;

  return (
    <div className="relative">
      {/* Base dot */}
      <div
        className={cn(
          "size-2 rounded-full transition-colors duration-300",
          isCompleted
            ? "bg-primary"
            : isActive
            ? "bg-primary"
            : "bg-muted-foreground/30"
        )}
      />

      {/* Active indicator ring */}
      {isActive && (
        <motion.div
          layoutId="tour-progress-active"
          className="absolute inset-0 -m-0.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <div className="size-3 rounded-full ring-2 ring-primary/50 ring-offset-1 ring-offset-card" />
        </motion.div>
      )}
    </div>
  );
}

/**
 * Linear progress bar variant
 * Alternative to dots for a more compact display
 */
export function TourProgressBar() {
  const { currentStep, totalSteps } = useTour();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Step counter */}
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Step {currentStep + 1}/{totalSteps}
      </span>

      {/* Progress bar */}
      <div className="relative w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      </div>
    </div>
  );
}
