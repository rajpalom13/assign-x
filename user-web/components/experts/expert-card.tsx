"use client";

/**
 * ExpertCard - Premium expert card with glassmorphic styling
 * Matches the design patterns from projects-pro.tsx
 * Features default, compact, and featured variants
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Clock, Video, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import type { Expert, ExpertSpecialization } from "@/types/expert";

interface ExpertCardProps {
  expert: Expert;
  onClick?: () => void;
  onBook?: () => void;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

/**
 * Specialization label mapping
 */
const SPEC_LABELS: Record<ExpertSpecialization, string> = {
  academic_writing: "Academic Writing",
  research_methodology: "Research Methodology",
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
 * Get initials from name for avatar fallback
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
 * Get availability indicator color
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
 * Expert card component displaying expert information
 * Memoized to prevent unnecessary re-renders in lists
 */
export const ExpertCard = memo(function ExpertCard({
  expert,
  onClick,
  onBook,
  variant = "default",
  className,
}: ExpertCardProps) {
  // Compact variant - glassmorphic minimal card
  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className={cn("relative group cursor-pointer", className)}
        onClick={onClick}
      >
        {/* Glassmorphic card */}
        <div className="relative overflow-hidden rounded-[20px] p-4 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100/30 to-purple-50/10 dark:from-violet-900/5 dark:to-transparent pointer-events-none rounded-[20px]" />

          <div className="relative z-10 flex items-start gap-3">
            {/* Avatar with availability */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 border-2 border-white/80 dark:border-white/10 shadow-md">
                <AvatarImage src={expert.avatar} alt={expert.name} />
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 shadow-sm",
                  getAvailabilityColor(expert.availability)
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-sm truncate text-foreground">
                    {expert.name}
                  </h3>
                  {expert.verified && (
                    <BadgeCheck
                      className="h-4 w-4 text-emerald-500 flex-shrink-0"
                      strokeWidth={2}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {expert.designation}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                  <Star
                    className="h-3 w-3 fill-amber-500 text-amber-500"
                    strokeWidth={0}
                  />
                  <span className="font-semibold text-foreground">
                    {expert.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {expert.totalSessions} sessions
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-base font-bold text-foreground">
                    {formatINR(expert.pricePerSession)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    /session
                  </span>
                </div>
                <Button
                  size="sm"
                  className="px-3 py-1 h-7 text-xs bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook?.();
                  }}
                >
                  Book
                </Button>
              </div>
            </div>
          </div>

          {/* Hover chevron */}
          <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </motion.div>
    );
  }

  // Featured variant - larger glassmorphic card
  if (variant === "featured") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={cn("relative group cursor-pointer", className)}
        onClick={onClick}
      >
        {/* Glassmorphic card */}
        <div className="relative overflow-hidden rounded-[20px] p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
          {/* Subtle amber gradient overlay for featured */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-50/20 dark:from-amber-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

          <div className="relative z-10 flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 border-3 border-white/80 dark:border-white/10 shadow-lg">
                <AvatarImage src={expert.avatar} alt={expert.name} />
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 shadow-lg",
                  getAvailabilityColor(expert.availability)
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold truncate text-foreground">
                    {expert.name}
                  </h3>
                  {expert.verified && (
                    <BadgeCheck
                      className="h-5 w-5 text-emerald-500 flex-shrink-0"
                      strokeWidth={2}
                    />
                  )}
                  <Badge className="shrink-0 bg-foreground text-background border-0 text-xs">
                    Featured
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {expert.designation}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                  <Star
                    className="h-4 w-4 fill-amber-500 text-amber-500"
                    strokeWidth={0}
                  />
                  <span className="font-bold text-foreground">
                    {expert.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({expert.reviewCount})
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {expert.totalSessions} sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {expert.specializations.slice(0, 3).map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-xs bg-muted/50 text-muted-foreground border-border/50"
                  >
                    {SPEC_LABELS[spec]}
                  </Badge>
                ))}
                {expert.specializations.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-dashed"
                  >
                    +{expert.specializations.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xl font-bold text-foreground">
                    {formatINR(expert.pricePerSession)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    /session
                  </span>
                </div>
                <Button
                  size="default"
                  className="px-5 bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook?.();
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          {/* Hover chevron */}
          <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </motion.div>
    );
  }

  // Default variant - horizontal glassmorphic card
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn("relative group cursor-pointer", className)}
      onClick={onClick}
    >
      {/* Glassmorphic card */}
      <div className="relative overflow-hidden rounded-[20px] p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/30 to-purple-50/10 dark:from-violet-900/5 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-14 w-14 border-2 border-white/80 dark:border-white/10 shadow-md">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                {getInitials(expert.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800",
                getAvailabilityColor(expert.availability)
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-semibold text-[15px] truncate text-foreground">
                {expert.name}
              </h3>
              {expert.verified && (
                <BadgeCheck
                  className="h-4 w-4 text-emerald-500 flex-shrink-0"
                  strokeWidth={2}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {expert.designation}
            </p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30">
                <Star
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                  strokeWidth={0}
                />
                <span className="font-semibold text-foreground">
                  {expert.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {expert.totalSessions} sessions
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{expert.responseTime.split(" ").slice(-2).join(" ")}</span>
              </div>
            </div>
          </div>

          {/* Price & Book */}
          <div className="text-right flex-shrink-0 space-y-2">
            <div>
              <div className="text-lg font-bold text-foreground">
                {formatINR(expert.pricePerSession)}
              </div>
              <div className="text-[10px] text-muted-foreground">/session</div>
            </div>
            <Button
              size="sm"
              className="w-full px-4 bg-foreground text-background hover:bg-foreground/90 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onBook?.();
              }}
            >
              Book
            </Button>
          </div>
        </div>

        {/* Hover chevron */}
        <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-5 h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
    </motion.div>
  );
});

export default ExpertCard;
