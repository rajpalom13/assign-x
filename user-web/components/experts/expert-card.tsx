"use client";

import { memo } from "react";
import { Star, BadgeCheck, Clock, Video, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import type { Expert, ExpertSpecialization, SPECIALIZATION_LABELS } from "@/types/expert";

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
 * Expert card component displaying expert information
 * Supports default, compact, and featured variants
 * Memoized to prevent unnecessary re-renders in lists
 */
export const ExpertCard = memo(function ExpertCard({
  expert,
  onClick,
  onBook,
  variant = "default",
  className,
}: ExpertCardProps) {
  /**
   * Get initials from name for avatar fallback
   */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get availability indicator color
   */
  const getAvailabilityColor = (status: Expert["availability"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  /**
   * Get availability text
   */
  const getAvailabilityText = (status: Expert["availability"]) => {
    switch (status) {
      case "available":
        return "Available Now";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
    }
  };

  // Compact variant for lists - Premium Minimal Design
  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 group glass-card",
          "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
          "border-border/30",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar with verified badge */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-border/30 group-hover:ring-primary/20 transition-all">
                <AvatarImage src={expert.avatar} alt={expert.name} />
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background shadow-sm",
                  getAvailabilityColor(expert.availability)
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {expert.name}
                  </h3>
                  {expert.verified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" strokeWidth={2.5} fill="currentColor" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {expert.designation}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" strokeWidth={0} />
                  <span className="font-semibold text-foreground">{expert.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{expert.totalSessions} sessions</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {formatINR(expert.pricePerSession)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">/session</span>
                </div>
                <Button
                  size="sm"
                  className="px-3 py-1 h-7 text-xs shadow-sm hover:shadow-md transition-all"
                  onClick={(e) => { e.stopPropagation(); onBook?.(); }}
                >
                  Book
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured variant - compact glassmorphism
  if (variant === "featured") {
    return (
      <Card
        className={cn(
          "cursor-pointer overflow-hidden transition-all duration-500 group",
          "glass-card hover:shadow-xl hover:border-primary/30",
          "hover:-translate-y-0.5",
          "bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/80 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-red-950/20",
          "border-amber-200/40 dark:border-amber-800/30",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-500" />
              <Avatar className="h-14 w-14 border-2 border-white dark:border-background relative ring-2 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                <AvatarImage src={expert.avatar} alt={expert.name} />
                <AvatarFallback className="text-base font-bold bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background shadow-lg",
                  getAvailabilityColor(expert.availability),
                  "ring-1 ring-background"
                )}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                    {expert.name}
                  </h3>
                  {expert.verified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" strokeWidth={2.5} fill="currentColor" />
                  )}
                  <Badge variant="secondary" className="shrink-0 text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                    FEATURED
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {expert.designation}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-amber-100/50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" strokeWidth={0} />
                  <span className="font-bold text-foreground">{expert.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-[10px]">({expert.reviewCount})</span>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  {expert.totalSessions} sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {expert.specializations.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-white/60 dark:bg-white/5">
                    {SPEC_LABELS[spec]}
                  </Badge>
                ))}
                {expert.specializations.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-dashed">
                    +{expert.specializations.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {formatINR(expert.pricePerSession)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">/session</span>
                </div>
                <Button
                  size="sm"
                  className="px-4 py-1 h-8 text-xs shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  onClick={(e) => { e.stopPropagation(); onBook?.(); }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - Ultra Minimal
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 group glass-card",
        "hover:shadow-md hover:border-primary/20",
        "border-border/20",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-14 w-14 border-2 border-background">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(expert.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {expert.name}
              </h3>
              {expert.verified && (
                <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" strokeWidth={2.5} fill="currentColor" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {expert.designation}
            </p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" strokeWidth={0} />
                <span className="font-semibold">{expert.rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-xs">{expert.totalSessions} sessions</span>
            </div>
          </div>

          {/* Price & Book */}
          <div className="text-right flex-shrink-0 space-y-2">
            <div>
              <div className="text-xl font-bold">
                {formatINR(expert.pricePerSession)}
              </div>
              <div className="text-[10px] text-muted-foreground">/session</div>
            </div>
            <Button
              size="sm"
              className="w-full px-4 shadow-sm hover:shadow-md transition-all"
              onClick={(e) => { e.stopPropagation(); onBook?.(); }}
            >
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
