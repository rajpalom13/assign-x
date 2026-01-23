/**
 * @fileoverview Main dashboard page displaying supervisor overview, stats, new requests, and active projects.
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
import { FolderKanban, Clock, MessageSquare, ChevronRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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
  // Note: Using project.created_at as fallback for deadline when not set (stable value)
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
      attachments_count: 0, // Would need to fetch from attachments table
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
      last_message_at: undefined, // Would need to fetch from chat
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
    // Refetch projects after quote submission
    await refetchProjects()
  }

  const handleAssign = async (_projectId: string, _doerId: string) => {
    // Refetch projects after assignment
    await refetchProjects()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "submitted_for_qc":
        return <Badge className="bg-yellow-500">For Review</Badge>
      case "qc_in_progress":
        return <Badge className="bg-purple-500">Reviewing</Badge>
      case "assigned":
        return <Badge className="bg-indigo-500">Assigned</Badge>
      case "revision_requested":
        return <Badge className="bg-orange-500">Revision</Badge>
      case "in_revision":
        return <Badge className="bg-amber-500">In Revision</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your supervisor activity.
          </p>
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Active Projects</CardTitle>
              {activeProjects.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({activeProjects.length})
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <CardDescription>
            Projects currently being worked on by doers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No active projects</p>
              <p className="text-sm text-muted-foreground">
                Assigned projects will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {project.doer_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          {project.project_number}
                        </Badge>
                        <span className="font-medium truncate">{project.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1">
                        <span className="truncate">Doer: {project.doer_name}</span>
                        <span className="hidden sm:inline">|</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">
                            Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-shrink-0">
                    {getStatusBadge(project.status)}
                    <Button variant="ghost" size="icon" className="relative" asChild>
                      <Link href={`/chat/${project.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        {project.last_message_at && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
