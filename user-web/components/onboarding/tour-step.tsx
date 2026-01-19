"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTour } from "./tour-provider";

/**
 * TourStep Component
 * Container for rendering step-specific content with animations
 * Can be used to add custom content to specific tour steps
 *
 * @returns Tour step wrapper
 */
export function TourStep() {
  const { isActive, currentStep, currentStepConfig, isFirstStep } = useTour();
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome animation on first step
  useEffect(() => {
    if (isActive && isFirstStep) {
      const timer = setTimeout(() => setShowWelcome(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [isActive, isFirstStep]);

  // Don't render if not active
  if (!isActive || !currentStepConfig) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Welcome overlay for first step */}
      {showWelcome && currentStepConfig.id === "welcome" && (
        <WelcomeAnimation key="welcome-animation" />
      )}
    </AnimatePresence>
  );
}

/**
 * Welcome animation component
 * Displays a celebratory animation on the welcome step
 */
function WelcomeAnimation() {
  const { nextStep } = useTour();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed inset-0 z-[9997]",
        "flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm"
      )}
      onClick={nextStep}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        className={cn(
          "relative max-w-md mx-4",
          "bg-card rounded-3xl",
          "shadow-2xl border border-border/50",
          "overflow-hidden"
        )}
      >
        {/* Gradient header */}
        <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
          >
            <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-8 text-white" />
            </div>
          </motion.div>

          {/* Floating particles */}
          <FloatingParticles />
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Welcome to AssignX!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            Your academic success journey starts here. Let&apos;s take a quick
            tour to help you get started.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={nextStep}
            className={cn(
              "w-full py-3 px-6 rounded-xl",
              "bg-primary text-primary-foreground",
              "font-semibold text-sm",
              "hover:bg-primary/90",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            Start Tour
          </motion.button>

          <SkipButton />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Skip button component that uses the tour context properly
 */
function SkipButton() {
  const { skipTour } = useTour();

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      onClick={skipTour}
      className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Skip for now
    </motion.button>
  );
}

/**
 * Floating particles animation
 */
function FloatingParticles() {
  const particles = Array.from({ length: 6 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-2 rounded-full bg-white/30"
          initial={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 100,
            scale: 0,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * TourTarget Component
 * Wrapper to mark elements as tour targets
 *
 * @param props - Component props
 * @returns Wrapped element with tour data attribute
 */
interface TourTargetProps {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export function TourTarget({ children, id, className }: TourTargetProps) {
  return (
    <div data-tour={id} className={className}>
      {children}
    </div>
  );
}
