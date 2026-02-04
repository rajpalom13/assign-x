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
  accent: string
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
    accent: 'from-blue-500/60 to-cyan-500/20',
    format: (v) => v.toString(),
  },
  {
    key: 'completedProjects',
    label: 'Completed Projects',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    accent: 'from-emerald-500/60 to-teal-500/20',
    format: (v) => v.toString(),
  },
  {
    key: 'totalEarnings',
    label: 'Total Earnings',
    icon: DollarSign,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    accent: 'from-teal-500/60 to-emerald-500/20',
    format: (v) => `₹${v.toLocaleString()}`,
  },
  {
    key: 'averageRating',
    label: 'Average Rating',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    accent: 'from-amber-500/60 to-yellow-500/20',
    format: (v) => v.toFixed(1),
  },
  {
    key: 'successRate',
    label: 'Success Rate',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    accent: 'from-emerald-500/60 to-lime-500/20',
    format: (v) => `${v}%`,
  },
  {
    key: 'onTimeDeliveryRate',
    label: 'On-Time Delivery',
    icon: Clock,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    accent: 'from-cyan-500/60 to-sky-500/20',
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
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 18,
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
      <div className={cn('grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6', className)}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse overflow-hidden">
            <CardContent className="p-4">
              <div className="h-1 w-full bg-muted mb-4" />
              <div className="h-10 w-10 rounded-lg bg-muted mb-4" />
              <div className="h-6 w-20 bg-muted rounded mb-2" />
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
      className={cn('grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6', className)}
    >
      {statConfigs.map((config) => {
        const Icon = config.icon
        const value = stats[config.key]

        return (
          <motion.div key={config.key} variants={itemVariants}>
            <Card className="relative overflow-hidden border-muted/60 bg-background/80 transition-all hover:shadow-lg">
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', config.accent)} />
              <CardContent className="p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', config.bgColor)}>
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>
                <p className={cn('text-2xl font-bold mb-1', config.color)}>
                  {config.format(value)}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">{config.label}</p>
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
    { label: 'Completed', value: stats.completedProjects, color: 'text-emerald-600' },
    { label: 'Rating', value: stats.averageRating.toFixed(1), color: 'text-amber-600' },
    { label: 'Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, color: 'text-teal-600' },
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
