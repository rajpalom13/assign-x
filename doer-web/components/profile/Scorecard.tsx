'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DoerStats } from '@/types/database'

interface ScorecardProps {
  /** Doer stats */
  stats: DoerStats
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

/** Stat card configuration */
interface StatCardConfig {
  key: keyof DoerStats
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  format: (value: number) => string
}

/** Stat card configurations */
const statConfigs: StatCardConfig[] = [
  {
    key: 'activeAssignments',
    label: 'Active Assignments',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    format: (v) => v.toString(),
  },
  {
    key: 'completedProjects',
    label: 'Completed Projects',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    format: (v) => v.toString(),
  },
  {
    key: 'totalEarnings',
    label: 'Total Earnings',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    format: (v) => `₹${v.toLocaleString()}`,
  },
  {
    key: 'averageRating',
    label: 'Average Rating',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10',
    format: (v) => v.toFixed(1),
  },
  {
    key: 'successRate',
    label: 'Success Rate',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    format: (v) => `${v}%`,
  },
  {
    key: 'onTimeDeliveryRate',
    label: 'On-Time Delivery',
    icon: Clock,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    format: (v) => `${v}%`,
  },
]

/** Animation variants */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * Scorecard component
 * Displays key stats in a grid of cards
 */
export function Scorecard({ stats, isLoading, className }: ScorecardProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6', className)}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-lg bg-muted mb-3" />
              <div className="h-6 w-16 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6', className)}
    >
      {statConfigs.map((config) => {
        const Icon = config.icon
        const value = stats[config.key]

        return (
          <motion.div key={config.key} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow overflow-hidden group">
              <CardContent className="p-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>
                <p className={cn('text-2xl font-bold mb-1', config.color)}>
                  {config.format(value)}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {config.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/**
 * Compact Scorecard variant
 * For use in smaller spaces
 */
interface CompactScorecardProps {
  stats: DoerStats
  className?: string
}

export function CompactScorecard({ stats, className }: CompactScorecardProps) {
  const primaryStats = [
    { label: 'Active', value: stats.activeAssignments, color: 'text-blue-600' },
    { label: 'Completed', value: stats.completedProjects, color: 'text-green-600' },
    { label: 'Rating', value: stats.averageRating.toFixed(1), color: 'text-yellow-600' },
    { label: 'Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, color: 'text-purple-600' },
  ]

  return (
    <div className={cn('flex items-center gap-4 flex-wrap', className)}>
      {primaryStats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
