"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { useTour } from "./tour-provider";
import type { TargetRect } from "./tour-types";

/**
 * Default padding around spotlight element
 */
const SPOTLIGHT_PADDING = 8;

/**
 * Overlay animation variants
 */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

/**
 * TourOverlay Component
 * Renders a dark overlay with a spotlight cutout around the target element
 *
 * @returns Tour overlay with spotlight effect or null when tour is inactive
 */
export function TourOverlay() {
  const { isActive, currentStepConfig } = useTour();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Calculate target element position
  const updateTargetRect = useCallback(() => {
    if (!currentStepConfig) {
      setTargetRect(null);
      return;
    }

    const targetElement = document.querySelector(currentStepConfig.target);

    if (!targetElement) {
      setTargetRect(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    setTargetRect({
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
      bottom: rect.bottom + SPOTLIGHT_PADDING,
      right: rect.right + SPOTLIGHT_PADDING,
    });
  }, [currentStepConfig]);

  // Set up mount state for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Update target rect on step change and window resize
  useEffect(() => {
    if (!isActive) return;

    // Initial calculation with delay for DOM readiness
    const timer = setTimeout(updateTargetRect, 100);

    // Set up resize observer for target element
    if (currentStepConfig) {
      const targetElement = document.querySelector(currentStepConfig.target);
      if (targetElement) {
        resizeObserverRef.current = new ResizeObserver(updateTargetRect);
        resizeObserverRef.current.observe(targetElement);
      }
    }

    // Listen for window resize and scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
      resizeObserverRef.current?.disconnect();
    };
  }, [isActive, currentStepConfig, updateTargetRect]);

  // Don't render if not mounted or not active
  if (!isMounted || !isActive) return null;

  const shouldShowSpotlight =
    currentStepConfig?.spotlight !== false && targetRect !== null;

  // Create the overlay content
  const overlayContent = (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="tour-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed inset-0 z-[9998] pointer-events-none",
            "tour-overlay"
          )}
          aria-hidden="true"
        >
          {/* SVG Mask for spotlight effect */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="tour-spotlight-mask">
                {/* White background = visible overlay */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* Black cutout = transparent spotlight */}
                {shouldShowSpotlight && targetRect && (
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    x={targetRect.left}
                    y={targetRect.top}
                    width={targetRect.width}
                    height={targetRect.height}
                    rx="12"
                    ry="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            {/* Semi-transparent overlay with mask cutout */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>

          {/* Animated ring around spotlight */}
          {shouldShowSpotlight && targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.15,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - 2,
                left: targetRect.left - 2,
                width: targetRect.width + 4,
                height: targetRect.height + 4,
              }}
            >
              <div className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent" />
              {/* Pulsing animation */}
              <motion.div
                className="absolute inset-0 rounded-xl ring-2 ring-primary/50"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render in portal to ensure proper z-index
  return createPortal(overlayContent, document.body);
}
