/**
 * @fileoverview Professional dashboard page displaying supervisor overview, stats, and active projects.
 * @module app/(dashboard)/dashboard/page
 */

"use client"

import { useState, useMemo } from "react"
import { useProjectsByStatus, useSupervisorStats, useEarningsStats, useSupervisorExpertise } from "@/hooks"
import {
  StatsCards,
  RequestFilter,
  NewRequestsSection,
  ReadyToAssignSection,
  type ProjectRequest,
  type PaidProject,
  type FilterState,
} from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FolderKanban,
  Clock,
  MessageSquare,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [_filters, setFilters] = useState<FilterState>({
    myFieldOnly: true,
    selectedFields: [],
    urgentOnly: false,
  })

  // Use real data hooks
  const {
    needsQuote,
    readyToAssign: readyToAssignProjects,
    inProgress,
    needsQC,
    completed,
    isLoading: projectsLoading,
    refetch: refetchProjects
  } = useProjectsByStatus()

  const { stats: supervisorStats, isLoading: statsLoading } = useSupervisorStats()
  const { stats: earningsStats, isLoading: earningsLoading } = useEarningsStats()
  const { subjectIds: expertiseSubjectIds, isLoading: expertiseLoading } = useSupervisorExpertise()

  const isLoading = projectsLoading || statsLoading || earningsLoading || expertiseLoading

  // Transform projects to match component types
  const newRequests: ProjectRequest[] = useMemo(() => {
    return needsQuote.map(project => ({
      id: project.id,
      project_number: project.project_number,
      title: project.title,
      subject: project.subjects?.name || "General",
      service_type: project.service_type,
      user_name: project.profiles?.full_name || "Unknown User",
      deadline: project.deadline || project.created_at || "",
      word_count: project.word_count || undefined,
      page_count: project.page_count || undefined,
      created_at: project.created_at || "",
      attachments_count: 0,
    }))
  }, [needsQuote])

  const readyToAssign: PaidProject[] = useMemo(() => {
    return readyToAssignProjects.map(project => ({
      id: project.id,
      project_number: project.project_number,
      title: project.title,
      subject: project.subjects?.name || "General",
      service_type: project.service_type,
      user_name: project.profiles?.full_name || "Unknown User",
      deadline: project.deadline || project.created_at || "",
      word_count: project.word_count || undefined,
      page_count: project.page_count || undefined,
      quoted_amount: project.user_quote || 0,
      doer_payout: project.doer_payout || 0,
      paid_at: project.paid_at || project.created_at || "",
      created_at: project.created_at || "",
    }))
  }, [readyToAssignProjects])

  // Transform active projects
  const activeProjects = useMemo(() => {
    return inProgress.map(project => ({
      id: project.id,
      project_number: project.project_number,
      title: project.title,
      doer_name: project.doers?.profiles?.full_name || "Unassigned",
      doer_avatar: project.doers?.profiles?.avatar_url || undefined,
      status: project.status,
      deadline: project.deadline || project.created_at || "",
      last_message_at: undefined,
    }))
  }, [inProgress])

  // Calculate stats
  const stats = useMemo(() => ({
    activeProjects: supervisorStats?.activeProjects || inProgress.length,
    pendingQC: needsQC.length,
    completedThisMonth: supervisorStats?.completedProjects || completed.length,
    earningsThisMonth: earningsStats?.thisMonth || 0,
  }), [supervisorStats, earningsStats, inProgress.length, needsQC.length, completed.length])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleQuoteSubmit = async (_requestId: string, _data: { userQuote: number; doerPayout: number }) => {
    await refetchProjects()
  }

  const handleAssign = async (_projectId: string, _doerId: string) => {
    await refetchProjects()
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: typeof Clock }> = {
      in_progress: { label: "In Progress", variant: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
      submitted_for_qc: { label: "For Review", variant: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertCircle },
      qc_in_progress: { label: "Reviewing", variant: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Clock },
      assigned: { label: "Assigned", variant: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: CheckCircle2 },
      revision_requested: { label: "Revision", variant: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertCircle },
      in_revision: { label: "In Revision", variant: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    }
    return configs[status] || { label: status, variant: "bg-gray-100 text-gray-700", icon: Clock }
  }

  // Quick actions for empty states
  const quickActions = [
    { label: "View Doers", href: "/doers", icon: "👥" },
    { label: "Check Earnings", href: "/earnings", icon: "💰" },
    { label: "Resources", href: "/resources", icon: "📚" },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Badge variant="secondary" className="gap-1 font-normal">
              <Sparkles className="h-3 w-3" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Here&apos;s your supervisor activity at a glance.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects" className="gap-2">
              View All Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCards
        activeProjects={stats.activeProjects}
        pendingQC={stats.pendingQC}
        completedThisMonth={stats.completedThisMonth}
        earningsThisMonth={stats.earningsThisMonth}
        isLoading={isLoading}
      />

      {/* Filter Section */}
      <RequestFilter
        supervisorFields={expertiseSubjectIds}
        onFilterChange={handleFilterChange}
      />

      {/* Request Sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* New Requests */}
        <NewRequestsSection
          requests={newRequests}
          isLoading={isLoading}
          onRefresh={refetchProjects}
          onQuoteSubmit={handleQuoteSubmit}
        />

        {/* Ready to Assign */}
        <ReadyToAssignSection
          projects={readyToAssign}
          isLoading={isLoading}
          onRefresh={refetchProjects}
          onAssign={handleAssign}
        />
      </div>

      {/* Active Projects */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Active Projects</CardTitle>
                  {activeProjects.length > 0 && (
                    <Badge variant="secondary" className="font-semibold">
                      {activeProjects.length}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Projects currently being worked on
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/projects">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No active projects</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Projects will appear here once you assign them to experts. Check the sections above for new requests.
              </p>
              <div className="flex items-center gap-2">
                {quickActions.map((action) => (
                  <Button key={action.href} variant="outline" size="sm" asChild>
                    <Link href={action.href} className="gap-2">
                      <span>{action.icon}</span>
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {activeProjects.map((project, index) => {
                const statusConfig = getStatusConfig(project.status)
                const StatusIcon = statusConfig.icon

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group",
                      "animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Doer Avatar */}
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm flex-shrink-0">
                      <AvatarImage src={project.doer_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-semibold">
                        {project.doer_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono px-1.5 py-0 h-5">
                          {project.project_number}
                        </Badge>
                        <span className="font-medium truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="truncate">Expert: {project.doer_name}</span>
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">
                            Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={cn("gap-1", statusConfig.variant)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/chat/${project.id}`
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
