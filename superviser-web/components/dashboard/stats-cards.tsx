/**
 * @fileoverview Dashboard statistics cards displaying key performance metrics.
 * @module components/dashboard/stats-cards
 */

"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, ClipboardCheck, TrendingUp, IndianRupee, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  gradient: string
}

interface StatsCardsProps {
  activeProjects?: number
  pendingQC?: number
  completedThisMonth?: number
  earningsThisMonth?: number
  isLoading?: boolean
}

export function StatsCards({
  activeProjects = 0,
  pendingQC = 0,
  completedThisMonth = 0,
  earningsThisMonth = 0,
  isLoading = false,
}: StatsCardsProps) {
  const stats: StatCard[] = [
    {
      title: "Active Projects",
      value: activeProjects,
      description: "In progress",
      icon: Activity,
      gradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      title: "Pending QC",
      value: pendingQC,
      description: "Awaiting review",
      icon: ClipboardCheck,
      gradient: "from-amber-500/10 to-orange-600/10",
    },
    {
      title: "Completed",
      value: completedThisMonth,
      description: "This month",
      icon: TrendingUp,
      gradient: "from-emerald-500/10 to-green-600/10",
    },
    {
      title: "Earnings",
      value: `₹${earningsThisMonth.toLocaleString("en-IN")}`,
      description: "This month",
      icon: IndianRupee,
      gradient: "from-violet-500/10 to-purple-600/10",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-card/50">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-muted/30" />
                <Skeleton className="h-9 w-9 rounded-lg bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16 bg-muted/30" />
                <Skeleton className="h-3 w-20 bg-muted/30" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="group relative border-0 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden transition-shadow duration-200 hover:shadow-md cursor-pointer"
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", stat.gradient)} />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", stat.gradient)}>
                <stat.icon className="h-5 w-5 text-foreground/70" strokeWidth={2} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
