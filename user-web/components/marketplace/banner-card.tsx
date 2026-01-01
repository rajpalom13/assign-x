"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight, Briefcase, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ListingDisplay } from "./masonry-grid"

/**
 * Props for BannerCard component
 */
interface BannerCardProps {
  listing: ListingDisplay
  className?: string
}

/**
 * BannerCard component for events and job posts
 * Full-width card with image, title, date, and CTA
 */
export function BannerCard({ listing, className }: BannerCardProps) {
  const isOpportunity = listing.listing_type === "opportunity"

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5",
          "transition-all hover:shadow-lg",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-40 w-full sm:h-auto sm:w-48 flex-shrink-0">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 200px"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  isOpportunity
                    ? "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/50 dark:to-purple-900/30"
                    : "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/50 dark:to-blue-900/30"
                )}
              >
                {isOpportunity ? (
                  <Briefcase className="h-16 w-16 text-purple-400 dark:text-purple-500" />
                ) : (
                  <CalendarDays className="h-16 w-16 text-blue-400 dark:text-blue-500" />
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-4">
            {/* Top Section */}
            <div>
              {/* Badge */}
              <Badge
                variant={isOpportunity ? "default" : "secondary"}
                className="mb-2"
              >
                {isOpportunity ? "Opportunity" : "Event"}
              </Badge>

              {/* Title */}
              <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>

              {/* Description */}
              {listing.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Bottom Section */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {listing.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(listing.created_at || "").toLocaleDateString()}
                </span>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                variant="outline"
                className="group/btn flex items-center gap-1"
              >
                {isOpportunity ? "Apply Now" : "Learn More"}
                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
