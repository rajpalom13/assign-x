/**
 * @fileoverview Dashboard statistics cards displaying key performance metrics.
 * @module components/dashboard/stats-cards
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban, Clock, CheckCircle, Wallet, LucideIcon } from "lucide-react"

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
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
      description: "Currently in progress",
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending QC",
      value: pendingQC,
      description: "Awaiting your review",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      title: "Completed",
      value: completedThisMonth,
      description: "This month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Earnings",
      value: `₹${earningsThisMonth.toLocaleString("en-IN")}`,
      description: "This month",
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
