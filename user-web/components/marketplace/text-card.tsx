"use client"

import Link from "next/link"
import { Heart, MessageSquare, ThumbsUp, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ListingDisplay } from "./masonry-grid"

/**
 * Props for TextCard component
 */
interface TextCardProps {
  listing: ListingDisplay
  onFavorite?: (listingId: string) => void
  className?: string
}

/**
 * Background colors for text cards
 */
const bgColors = [
  "bg-blue-50 dark:bg-blue-950/30",
  "bg-purple-50 dark:bg-purple-950/30",
  "bg-green-50 dark:bg-green-950/30",
  "bg-orange-50 dark:bg-orange-950/30",
  "bg-pink-50 dark:bg-pink-950/30",
  "bg-cyan-50 dark:bg-cyan-950/30",
]

/**
 * TextCard component for community posts
 * Displays questions, reviews, or discussions with solid background
 */
export function TextCard({ listing, onFavorite, className }: TextCardProps) {
  // Pick background color based on listing ID
  const bgColor = bgColors[listing.title.length % bgColors.length]

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(listing.id)
  }

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl p-4 transition-all hover:shadow-lg",
          bgColor,
          className
        )}
      >
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

        {/* Category Badge */}
        {listing.category && (
          <Badge variant="secondary" className="mb-3 text-xs">
            {listing.category.name}
          </Badge>
        )}

        {/* Question/Content */}
        <p className="line-clamp-4 text-sm font-medium leading-relaxed text-foreground">
          {listing.description || listing.title}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={listing.seller?.avatar_url || ""} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {listing.seller?.full_name || "Anonymous"}
            </span>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {listing.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              0
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
