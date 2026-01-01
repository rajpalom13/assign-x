"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/data/services";

interface ServiceCardProps {
  service: Service;
}

/**
 * Individual service card component
 * Displays service info with icon and optional badge
 * Memoized for list rendering performance
 */
export const ServiceCard = memo(function ServiceCard({ service }: ServiceCardProps) {
  const CardWrapper = service.disabled ? "div" : Link;

  return (
    <CardWrapper
      href={service.disabled ? undefined! : service.href}
      className={cn(
        "block",
        service.disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <Card
        className={cn(
          "group h-full transition-all",
          !service.disabled &&
            "hover:border-primary hover:shadow-md hover:-translate-y-0.5"
        )}
      >
        <CardHeader className="space-y-3">
          {/* Icon & Badge row */}
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                service.color
              )}
            >
              <service.icon className="h-6 w-6" />
            </div>
            {service.badge && (
              <Badge
                variant={service.disabled ? "outline" : "secondary"}
                className="text-xs"
              >
                {service.badge}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <CardDescription className="text-sm">
              {service.description}
            </CardDescription>
          </div>

          {/* Arrow indicator */}
          {!service.disabled && (
            <div className="flex justify-end">
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          )}
        </CardHeader>
      </Card>
    </CardWrapper>
  );
});
