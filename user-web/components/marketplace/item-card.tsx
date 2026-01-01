"use client"

import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Package, Home, Briefcase, Users, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ListingDisplay } from "./masonry-grid"

/**
 * Props for ItemCard component
 */
interface ItemCardProps {
  listing: ListingDisplay
  onFavorite?: (listingId: string) => void
  className?: string
}

/**
 * ItemCard component for marketplace listings
 * Displays product image, price, distance, and seller info
 * Pinterest-style variable aspect ratio card
 * Memoized for list rendering performance
 */
export const ItemCard = memo(function ItemCard({ listing, onFavorite, className }: ItemCardProps) {
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(listing.id)
  }

  // Generate random aspect ratio for Pinterest-style layout
  const aspectRatios = ["aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/3]"]
  const aspectRatio = aspectRatios[Math.floor(listing.title.length % aspectRatios.length)]

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl bg-card transition-all hover:shadow-lg",
          className
        )}
      >
        {/* Image Container */}
        <div className={cn("relative w-full overflow-hidden", aspectRatio)}>
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                listing.listing_type === "sell"
                  ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30"
                  : listing.listing_type === "housing"
                  ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30"
                  : listing.listing_type === "opportunity"
                  ? "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30"
                  : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30"
              )}
            >
              {listing.listing_type === "sell" ? (
                <ShoppingBag className="h-12 w-12 text-blue-400 dark:text-blue-500" />
              ) : listing.listing_type === "housing" ? (
                <Home className="h-12 w-12 text-green-400 dark:text-green-500" />
              ) : listing.listing_type === "opportunity" ? (
                <Briefcase className="h-12 w-12 text-purple-400 dark:text-purple-500" />
              ) : (
                <Users className="h-12 w-12 text-orange-400 dark:text-orange-500" />
              )}
            </div>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={handleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                listing.is_favorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              )}
            />
          </Button>

          {/* Price Badge */}
          {listing.price && listing.price > 0 && (
            <Badge
              className="absolute bottom-2 left-2 bg-white/90 text-foreground backdrop-blur-sm"
              variant="secondary"
            >
              ₹{listing.price.toLocaleString()}
            </Badge>
          )}

          {/* Free Badge */}
          {listing.price === 0 && (
            <Badge
              className="absolute bottom-2 left-2 bg-green-500 text-white"
            >
              FREE
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-medium leading-tight">
            {listing.title}
          </h3>

          {/* Location/Distance */}
          {listing.city && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{listing.city}</span>
            </div>
          )}

          {/* Category Tag */}
          {listing.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {listing.category.name}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
})
