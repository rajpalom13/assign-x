'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Target, Clock } from 'lucide-react'
import { format, subMonths, startOfMonth } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { getDoerProfile } from '@/services/profile.service'
import { getEarningsData } from '@/services/wallet.service'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { DoerStats, EarningsData } from '@/types/database'

// Import all redesigned components
import { PerformanceHeroBanner } from '@/components/statistics/PerformanceHeroBanner'
import { EnhancedStatCard } from '@/components/statistics/EnhancedStatCard'
import { InteractiveEarningsChart, type EarningsDataPoint } from '@/components/statistics/InteractiveEarningsChart'
import { RatingBreakdownCard } from '@/components/statistics/RatingBreakdownCard'
import { ProjectDistributionChart } from '@/components/statistics/ProjectDistributionChart'
import { TopSubjectsRanking } from '@/components/statistics/TopSubjectsRanking'
import { MonthlyPerformanceHeatmap } from '@/components/statistics/MonthlyPerformanceHeatmap'
import { InsightsPanel } from '@/components/statistics/InsightsPanel'
import StatisticsLoadingSkeletons from '@/components/statistics/StatisticsLoadingSkeletons'

/**
 * Subject statistics interface
 */
interface SubjectStat {
  subject: string
  count: number
  earnings: number
}

/**
 * Framer Motion animation variants
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

/**
 * Statistics Page - Redesigned
 *
 * A comprehensive performance analytics dashboard featuring:
 * - Performance hero banner with key metrics
 * - Enhanced stat cards with trends
 * - Interactive earnings and project charts
 * - Rating breakdown visualization
 * - Project distribution and top subjects
 * - Monthly performance heatmap
 * - AI-powered insights and goal tracking
 *
 * @page
 */
