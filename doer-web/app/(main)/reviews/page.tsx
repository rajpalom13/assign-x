'use client'

import { useState, useEffect } from 'react'
import { Star, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuthToken } from '@/hooks/useAuthToken'

/** Review type from database */
interface Review {
  id: string
  overall_rating: number
  quality_rating: number
  timeliness_rating: number
  communication_rating: number
  review_text: string | null
  created_at: string
  project: {
    title: string
  } | null
  reviewer: {
    full_name: string
    avatar_url: string | null
  } | null
}

/** Star rating display component */
function StarRating({ rating, size = 'default' }: { rating: number; size?: 'sm' | 'default' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Reviews page
 * Shows feedback score and rating history from database
 */
export default function ReviewsPage() {
  const { hasToken, isReady } = useAuthToken({ redirectOnMissing: true })
  const [filter, setFilter] = useState('all')
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Fetch reviews from database
   */
  useEffect(() => {
    if (!isReady || !hasToken) return

    const fetchReviews = async () => {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        // Get doer record
        const { data: doer } = await supabase
          .from('doers')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (!doer) {
          setIsLoading(false)
          return
        }

        // Fetch reviews for this doer
        const { data: reviewsData, error } = await supabase
          .from('doer_reviews')
          .select(`
            id,
            overall_rating,
            quality_rating,
            timeliness_rating,
            communication_rating,
            review_text,
            created_at,
            project:projects(title),
            reviewer:profiles!reviewer_id(full_name, avatar_url)
          `)
          .eq('doer_id', doer.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching reviews:', error)
        } else {
          // Transform data to match Review type (Supabase returns arrays for single relations)
          const transformedReviews: Review[] = (reviewsData || []).map((r) => ({
            id: r.id,
            overall_rating: r.overall_rating,
            quality_rating: r.quality_rating,
            timeliness_rating: r.timeliness_rating,
            communication_rating: r.communication_rating,
            review_text: r.review_text,
            created_at: r.created_at,
            project: Array.isArray(r.project) ? r.project[0] || null : r.project,
            reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] || null : r.reviewer,
          }))
          setReviews(transformedReviews)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [isReady, hasToken])

  // Calculate rating statistics
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, r) => acc + r.overall_rating, 0) / totalReviews
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.overall_rating === rating).length,
    percentage: totalReviews > 0
      ? (reviews.filter((r) => r.overall_rating === rating).length / totalReviews) * 100
      : 0,
  }))

  const categoryAverages = totalReviews > 0
    ? {
        quality: reviews.reduce((acc, r) => acc + r.quality_rating, 0) / totalReviews,
        timeliness: reviews.reduce((acc, r) => acc + r.timeliness_rating, 0) / totalReviews,
        communication: reviews.reduce((acc, r) => acc + r.communication_rating, 0) / totalReviews,
      }
    : { quality: 0, timeliness: 0, communication: 0 }

  // Filter reviews
  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.overall_rating === parseInt(filter))

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!hasToken) {
    return null // Will redirect via useAuthToken
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">
          See what supervisors say about your work
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Overall rating */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-2">
                <span className="text-sm w-3">{item.rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Progress value={item.percentage} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-6">
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category averages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Category Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Quality', value: categoryAverages.quality },
              { label: 'Timeliness', value: categoryAverages.timeliness },
              { label: 'Communication', value: categoryAverages.communication },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(item.value)} size="sm" />
                  <span className="text-sm font-medium">{item.value.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reviews list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>
              Feedback from supervisors on your completed projects
            </CardDescription>
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="space-y-6">
          {filteredReviews.map((review, index) => (
            <div key={review.id}>
              {index > 0 && <Separator className="mb-6" />}

              <div className="space-y-4">
                {/* Review header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                      <AvatarFallback>
                        {review.reviewer?.full_name
                          ? review.reviewer.full_name.split(' ').map((n) => n[0]).join('')
                          : 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.reviewer?.full_name || 'Supervisor'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.overall_rating} />
                </div>

                {/* Project reference */}
                {review.project?.title && (
                  <Badge variant="secondary" className="font-normal">
                    {review.project.title}
                  </Badge>
                )}

                {/* Review comment */}
                {review.review_text && (
                  <p className="text-sm leading-relaxed">{review.review_text}</p>
                )}

                {/* Category ratings */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Quality:</span>
                    <StarRating rating={review.quality_rating} size="sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Timeliness:</span>
                    <StarRating rating={review.timeliness_rating} size="sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Communication:</span>
                    <StarRating rating={review.communication_rating} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {totalReviews === 0 ? 'No reviews yet' : 'No reviews found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
