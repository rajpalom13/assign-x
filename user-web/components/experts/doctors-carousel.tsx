"use client";

/**
 * DoctorsCarousel - Premium featured doctors carousel
 * Matches the glassmorphic design from projects-pro.tsx
 * Features direction-aware animations, progress dots, and manual navigation
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import type { Expert, ExpertSpecialization } from "@/types/expert";

interface DoctorsCarouselProps {
  doctors: Expert[];
  onDoctorClick?: (doctor: Expert) => void;
  onBookClick?: (doctor: Expert) => void;
  className?: string;
}

/**
 * Specialization labels
 */
const SPEC_LABELS: Record<ExpertSpecialization, string> = {
  academic_writing: "Academic Writing",
  research_methodology: "Research",
  data_analysis: "Data Analysis",
  programming: "Programming",
  mathematics: "Mathematics",
  science: "Science",
  business: "Business",
  engineering: "Engineering",
  law: "Law",
  medicine: "Medicine",
  arts: "Arts",
  other: "Other",
};

/**
 * Slide variants for direction-aware animations
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * DoctorsCarousel component - glassmorphic style
 */
export function DoctorsCarousel({
  doctors,
  onDoctorClick,
  onBookClick,
  className,
}: DoctorsCarouselProps) {
  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = doctors.length;

  /**
   * Navigate to a specific slide
   */
  const goToSlide = useCallback(
    (index: number) => {
      const newDirection = index > currentIndex ? 1 : -1;
      setSlide([index, newDirection]);
    },
    [currentIndex]
  );

  /**
   * Navigate to next slide
   */
  const nextSlide = useCallback(() => {
    setSlide(([prev]) => [(prev + 1) % totalSlides, 1]);
  }, [totalSlides]);

  /**
   * Navigate to previous slide
   */
  const prevSlide = useCallback(() => {
    setSlide(([prev]) => [(prev - 1 + totalSlides) % totalSlides, -1]);
  }, [totalSlides]);

  /**
   * Auto-slide effect
   */
  useEffect(() => {
    if (!isPaused && totalSlides > 1) {
      intervalRef.current = setInterval(nextSlide, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextSlide, totalSlides]);

  if (doctors.length === 0) {
    return null;
  }

  const currentDoctor = doctors[currentIndex];

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Featured Doctors
          </h2>
          <p className="text-sm text-muted-foreground">
            Top-rated medical professionals
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-[20px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            className="relative"
          >
            {/* Doctor Card - Glassmorphic style matching projects-pro */}
            <div
              className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10"
              onClick={() => onDoctorClick?.(currentDoctor)}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-50/20 dark:from-amber-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white/80 dark:border-white/10 shadow-lg">
                    <AvatarImage
                      src={currentDoctor.avatar}
                      alt={currentDoctor.name}
                    />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                      {getInitials(currentDoctor.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Availability indicator */}
                  <span
                    className={cn(
                      "absolute bottom-1 right-1 h-5 w-5 rounded-full border-3 border-white dark:border-slate-800",
                      currentDoctor.availability === "available"
                        ? "bg-emerald-500"
                        : currentDoctor.availability === "busy"
                        ? "bg-amber-500"
                        : "bg-gray-400"
                    )}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground truncate">
                      {currentDoctor.name}
                    </h3>
                    {currentDoctor.verified && (
                      <BadgeCheck
                        className="h-5 w-5 text-emerald-500 shrink-0"
                        strokeWidth={2}
                      />
                    )}
                    <Badge className="shrink-0 bg-foreground text-background border-0 text-xs">
                      Featured
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {currentDoctor.designation}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                      <Star
                        className="h-4 w-4 fill-amber-500 text-amber-500"
                        strokeWidth={0}
                      />
                      <span className="font-bold text-sm text-foreground">
                        {currentDoctor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({currentDoctor.reviewCount})
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {currentDoctor.totalSessions} sessions
                    </span>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {currentDoctor.specializations.slice(0, 3).map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="text-xs bg-muted/50 text-muted-foreground border-border/50"
                      >
                        {SPEC_LABELS[spec]}
                      </Badge>
                    ))}
                    {currentDoctor.specializations.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-dashed"
                      >
                        +{currentDoctor.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price & Book */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {formatINR(currentDoctor.pricePerSession)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per session
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookClick?.(currentDoctor);
                    }}
                  >
                    Book Consultation
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "h-10 w-10 rounded-full flex items-center justify-center",
                "bg-white/90 dark:bg-white/10 backdrop-blur-sm",
                "border border-white/50 dark:border-white/10",
                "shadow-lg shadow-black/5",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-white dark:hover:bg-white/20"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "h-10 w-10 rounded-full flex items-center justify-center",
                "bg-white/90 dark:bg-white/10 backdrop-blur-sm",
                "border border-white/50 dark:border-white/10",
                "shadow-lg shadow-black/5",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-white dark:hover:bg-white/20"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Progress Dots */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {doctors.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative h-2 rounded-full overflow-hidden bg-muted transition-all"
              style={{ width: index === currentIndex ? 32 : 8 }}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorsCarousel;