export default function StatisticsPage() {
  const { user, doer, isLoading: authLoading } = useAuth()

  // State management
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DoerStats | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [topSubjects, setTopSubjects] = useState<SubjectStat[]>([])
  const [chartType, setChartType] = useState<'earnings' | 'projects'>('earnings')

  // Project status counts (for distribution chart)
  const [projectCounts, setProjectCounts] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    revision: 0
  })

  /**
   * Load all statistics data from Supabase and services
   */
  const loadStats = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Fetch profile data and earnings in parallel
      // Convert 'all' period to 'year' for API compatibility
      const earningsPeriod = period === 'all' ? 'year' : period
      const [profileData, earnings] = await Promise.all([
        getDoerProfile(user.id),
        getEarningsData(user.id, earningsPeriod),
      ])

      setStats(profileData.stats)
      setEarningsData(earnings)

      // Load project data and calculate statistics
      if (doer?.id) {
        const supabase = createClient()

        // Fetch all projects for the doer
        const { data: projects, error } = await supabase
          .from('projects')
          .select('topic, doer_payout, status')
          .eq('doer_id', doer.id)

        if (error) throw error

        if (projects && projects.length > 0) {
          // Calculate top subjects from completed projects
          const completedProjects = projects.filter(p => p.status === 'completed')
          const subjectMap = new Map<string, { count: number; earnings: number }>()

          for (const p of completedProjects) {
            const subj = p.topic || 'Other'
            const existing = subjectMap.get(subj) || { count: 0, earnings: 0 }
            subjectMap.set(subj, {
              count: existing.count + 1,
              earnings: existing.earnings + (Number(p.doer_payout) || 0),
            })
          }

          const sorted = Array.from(subjectMap.entries())
            .map(([subject, data]) => ({ subject, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          setTopSubjects(sorted)

          // Calculate project status distribution
          const statusCounts = {
            completed: projects.filter(p => p.status === 'completed').length,
            inProgress: projects.filter(p => p.status === 'in_progress').length,
            pending: projects.filter(p => p.status === 'pending').length,
            revision: projects.filter(p => p.status === 'revision_requested').length,
          }

          setProjectCounts(statusCounts)
        }
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, doer?.id, period])

  /**
   * Load stats when user/period changes
   */
  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id, period, loadStats])

  /**
   * Show loading state
   */
  if (authLoading || isLoading) {
    return <StatisticsLoadingSkeletons />
  }

  /**
   * Default stats if not loaded
   */
  const displayStats = stats || {
    totalEarnings: 0,
    completedProjects: 0,
    averageRating: 0,
    totalReviews: 0,
    onTimeDeliveryRate: 0,
    successRate: 0,
    qualityRating: 0,
    timelinessRating: 0,
    communicationRating: 0,
    activeAssignments: 0,
    pendingEarnings: 0,
  }

  /**
   * Calculate computed metrics
   */

  // Project velocity (projects per week)
  const projectVelocity = period === 'week'
    ? displayStats.completedProjects
    : period === 'month'
    ? Math.round(displayStats.completedProjects / 4)
    : Math.round(displayStats.completedProjects / 52)

  // Mock trends (in real app, compare with previous period)
  const earningsTrend = 12.5
  const ratingTrend = 2.1
  const velocityTrend = 15.0
  const successRateTrend = { value: 5.2, isPositive: true }
  const onTimeDeliveryTrend = { value: 3.8, isPositive: true }

  /**
   * Transform earnings data for InteractiveEarningsChart
   */
  const chartData: EarningsDataPoint[] = earningsData.map(item => ({
    date: format(new Date(item.date), 'MMM d'),
    amount: item.amount,
    projects: 1 // Assuming 1 project per earning entry; adjust as needed
  }))

  /**
   * Aggregate monthly data for heatmap (last 12 months)
   */
  const generateMonthlyData = () => {
    const monthlyMap = new Map<string, { projects: number; earnings: number; ratings: number[] }>()

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = startOfMonth(subMonths(new Date(), i))
      const monthKey = format(date, 'yyyy-MM')
      monthlyMap.set(monthKey, { projects: 0, earnings: 0, ratings: [] })
    }

    // Aggregate earnings data by month
    earningsData.forEach(item => {
      const monthKey = format(new Date(item.date), 'yyyy-MM')
      const existing = monthlyMap.get(monthKey)
      if (existing) {
        existing.projects += 1
        existing.earnings += item.amount
        // Mock rating for now (in real app, fetch from reviews)
        existing.ratings.push(displayStats.averageRating)
      }
    })

    // Convert to array format expected by heatmap
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      projects: data.projects,
      earnings: data.earnings,
      rating: data.ratings.length > 0
        ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
        : 0
    }))
  }

  const monthlyData = generateMonthlyData()

  /**
   * Mock insights and goals (can be enhanced with real AI insights later)
   */
  const insights = [
    {
      type: 'success' as const,
      message: `Great job! Your success rate of ${displayStats.successRate.toFixed(0)}% is above the platform average.`
    },
    {
      type: 'info' as const,
      message: `You've completed ${displayStats.completedProjects} projects with an average rating of ${displayStats.averageRating.toFixed(1)}/5.`
    },
    ...(displayStats.onTimeDeliveryRate < 90 ? [{
      type: 'warning' as const,
      message: `Your on-time delivery rate is ${displayStats.onTimeDeliveryRate.toFixed(0)}%. Consider improving time management to reach 90%+.`
    }] : [])
  ]

  const goals = [
    {
      title: 'Reach 100 completed projects',
      current: displayStats.completedProjects,
      target: 100,
      unit: 'projects'
    },
    {
      title: 'Earn ₹50,000 total',
      current: displayStats.totalEarnings,
      target: 50000,
      unit: '₹'
    },
    {
      title: 'Achieve 4.8+ average rating',
      current: displayStats.averageRating,
      target: 4.8,
      unit: '★'
    }
  ]

  return (
    <div className="relative min-h-screen">
      {/* Radial gradient background overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%)]" />

      {/* Main content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative space-y-8"
      >
        {/* 1. Performance Hero Banner */}
        <motion.div variants={fadeInUp}>
          <PerformanceHeroBanner
            totalEarnings={displayStats.totalEarnings}
            earningsTrend={earningsTrend}
            averageRating={displayStats.averageRating}
            ratingTrend={ratingTrend}
            projectVelocity={projectVelocity}
            velocityTrend={velocityTrend}
            selectedPeriod={period}
            onPeriodChange={setPeriod}
          />
        </motion.div>

        {/* 2. Quick Stats Grid (4 columns) */}
        <motion.div
          variants={fadeInUp}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <EnhancedStatCard
            title="Total Earnings"
            value={`₹${displayStats.totalEarnings.toLocaleString('en-IN')}`}
            subtitle="Lifetime earnings"
            icon={IndianRupee}
            variant="teal"
          />
          <EnhancedStatCard
            title="Projects Completed"
            value={displayStats.completedProjects}
            subtitle="Successfully delivered"
            icon={CheckCircle2}
            variant="blue"
          />
          <EnhancedStatCard
            title="Success Rate"
            value={`${displayStats.successRate.toFixed(0)}%`}
            subtitle="Project completion"
            icon={Target}
            variant="purple"
            trend={successRateTrend}
          />
          <EnhancedStatCard
            title="On-Time Delivery"
            value={`${displayStats.onTimeDeliveryRate.toFixed(0)}%`}
            subtitle="Deadline adherence"
            icon={Clock}
            variant="orange"
            trend={onTimeDeliveryTrend}
          />
        </motion.div>

        {/* 3. Main Content - Bento Grid Layout */}
        <motion.div
          variants={fadeInUp}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Interactive Earnings Chart */}
          <InteractiveEarningsChart
            data={chartData}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />

          {/* Rating Breakdown Card */}
          <RatingBreakdownCard
            qualityRating={displayStats.qualityRating}
            timelinessRating={displayStats.timelinessRating}
            communicationRating={displayStats.communicationRating}
            overallRating={displayStats.averageRating}
          />

          {/* Project Distribution Chart */}
          <ProjectDistributionChart
            completed={projectCounts.completed}
            inProgress={projectCounts.inProgress}
            pending={projectCounts.pending}
            revision={projectCounts.revision}
          />

          {/* Top Subjects Ranking */}
          <TopSubjectsRanking subjects={topSubjects} />
        </motion.div>

        {/* 4. Monthly Performance Heatmap (Full width) */}
        <motion.div variants={fadeInUp}>
          <MonthlyPerformanceHeatmap monthlyData={monthlyData} />
        </motion.div>

        {/* 5. Insights & Recommendations (2 columns) */}
        <motion.div variants={fadeInUp}>
          <InsightsPanel insights={insights} goals={goals} />
        </motion.div>
      </motion.div>
    </div>
  )
}
