'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  IndianRupee,
  Calendar,
  Award,
  Target,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { getDoerProfile } from '@/services/profile.service'
import { getEarningsData } from '@/services/wallet.service'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { DoerStats, EarningsData } from '@/types/database'

/** Subject stats type */
interface SubjectStat {
  subject: string
  count: number
  earnings: number
}

/** Stat card component with gradient */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-lg", gradient)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {(subtitle || trend) && (
              <div className="flex items-center gap-2 pt-1">
                {trend && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      trend.isPositive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </Badge>
                )}
                {subtitle && (
                  <span className="text-xs text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** Earnings chart component using real data */
function EarningsChart({ data, type }: { data: EarningsData[]; type: 'bar' | 'line' }) {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

  /** Aggregate earnings data by month */
  const monthlyData = months.map((_, index) => {
    const monthEarnings = data
      .filter((d) => new Date(d.date).getMonth() === index)
      .reduce((sum, d) => sum + d.amount, 0)
    return monthEarnings
  })

  const maxHeight = Math.max(...monthlyData, 1)

  return (
    <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
      {monthlyData.map((value, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center gap-2 group"
        >
          <div className="relative w-full flex flex-col items-center">
            {/* Tooltip on hover */}
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded">
              {'\u20B9'}{value.toLocaleString('en-IN')}
            </div>
            <div
              className={cn(
                'w-full rounded-t-md transition-all group-hover:opacity-80',
                type === 'bar'
                  ? 'bg-gradient-to-t from-teal-600 to-emerald-400'
                  : 'bg-gradient-to-t from-teal-600/60 to-emerald-400/60'
              )}
              style={{ height: `${maxHeight > 0 ? (value / maxHeight) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {months[index]}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Statistics page
 * Professional design with detailed performance metrics
 */
export default function StatisticsPage() {
  const { user, doer, isLoading: authLoading } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DoerStats | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [topSubjects, setTopSubjects] = useState<SubjectStat[]>([])

  /**
   * Load statistics data from Supabase
   */
  const loadStats = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const [profileData, earnings] = await Promise.all([
        getDoerProfile(user.id),
        getEarningsData(user.id, period),
      ])

      setStats(profileData.stats)
      setEarningsData(earnings)

      // Load top subjects from actual project data
      if (doer?.id) {
        const supabase = createClient()
        const { data: projects } = await supabase
          .from('projects')
          .select('topic, doer_payout')
          .eq('doer_id', doer.id)
          .eq('status', 'completed')

        if (projects && projects.length > 0) {
          const subjectMap = new Map<string, { count: number; earnings: number }>()
          for (const p of projects) {
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
        }
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, doer?.id, period])

  /** Load stats on mount and when period changes */
  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id, period, loadStats])

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  // Default stats if not loaded
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">
            Track your performance and earnings over time
          </p>
        </div>

        <Select value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month' | 'year')}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`₹${displayStats.totalEarnings.toLocaleString('en-IN')}`}
          subtitle="Lifetime"
          icon={IndianRupee}
          gradient="stat-gradient-teal"
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <StatCard
          title="Projects Completed"
          value={displayStats.completedProjects}
          subtitle="Total delivered"
          icon={CheckCircle2}
          gradient="stat-gradient-emerald"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Average Rating"
          value={`${displayStats.averageRating.toFixed(1)}/5`}
          subtitle={`${displayStats.totalReviews} reviews`}
          icon={Star}
          gradient="stat-gradient-amber"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="On-time Delivery"
          value={`${displayStats.onTimeDeliveryRate.toFixed(0)}%`}
          subtitle="Delivery rate"
          icon={Clock}
          gradient="stat-gradient-purple"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="h-12">
          <TabsTrigger value="earnings" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="ratings" className="gap-2">
            <Star className="h-4 w-4" />
            Ratings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>
                    Monthly earnings for the current year
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last year
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EarningsChart data={earningsData} type="bar" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects Completed</CardTitle>
                  <CardDescription>
                    Number of projects completed each month
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EarningsChart data={earningsData} type="line" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
              <CardDescription>
                Your performance across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Quality of Work', value: displayStats.qualityRating, color: 'bg-teal-500' },
                { label: 'Timeliness', value: displayStats.timelinessRating, color: 'bg-emerald-500' },
                { label: 'Communication', value: displayStats.communicationRating, color: 'bg-cyan-500' },
                { label: 'Overall', value: displayStats.averageRating, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value.toFixed(1)}/5</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", item.color)}
                      style={{ width: `${(item.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Success Rate</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${displayStats.successRate}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{displayStats.successRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">On-time Delivery</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${displayStats.onTimeDeliveryRate}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{displayStats.onTimeDeliveryRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Active Assignments</span>
              <Badge variant="secondary">{displayStats.activeAssignments}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Pending Earnings</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                ₹{displayStats.pendingEarnings.toLocaleString('en-IN')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSubjects.length > 0 ? topSubjects.map((item, index) => (
                <div key={item.subject} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    index === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                    index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} projects
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {'\u20B9'}{item.earnings.toLocaleString('en-IN')}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed projects yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
