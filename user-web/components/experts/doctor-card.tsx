"use client";

/**
 * DoctorCard - Premium doctor card with glassmorphic styling
 * Matches the design patterns from projects-pro.tsx
 * Features two variants: default and featured
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Video, Clock, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import type { Expert, ExpertSpecialization } from "@/types/expert";

interface DoctorCardProps {
  doctor: Expert;
  variant?: "default" | "featured";
  onClick?: () => void;
  onBookClick?: () => void;
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
 * Get availability color
 */
function getAvailabilityColor(status: Expert["availability"]): string {
  switch (status) {
    case "available":
      return "bg-emerald-500";
    case "busy":
      return "bg-amber-500";
    case "offline":
      return "bg-gray-400";
  }
}

/**
 * DoctorCard component - glassmorphic style
 */
export const DoctorCard = memo(function DoctorCard({
  doctor,
  variant = "default",
  onClick,
  onBookClick,
  className,
}: DoctorCardProps) {
  // Featured variant - larger card with more details
  if (variant === "featured") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={cn("relative group cursor-pointer", className)}
        onClick={onClick}
      >
        {/* Glassmorphic card matching projects-pro */}
        <div className="relative overflow-hidden rounded-[20px] p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100/40 to-purple-50/20 dark:from-violet-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-white/80 dark:border-white/10 shadow-lg">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                  {getInitials(doctor.name)}
                </AvatarFallback>
              </Avatar>

              {/* Availability indicator */}
              <span
                className={cn(
                  "absolute bottom-1 right-1 h-5 w-5 rounded-full border-3 border-white dark:border-slate-800",
                  getAvailabilityColor(doctor.availability)
                )}
              />

              {/* Verified badge */}
              {doctor.verified && (
                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <BadgeCheck className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Name & Designation */}
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {doctor.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {doctor.designation}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                <Star
                  className="h-4 w-4 fill-amber-500 text-amber-500"
                  strokeWidth={0}
                />
                <span className="font-bold text-sm text-foreground">
                  {doctor.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({doctor.reviewCount})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>{doctor.totalSessions}+ sessions</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {doctor.bio}
            </p>

            {/* Specializations */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {doctor.specializations.slice(0, 3).map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="text-xs bg-muted/50 text-muted-foreground border-border/50"
                >
                  {SPEC_LABELS[spec]}
                </Badge>
              ))}
            </div>

            {/* Price & Book */}
            <div className="w-full pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatINR(doctor.pricePerSession)}
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
                    onBookClick?.();
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          {/* Hover chevron */}
          <ChevronRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </motion.div>
    );
  }

  // Default variant - compact horizontal card
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn("relative group cursor-pointer", className)}
      onClick={onClick}
    >
      {/* Glassmorphic card matching projects-pro */}
      <div className="relative overflow-hidden rounded-[20px] p-4 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/30 to-purple-50/10 dark:from-violet-900/5 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14 border-2 border-white/80 dark:border-white/10 shadow-md">
              <AvatarImage src={doctor.avatar} alt={doctor.name} />
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>

            {/* Availability indicator */}
            <span
              className={cn(
                "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800",
                getAvailabilityColor(doctor.availability)
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-[15px] text-foreground truncate">
                {doctor.name}
              </h3>
              {doctor.verified && (
                <BadgeCheck
                  className="h-4 w-4 text-emerald-500 shrink-0"
                  strokeWidth={2}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {doctor.designation}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                <Star
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                  strokeWidth={0}
                />
                <span className="font-semibold text-xs text-foreground">
                  {doctor.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {doctor.totalSessions} sessions
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {doctor.responseTime.split(" ").slice(-2).join(" ")}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Book */}
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-foreground">
              {formatINR(doctor.pricePerSession)}
            </div>
            <div className="text-[10px] text-muted-foreground mb-2">
              /session
            </div>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 text-xs shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookClick?.();
              }}
            >
              Book
            </Button>
          </div>
        </div>

        {/* Hover chevron */}
        <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
    </motion.div>
  );
});

export default DoctorCard;
