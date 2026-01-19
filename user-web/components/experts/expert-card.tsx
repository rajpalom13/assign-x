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

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <Card
        className={cn("cursor-pointer transition-shadow hover:shadow-md", className)}
        onClick={onClick}
      >
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback>{getInitials(expert.name)}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                getAvailabilityColor(expert.availability)
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-medium truncate">{expert.name}</span>
              {expert.verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{expert.rating.toFixed(1)}</span>
              </div>
              <span>-</span>
              <span>{formatINR(expert.pricePerSession)}/session</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured variant with gradient background
  if (variant === "featured") {
    return (
      <Card
        className={cn(
          "cursor-pointer overflow-hidden transition-all hover:shadow-lg",
          "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={expert.avatar} alt={expert.name} />
                <AvatarFallback className="text-lg">{getInitials(expert.name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background",
                  getAvailabilityColor(expert.availability)
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-semibold truncate">{expert.name}</h3>
                {expert.verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
              </div>

              <p className="text-sm text-muted-foreground mb-2 truncate">
                {expert.designation}
              </p>

              <div className="flex items-center gap-2 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{expert.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({expert.reviewCount})</span>
                </div>
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground">{expert.totalSessions} sessions</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {expert.specializations.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {SPEC_LABELS[spec]}
                  </Badge>
                ))}
                {expert.specializations.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{expert.specializations.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">{formatINR(expert.pricePerSession)}</span>
                  <span className="text-sm text-muted-foreground">/session</span>
                </div>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onBook?.(); }}>
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn("cursor-pointer transition-all hover:shadow-md card-hover", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback>{getInitials(expert.name)}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                getAvailabilityColor(expert.availability)
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-medium truncate">{expert.name}</h3>
              {expert.verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
            </div>

            <p className="text-sm text-muted-foreground mb-2 truncate">
              {expert.designation}
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{expert.rating.toFixed(1)}</span>
                <span>({expert.reviewCount})</span>
              </div>
              <span>-</span>
              <Badge variant="outline" className="text-xs">
                {expert.totalSessions} sessions
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {expert.specializations.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {SPEC_LABELS[spec]}
                </Badge>
              ))}
              {expert.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{expert.specializations.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{expert.responseTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                <span>Google Meet</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="mb-2">
              <span className="text-lg font-bold">{formatINR(expert.pricePerSession)}</span>
              <span className="text-xs text-muted-foreground block">/session</span>
            </div>
            <Button size="sm" onClick={(e) => { e.stopPropagation(); onBook?.(); }}>
              Book
            </Button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-green-500" />
            <span>Platform-secured payment</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <span className="text-xs text-muted-foreground">Money-back guarantee</span>
        </div>
      </CardContent>
    </Card>
  );
});
