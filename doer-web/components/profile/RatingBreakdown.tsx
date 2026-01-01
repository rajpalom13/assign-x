'use client'

/**
 * Rating Breakdown component
 * Displays detailed rating breakdown and recent reviews
 * @module components/profile/RatingBreakdown
 */

import { motion } from 'framer-motion'
import { Star, ThumbsUp, Clock, MessageSquare, Award, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { mockReviews, defaultRatingDistribution } from './constants'
import type { DoerReview } from '@/types/database'

/**
 * RatingBreakdown component props
 */
interface RatingBreakdownProps {
  /** Overall rating */
  overall: number
  /** Quality rating */
  quality: number
  /** Timeliness rating */
  timeliness: number
  /** Communication rating */
  communication: number
  /** Total number of reviews */
  totalReviews: number
  /** Rating distribution (star count) */
  ratingDistribution?: Record<number, number>
  /** Recent reviews */
  recentReviews?: DoerReview[]
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

/** Animation variants for progress bars */
const barVariants = {
  hidden: { width: 0 },
  visible: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  }),
}

/**
 * Get rating color based on value
 * @param rating - Rating value (1-5)
 * @returns Tailwind color class
 */
const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4.0) return 'text-blue-600'
  if (rating >= 3.0) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get rating label based on value
 * @param rating - Rating value (1-5)
 * @returns Human-readable label
 */
const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.0) return 'Good'
  return 'Needs Improvement'
}

/**
 * Format date for display
 * @param date - ISO date string
 * @returns Formatted date string
 */
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Render star icons
 * @param rating - Rating value
 * @param size - Icon size variant
 */
const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  )
}

/** Rating categories configuration */
const categories = [
  { key: 'quality', label: 'Quality', icon: ThumbsUp, color: 'bg-blue-600' },
  { key: 'timeliness', label: 'Timeliness', icon: Clock, color: 'bg-green-600' },
  { key: 'communication', label: 'Communication', icon: MessageSquare, color: 'bg-purple-600' },
] as const

/**
 * Rating Breakdown component
 * Displays detailed rating breakdown and recent reviews
 */
export function RatingBreakdown({
  overall = 4.8,
  quality = 4.9,
  timeliness = 4.7,
  communication = 4.8,
  totalReviews = 45,
  ratingDistribution = defaultRatingDistribution,
  recentReviews = mockReviews,
  isLoading,
  className,
}: RatingBreakdownProps) {
  const categoryValues = { quality, timeliness, communication }
  const totalDistribution = Object.values(ratingDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall rating card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Overall score */}
            <div className="text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <p className={cn('text-4xl font-bold', getRatingColor(overall))}>{overall.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">out of 5</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">{getRatingLabel(overall)}</Badge>
                </div>
              </div>
              <div className="mt-4 flex justify-center">{renderStars(overall, 'md')}</div>
              <p className="text-sm text-muted-foreground mt-1">Based on {totalReviews} reviews</p>
            </div>

            {/* Category breakdown */}
            <div className="flex-1 w-full sm:w-auto space-y-4">
              {categories.map((cat) => {
                const Icon = cat.icon
                const value = categoryValues[cat.key]
                const percentage = (value / 5) * 100

                return (
                  <div key={cat.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <span className={cn('text-sm font-bold', getRatingColor(value))}>{value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        custom={percentage}
                        variants={barVariants}
                        className={cn('h-full rounded-full', cat.color)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rating Distribution
          </CardTitle>
          <CardDescription>Breakdown of ratings received</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars] || 0
            const percentage = totalDistribution > 0 ? (count / totalDistribution) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={percentage}
                    variants={barVariants}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recent Reviews
          </CardTitle>
          <CardDescription>What supervisors are saying</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {review.reviewer_name?.split(' ').map((n) => n[0]).join('') || 'R'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium truncate">{review.reviewer_name || 'Anonymous'}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.overall_rating)}
                      <Badge variant="outline" className="text-xs">{review.project_title}</Badge>
                    </div>
                    {review.feedback && (
                      <p className="text-sm text-muted-foreground">"{review.feedback}"</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">Quality: {review.quality_rating}/5</Badge>
                      <Badge variant="secondary" className="text-xs">Timeliness: {review.timeliness_rating}/5</Badge>
                      <Badge variant="secondary" className="text-xs">Communication: {review.communication_rating}/5</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
