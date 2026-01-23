"use client";

import { motion } from "framer-motion";
import { X, SkipForward } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTour } from "./tour-provider";

/**
 * Floating Action Button for skipping the tour
 * Always visible in the bottom-right corner during the tour
 * Provides an easy way to exit the tour at any time
 */
export function TourSkipFAB() {
  const { isActive, skipTour } = useTour();

  if (!isActive) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={skipTour}
      className={cn(
        "fixed bottom-24 right-6 z-[250]",
        "flex items-center gap-2",
        "px-4 py-3 rounded-full",
        "bg-background/95 backdrop-blur-xl",
        "border-2 border-border/50 shadow-2xl",
        "text-sm font-medium text-foreground",
        "hover:border-primary/50 hover:shadow-primary/20",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      aria-label="Skip tour"
      title="Skip tour (ESC)"
    >
      <SkipForward className="size-4" />
      <span className="hidden sm:inline">Skip Tour</span>
      <X className="size-3.5 opacity-60" />
    </motion.button>
  );
}
