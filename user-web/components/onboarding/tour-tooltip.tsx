"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTour } from "./tour-provider";
import { TourProgress } from "./tour-progress";
import { Checkbox } from "@/components/ui/checkbox";
import type { TooltipPosition, TargetRect } from "./tour-types";

/**
 * Gap between tooltip and target element
 */
const TOOLTIP_GAP = 16;

/**
 * Tooltip dimensions
 */
const TOOLTIP_WIDTH = 340;
const TOOLTIP_HEIGHT_ESTIMATE = 200;

/**
 * Tooltip animation variants
 */
const tooltipVariants = {
  hidden: (position: TooltipPosition) => ({
    opacity: 0,
    scale: 0.9,
    y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
    x: position === "left" ? 10 : position === "right" ? -10 : 0,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: (position: TooltipPosition) => ({
    opacity: 0,
    scale: 0.95,
    y: position === "top" ? 5 : position === "bottom" ? -5 : 0,
    x: position === "left" ? 5 : position === "right" ? -5 : 0,
    transition: { duration: 0.15, ease: "easeIn" as const },
  }),
};

/**
 * Calculate tooltip position based on target rect and preferred position
 */
function calculateTooltipPosition(
  targetRect: TargetRect,
  preferredPosition: TooltipPosition,
  viewportWidth: number,
  viewportHeight: number
): { top: number; left: number; position: TooltipPosition } {
  const positions: TooltipPosition[] = [
    preferredPosition,
    "bottom",
    "top",
    "right",
    "left",
  ];

  for (const position of positions) {
    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = targetRect.top - TOOLTIP_HEIGHT_ESTIMATE - TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case "bottom":
        top = targetRect.bottom + TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
        left = targetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
        left = targetRect.right + TOOLTIP_GAP;
        break;
    }

    // Clamp to viewport bounds
    const clampedLeft = Math.max(16, Math.min(left, viewportWidth - TOOLTIP_WIDTH - 16));
    const clampedTop = Math.max(16, Math.min(top, viewportHeight - TOOLTIP_HEIGHT_ESTIMATE - 16));

    // Check if position fits
    const fitsInViewport =
      clampedTop >= 16 &&
      clampedTop + TOOLTIP_HEIGHT_ESTIMATE <= viewportHeight - 16 &&
      clampedLeft >= 16 &&
      clampedLeft + TOOLTIP_WIDTH <= viewportWidth - 16;

    if (fitsInViewport || position === positions[positions.length - 1]) {
      return { top: clampedTop, left: clampedLeft, position };
    }
  }

  // Fallback center of screen
  return {
    top: viewportHeight / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2,
    left: viewportWidth / 2 - TOOLTIP_WIDTH / 2,
    position: "bottom",
  };
}

/**
 * TourTooltip Component
 * Renders the floating tooltip with step content and navigation
 *
 * @returns Tour tooltip or null when tour is inactive
 */
export function TourTooltip() {
  const {
    isActive,
    currentStepConfig,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    showDontShowAgain,
    dontShowAgain,
    nextStep,
    prevStep,
    skipTour,
    setDontShowAgain,
  } = useTour();

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<TooltipPosition>("bottom");
  const [isMounted, setIsMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position
  const updatePosition = useCallback(() => {
    if (!currentStepConfig) return;

    const targetElement = document.querySelector(currentStepConfig.target);

    // If no target found, center the tooltip
    if (!targetElement) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      setPosition({
        top: viewportHeight / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2,
        left: viewportWidth / 2 - TOOLTIP_WIDTH / 2,
      });
      setActualPosition("bottom");
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const targetRect: TargetRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    };

    const { top, left, position: pos } = calculateTooltipPosition(
      targetRect,
      currentStepConfig.position,
      window.innerWidth,
      window.innerHeight
    );

    // Ensure tooltip is never hidden behind fixed headers (navbar at top)
    // Keep at least 80px from top for navbar clearance
    const minTopOffset = 80;
    const adjustedTop = Math.max(minTopOffset, top);

    setPosition({ top: adjustedTop, left });
    setActualPosition(pos);
  }, [currentStepConfig]);

  // Set up mount state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Update position on step change and window resize
  useEffect(() => {
    if (!isActive) return;

    // Initial calculation with delay
    const timer = setTimeout(updatePosition, 150);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isActive, currentStep, updatePosition]);

  // Don't render if not mounted or not active
  if (!isMounted || !isActive || !currentStepConfig) return null;

  const tooltipContent = (
    <AnimatePresence mode="wait">
      {isActive && currentStepConfig && (
        <motion.div
          key={`tour-tooltip-${currentStep}`}
          ref={tooltipRef}
          custom={actualPosition}
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed z-[200] w-[360px] pointer-events-auto",
            "bg-card/98 backdrop-blur-2xl",
            "rounded-2xl shadow-2xl",
            "border-2 border-primary/20",
            "overflow-hidden",
            "tour-tooltip"
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          role="dialog"
          aria-labelledby="tour-step-title"
          aria-describedby="tour-step-description"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with prominent skip button */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <TourProgress />
            <div className="flex items-center gap-2">
              <button
                onClick={skipTour}
                data-tour-skip
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-muted/70 border border-border/50",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                )}
                aria-label="Skip tour"
              >
                Skip Tour
              </button>
              <button
                onClick={skipTour}
                className={cn(
                  "p-1.5 rounded-lg",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-muted/50",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                )}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-4">
            <h3
              id="tour-step-title"
              className="text-lg font-semibold text-foreground mb-2.5"
            >
              {currentStepConfig.title}
            </h3>
            <p
              id="tour-step-description"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {currentStepConfig.description}
            </p>
            {/* Helpful hint */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">ESC</span>
                to skip anytime
              </p>
            </div>
          </div>

          {/* Don't show again checkbox (on last step) */}
          {showDontShowAgain && (
            <div className="px-5 pb-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={dontShowAgain}
                  onCheckedChange={(checked) =>
                    setDontShowAgain(checked === true)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Don&apos;t show this again
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 py-4 bg-muted/30 border-t border-border/50">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg",
                "text-sm font-medium",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                isFirstStep
                  ? "text-muted-foreground/40 cursor-not-allowed opacity-50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              aria-label="Previous step"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>

            <button
              onClick={nextStep}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-lg",
                "bg-primary text-primary-foreground",
                "text-sm font-semibold",
                "hover:bg-primary/90 active:scale-95",
                "transition-all duration-200",
                "shadow-lg shadow-primary/25",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label={isLastStep ? "Finish tour" : "Next step"}
            >
              {currentStepConfig.actionText || (isLastStep ? "Finish Tour" : "Next")}
              {!isLastStep && <ChevronRight className="size-4" />}
            </button>
          </div>

          {/* Arrow pointer */}
          <TooltipArrow position={actualPosition} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(tooltipContent, document.body);
}

/**
 * Arrow component for tooltip - Enhanced with glow
 */
function TooltipArrow({ position }: { position: TooltipPosition }) {
  const arrowClasses = cn(
    "absolute w-3 h-3",
    "bg-card/98 border-primary/20 border-2",
    "transform rotate-45"
  );

  const positionStyles: Record<TooltipPosition, string> = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t border-r",
    right: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b border-l",
  };

  return <div className={cn(arrowClasses, positionStyles[position])} />;
}
