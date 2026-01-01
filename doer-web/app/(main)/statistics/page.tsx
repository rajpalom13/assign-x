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
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { getDoerProfile } from '@/services/profile.service'
import { getEarningsData } from '@/services/wallet.service'
import { toast } from 'sonner'
import type { DoerStats, EarningsData } from '@/types/database'

/** Stat card component */
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: number
  trendLabel?: string
}) {
  const isPositive = trend && trend > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <span
                className={cn(
                  'text-xs font-medium',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}{trend}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {trendLabel || description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** Mock chart component */
function MockChart({ type }: { type: 'bar' | 'line' }) {
  const bars = [40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 70, 95]
  const maxHeight = Math.max(...bars)

  return (
    <div className="h-64 flex items-end justify-between gap-2 pt-4">
      {bars.map((value, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <div
            className={cn(
              'w-full rounded-t transition-all',
              type === 'bar' ? 'bg-primary' : 'bg-primary/60'
            )}
            style={{ height: `${(value / maxHeight) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground">
            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Statistics page
 * Shows detailed performance metrics and graphs
 */
export default function StatisticsPage() {
  const { user, doer, isLoading: authLoading } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DoerStats | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])

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
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, period])

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg" />
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
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">
            Track your performance and earnings
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`Rs. ${displayStats.totalEarnings.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          description="Lifetime earnings"
        />
        <StatCard
          title="Projects Completed"
          value={displayStats.completedProjects}
          icon={CheckCircle2}
          description="Total completed"
        />
        <StatCard
          title="Average Rating"
          value={`${displayStats.averageRating.toFixed(1)}/5`}
          icon={Star}
          description={`Based on ${displayStats.totalReviews} reviews`}
        />
        <StatCard
          title="On-time Delivery"
          value={`${displayStats.onTimeDeliveryRate.toFixed(0)}%`}
          icon={Clock}
          description="Delivery rate"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Monthly earnings for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MockChart type="bar" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects Completed</CardTitle>
              <CardDescription>
                Number of projects completed each month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MockChart type="line" />
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
                { label: 'Quality of Work', value: displayStats.qualityRating, percentage: (displayStats.qualityRating / 5) * 100 },
                { label: 'Timeliness', value: displayStats.timelinessRating, percentage: (displayStats.timelinessRating / 5) * 100 },
                { label: 'Communication', value: displayStats.communicationRating, percentage: (displayStats.communicationRating / 5) * 100 },
                { label: 'Overall', value: displayStats.averageRating, percentage: (displayStats.averageRating / 5) * 100 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value.toFixed(1)}/5</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
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
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={displayStats.successRate} className="w-24 h-2" />
                <span className="text-sm font-medium">{displayStats.successRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On-time Delivery</span>
              <div className="flex items-center gap-2">
                <Progress value={displayStats.onTimeDeliveryRate} className="w-24 h-2" />
                <span className="text-sm font-medium">{displayStats.onTimeDeliveryRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Assignments</span>
              <span className="text-sm font-medium">{displayStats.activeAssignments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Earnings</span>
              <span className="text-sm font-medium text-amber-600">Rs. {displayStats.pendingEarnings.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: 'Computer Science', count: 42, earnings: 68500 },
                { subject: 'Business Studies', count: 28, earnings: 45200 },
                { subject: 'Statistics', count: 19, earnings: 22100 },
                { subject: 'English', count: 15, earnings: 12000 },
                { subject: 'Marketing', count: 14, earnings: 8950 },
              ].map((item, index) => (
                <div key={item.subject} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} projects
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Rs. {item.earnings.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
