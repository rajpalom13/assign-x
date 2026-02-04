'use client'

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EarningsData } from '@/types/database'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface EarningsGraphProps {
  /** Earnings data */
  data?: EarningsData[]
  /** Current period */
  period?: 'week' | 'month' | 'year'
  /** Callback when period changes */
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

/** Generate mock data for demo */
const generateMockData = (period: 'week' | 'month' | 'year'): EarningsData[] => {
  const data: EarningsData[] = []
  const now = new Date()
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 12

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    if (period === 'year') {
      date.setMonth(date.getMonth() - i)
    } else {
      date.setDate(date.getDate() - i)
    }

    data.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 5000) + 1000 + (days - i) * 100,
      projectCount: Math.floor(Math.random() * 5) + 1,
    })
  }

  return data
}

/** Format date for display */
const formatDate = (date: string, period: 'week' | 'month' | 'year') => {
  const d = new Date(date)
  if (period === 'year') {
    return d.toLocaleDateString('en-IN', { month: 'short' })
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** Custom tooltip */
const CustomTooltip = ({ active, payload, label, period }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
  period: 'week' | 'month' | 'year'
}) => {
  if (!active || !payload?.length || !label) return null

  return (
    <div className="bg-popover border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{formatDate(label, period)}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Earnings:</span>
          <span className="text-sm font-medium">₹{payload[0].value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Earnings Graph component
 * Displays earnings over time with interactive chart
 */
export function EarningsGraph({
  data: propData,
  period: initialPeriod = 'month',
  onPeriodChange,
  isLoading,
  className,
}: EarningsGraphProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>(initialPeriod)

  /** Get data for current period */
  const data = useMemo(() => {
    return propData || generateMockData(period)
  }, [propData, period])

  /** Calculate statistics */
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, average: 0, projects: 0, change: 0 }

    const total = data.reduce((sum, d) => sum + d.amount, 0)
    const projects = data.reduce((sum, d) => sum + d.projectCount, 0)
    const average = total / data.length

    // Calculate change compared to previous period
    const midPoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midPoint).reduce((sum, d) => sum + d.amount, 0)
    const secondHalf = data.slice(midPoint).reduce((sum, d) => sum + d.amount, 0)
    const change = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0

    return { total, average, projects, change }
  }, [data])

  /** Handle period change */
  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
    setPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  /** Period options */
  const periodOptions = [
    { value: 'week' as const, label: '7 Days' },
    { value: 'month' as const, label: '30 Days' },
    { value: 'year' as const, label: '12 Months' },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Earnings Overview
            </CardTitle>
            <CardDescription>
              Your earnings performance over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.total.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Daily Average</span>
            </div>
            <p className="text-2xl font-bold">₹{Math.round(stats.average).toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Projects</span>
            </div>
            <p className="text-2xl font-bold">{stats.projects}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              {stats.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-muted-foreground">Change</span>
            </div>
            <p
              className={cn(
                'text-2xl font-bold',
                stats.change >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full rounded-xl border bg-muted/20 p-3">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatDate(date, period)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip period={period} />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Earnings</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {period === 'week'
              ? 'Last 7 days'
              : period === 'month'
              ? 'Last 30 days'
              : 'Last 12 months'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
