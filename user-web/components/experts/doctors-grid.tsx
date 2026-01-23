"use client";

/**
 * DoctorsGrid - Bento-style asymmetric grid for doctors
 * First doctor spans 2x2, remaining doctors in standard cards
 */

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DoctorCard } from "./doctor-card";
import type { Expert } from "@/types/expert";

interface DoctorsGridProps {
  doctors: Expert[];
  onDoctorClick?: (doctor: Expert) => void;
  onBookClick?: (doctor: Expert) => void;
  className?: string;
}

/**
 * Stagger animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * DoctorsGrid component - Uniform card layout
 * All cards are the same size for consistent, professional appearance
 */
export function DoctorsGrid({
  doctors,
  onDoctorClick,
  onBookClick,
  className,
}: DoctorsGridProps) {
  if (doctors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="h-16 w-16 rounded-[20px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 flex items-center justify-center mb-5 shadow-lg">
          <svg
            className="h-7 w-7 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your search or filters
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={doctors.map((d) => d.id).join("-")}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className={cn("space-y-4", className)}
      >
        {/* All Doctors - Uniform horizontal cards */}
        {doctors.map((doctor) => (
          <motion.div key={doctor.id} variants={itemVariants}>
            <DoctorCard
              doctor={doctor}
              variant="default"
              onClick={() => onDoctorClick?.(doctor)}
              onBookClick={() => onBookClick?.(doctor)}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Alternative simple grid layout
 */
export function DoctorsSimpleGrid({
  doctors,
  onDoctorClick,
  onBookClick,
  className,
}: DoctorsGridProps) {
  if (doctors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="h-16 w-16 rounded-[20px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 flex items-center justify-center mb-5 shadow-lg">
          <svg
            className="h-7 w-7 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No doctors found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your search or filters
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={doctors.map((d) => d.id).join("-")}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className={cn("space-y-4", className)}
      >
        {doctors.map((doctor) => (
          <motion.div key={doctor.id} variants={itemVariants}>
            <DoctorCard
              doctor={doctor}
              variant="default"
              onClick={() => onDoctorClick?.(doctor)}
              onBookClick={() => onBookClick?.(doctor)}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default DoctorsGrid;
