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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
