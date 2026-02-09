'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  ReviewsHeroBanner,
  RatingAnalyticsDashboard,
  ReviewHighlightsSection,
  ReviewsListSection,
  AchievementCards,
  type Review,
  type RatingDistributionItem,
  type CategoryAverages,
} from '@/components/reviews'

/**
 * Animation variants for page elements
 */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

/**
 * Reviews Page Component
 *
 * Complete redesign with modular component architecture.
 * Features hero banner, analytics dashboard, highlights section,
 * full reviews list, and achievement cards.
 *
 * Layout Structure:
 * 1. Hero Banner (full width) - Overall performance metrics
 * 2. Analytics Dashboard - Rating distribution + category performance
 * 3. Review Highlights (Bento Grid) - Featured + recent reviews
 * 4. Reviews List (Tabbed) - All reviews with filtering
 * 5. Achievements - Milestone cards
 *
 * Data Management:
 * - Fetches reviews from Supabase doer_reviews table
 * - Calculates all derived metrics (averages, distributions)
 * - Handles loading, empty, and error states
 * - Real-time filtering and sorting
 *
 * @example
 * Access at: /reviews
 */
export default function ReviewsPage() {
  const { doer, isLoading: authLoading } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Fetch reviews from Supabase
   * Preserves existing data fetching logic from original page
   */
  useEffect(() => {
    if (!doer?.id) {
      setIsLoading(false)
      return
    }

    const fetchReviews = async () => {
      try {
        const supabase = createClient()

        // Fetch reviews for this doer
        const { data: reviewsData, error } = await supabase
          .from('doer_reviews')
          .select(
            `
            id,
            overall_rating,
            quality_rating,
            timeliness_rating,
            communication_rating,
            review_text,
            created_at,
            project:projects(title),
            reviewer:profiles!reviewer_id(full_name, avatar_url)
          `
          )
          .eq('doer_id', doer.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching reviews:', error)
          toast.error('Failed to load reviews')
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
            project: Array.isArray(r.project) ? r.project[0] || undefined : r.project || undefined,
            reviewer: Array.isArray(r.reviewer)
              ? r.reviewer[0] || undefined
              : r.reviewer || undefined,
          }))
          setReviews(transformedReviews)
        }
      } catch (err) {
        console.error('Error:', err)
        toast.error('An error occurred while loading reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [doer?.id])

  /**
   * Calculate derived metrics from reviews
   */
  const metrics = useMemo(() => {
    const totalReviews = reviews.length

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        fiveStarPercentage: 0,
        fiveStarCount: 0,
        trendingPercent: 0,
        ratingDistribution: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ] as RatingDistributionItem[],
        categoryAverages: {
          quality: 0,
          timeliness: 0,
          communication: 0,
        } as CategoryAverages,
        featuredReview: null,
        recentReviews: [],
      }
    }

    // Calculate averages
    const averageRating =
      reviews.reduce((acc, r) => acc + r.overall_rating, 0) / totalReviews

    const categoryAverages: CategoryAverages = {
      quality: reviews.reduce((acc, r) => acc + r.quality_rating, 0) / totalReviews,
      timeliness:
        reviews.reduce((acc, r) => acc + r.timeliness_rating, 0) / totalReviews,
      communication:
        reviews.reduce((acc, r) => acc + r.communication_rating, 0) / totalReviews,
    }

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => Math.round(r.overall_rating) === stars).length,
    }))

    // Calculate 5-star metrics
    const fiveStarCount = distribution[0].count
    const fiveStarPercentage = Math.round((fiveStarCount / totalReviews) * 100)

    // Calculate trending (simplified: compare recent vs older reviews)
    const recentCount = Math.min(10, Math.floor(totalReviews / 2))
    const recentAvg =
      recentCount > 0
        ? reviews
            .slice(0, recentCount)
            .reduce((acc, r) => acc + r.overall_rating, 0) / recentCount
        : averageRating
    const olderAvg =
      totalReviews > recentCount
        ? reviews
            .slice(recentCount)
            .reduce((acc, r) => acc + r.overall_rating, 0) /
          (totalReviews - recentCount)
        : averageRating
    const trendingPercent = Math.round(
      ((recentAvg - olderAvg) / Math.max(olderAvg, 0.1)) * 100
    )

    // Get featured review (highest rated)
    const featuredReview = [...reviews].sort(
      (a, b) => b.overall_rating - a.overall_rating
    )[0]

    // Get recent reviews (last 3)
    const recentReviews = reviews.slice(0, 3)

    return {
      averageRating,
      totalReviews,
      fiveStarPercentage,
      fiveStarCount,
      trendingPercent,
      ratingDistribution: distribution,
      categoryAverages,
      featuredReview,
      recentReviews,
    }
  }, [reviews])

  /**
   * Handle review click (optional navigation or modal)
   */
  const handleReviewClick = (review: Review) => {
    console.log('Review clicked:', review.id)
    // Optional: Navigate to review detail or open modal
  }

  /**
   * Handle Request Reviews action
   */
  const handleRequestReviews = () => {
    toast.info('Request reviews feature coming soon!')
  }

  /**
   * Handle View Insights action
   */
  const handleViewInsights = () => {
    // Scroll to analytics section
    const analyticsSection = document.getElementById('analytics-section')
    analyticsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-[28px] bg-[#EEF2FF]" />
        <Skeleton className="h-96 rounded-2xl bg-[#EEF2FF]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl bg-[#EEF2FF]" />
          <Skeleton className="h-96 rounded-2xl bg-[#EEF2FF]" />
        </div>
        <Skeleton className="h-96 rounded-2xl bg-[#EEF2FF]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-[#EEF2FF]" />
          ))}
        </div>
      </div>
    )
  }


  return (
    <motion.div
      className="relative space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Radial gradient background overlay - design system pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%)]" />

      {/* ================================================================
          1. HERO BANNER SECTION
          Component: ReviewsHeroBanner
          Displays overall performance metrics and CTAs
          ================================================================ */}
      <motion.div variants={fadeInUp}>
        <ReviewsHeroBanner
          overallRating={metrics.averageRating}
          totalReviews={metrics.totalReviews}
          fiveStarPercentage={metrics.fiveStarPercentage}
          trendingPercent={metrics.trendingPercent}
          onRequestReviews={handleRequestReviews}
          onViewInsights={handleViewInsights}
        />
      </motion.div>

      {/* ================================================================
          2. ANALYTICS DASHBOARD
          Component: RatingAnalyticsDashboard
          Two-column layout: Rating distribution (35%) + Category performance (65%)
          ================================================================ */}
      <motion.div id="analytics-section" variants={fadeInUp}>
        <RatingAnalyticsDashboard
          ratingDistribution={metrics.ratingDistribution}
          categoryAverages={metrics.categoryAverages}
        />
      </motion.div>

      {/* ================================================================
          3. REVIEW HIGHLIGHTS (Bento Grid)
          Component: ReviewHighlightsSection
          Two-column layout: Featured review (left) + Recent reviews (right)
          ================================================================ */}
      {metrics.featuredReview && (
        <motion.div variants={fadeInUp}>
          <ReviewHighlightsSection
            featuredReview={metrics.featuredReview}
            recentReviews={metrics.recentReviews}
            onReviewClick={handleReviewClick}
          />
        </motion.div>
      )}

      {/* ================================================================
          4. REVIEWS LIST (Tabbed)
          Component: ReviewsListSection
          Full reviews list with search, filter, and tabs
          ================================================================ */}
      <motion.div variants={fadeInUp}>
        <ReviewsListSection reviews={reviews} onReviewClick={handleReviewClick} />
      </motion.div>

      {/* ================================================================
          5. ACHIEVEMENTS
          Component: AchievementCards
          Grid of achievement milestone cards with progress tracking
          ================================================================ */}
      <motion.div variants={fadeInUp}>
        <AchievementCards
          totalReviews={metrics.totalReviews}
          averageRating={metrics.averageRating}
          fiveStarCount={metrics.fiveStarCount}
        />
      </motion.div>
    </motion.div>
  )
}
