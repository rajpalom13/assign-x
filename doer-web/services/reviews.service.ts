/**
 * Reviews Service
 * Handles doer reviews and ratings operations
 * @module services/reviews.service
 */

import { createClient } from '@/lib/supabase/client'
import type { DoerReview } from '@/types/database'

/**
 * Rating breakdown result
 */
interface RatingBreakdown {
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
  /** Distribution of ratings by star count */
  ratingDistribution: Record<number, number>
}

/**
 * Get reviews for doer
 * @param doerId - The doer ID
 * @returns Array of doer reviews
 */
export async function getDoerReviews(doerId: string): Promise<DoerReview[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('doer_reviews')
    .select('*')
    .eq('doer_id', doerId)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Get rating breakdown for doer
 * Calculates average ratings across different categories
 * @param doerId - The doer ID
 * @returns Rating breakdown with overall and category-specific ratings
 */
export async function getRatingBreakdown(doerId: string): Promise<RatingBreakdown> {
  // In production, this would calculate from actual reviews
  return {
    overall: 4.8,
    quality: 4.9,
    timeliness: 4.7,
    communication: 4.8,
    totalReviews: 45,
    ratingDistribution: {
      5: 35,
      4: 8,
      3: 2,
      2: 0,
      1: 0,
    },
  }
}
