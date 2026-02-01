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
      in_progress: { label: "In Progress", variant: "bg-[#E7F2EF] text-[#0F4C4A]", icon: Clock },
      submitted_for_qc: { label: "For Review", variant: "bg-[#F4E7D0] text-[#7A5A2C]", icon: AlertCircle },
      qc_in_progress: { label: "Reviewing", variant: "bg-[#E7F2EF] text-[#1B6F6A]", icon: Clock },
      assigned: { label: "Assigned", variant: "bg-[#E6F0EE] text-[#0F4C4A]", icon: CheckCircle2 },
      revision_requested: { label: "Revision", variant: "bg-[#F7E1D6] text-[#8A4C3A]", icon: AlertCircle },
      in_revision: { label: "In Revision", variant: "bg-[#F4E7D0] text-[#7A5A2C]", icon: Clock },
    }
    return configs[status] || { label: status, variant: "bg-[#F3EBDD] text-[#5A6B68]", icon: Clock }
  }

  // Quick actions for empty states
  const quickActions = [
    { label: "View Doers", href: "/doers", icon: "👥" },
    { label: "Check Earnings", href: "/earnings", icon: "💰" },
    { label: "Resources", href: "/resources", icon: "📚" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="rounded-2xl border border-[#E7DED0] bg-gradient-to-r from-[#F7F1E8] via-[#E7F2EF] to-[#F7F1E8] p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#122022]">Supervisor Dashboard</h1>
              <Badge className="gap-1 border border-[#9FD6CC]/60 bg-[#E7F2EF] text-[#0F4C4A]">
                <CheckCircle2 className="h-3 w-3" />
                On track
              </Badge>
            </div>
            <p className="text-[#536563]">
              Coastal view of your queue, assignments, and live progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#0F4C4A]/30 text-[#0F4C4A] hover:bg-[#0F4C4A]/10"
              asChild
            >
              <Link href="/projects" className="gap-2">
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border border-[#E7DED0] bg-white/80">
            <CardHeader className="border-b border-[#E7DED0] pb-3">
              <CardTitle className="text-base font-semibold text-[#122022]">Queue Filters</CardTitle>
              <CardDescription className="text-sm text-[#5A6B68]">
                Focus requests by expertise and urgency.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <RequestFilter
                supervisorFields={expertiseSubjectIds}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>

          <NewRequestsSection
            requests={newRequests}
            isLoading={isLoading}
            onRefresh={refetchProjects}
            onQuoteSubmit={handleQuoteSubmit}
          />

          <Card className="overflow-hidden border border-[#E7DED0] bg-white/85">
            <CardHeader className="pb-4 border-b border-[#E7DED0] bg-gradient-to-r from-[#F8F2E9] via-[#E7F2EF] to-[#F8F2E9]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E7F2EF] flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-[#0F4C4A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-[#122022]">Active Projects</CardTitle>
                      {activeProjects.length > 0 && (
                        <Badge className="border border-[#9FD6CC]/60 bg-[#E7F2EF] text-[#0F4C4A]">
                          {activeProjects.length}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[#5A6B68]">
                      Projects currently being worked on
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-[#0F4C4A]" asChild>
                  <Link href="/projects">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y divide-[#E7DED0]/70">
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
                  <div className="h-16 w-16 rounded-2xl bg-[#F3EBDD] flex items-center justify-center mb-4">
                    <FolderKanban className="h-8 w-8 text-[#8FA3A0]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-[#122022]">No active projects</h3>
                  <p className="text-sm text-[#5A6B68] mb-6 max-w-sm">
                    Assign a project to see live progress here.
                  </p>
                  <div className="flex items-center gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.href}
                        variant="outline"
                        size="sm"
                        className="border-[#E7DED0] text-[#0F4C4A] hover:bg-[#E7F2EF]"
                        asChild
                      >
                        <Link href={action.href} className="gap-2">
                          <span>{action.icon}</span>
                          {action.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#E7DED0]/70">
                  {activeProjects.map((project, index) => {
                    const statusConfig = getStatusConfig(project.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className={cn(
                          "flex items-center gap-4 p-4 hover:bg-[#F7F1E8] transition-colors group",
                          "animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm flex-shrink-0">
                          <AvatarImage src={project.doer_avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1C4B4F] to-[#72B7AD] text-white text-sm font-semibold">
                            {project.doer_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="text-xs font-mono px-1.5 py-0 h-5 border border-[#E7DED0] bg-[#F3EBDD] text-[#5A6B68]">
                              {project.project_number}
                            </Badge>
                            <span className="font-medium truncate text-[#122022] group-hover:text-[#0F4C4A] transition-colors">
                              {project.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-[#5A6B68] mt-1">
                            <span className="truncate">Expert: {project.doer_name}</span>
                            <span className="text-[#D9C9B3]">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="whitespace-nowrap">
                                Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge className={cn("gap-1", statusConfig.variant)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#0F4C4A] opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault()
                              window.location.href = `/chat/${project.id}`
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-[#8FA3A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E7DED0] bg-white/80 p-4">
            <div className="mb-3 text-sm font-semibold text-[#122022]">Key Metrics</div>
            <StatsCards
              activeProjects={stats.activeProjects}
              pendingQC={stats.pendingQC}
              completedThisMonth={stats.completedThisMonth}
              earningsThisMonth={stats.earningsThisMonth}
              isLoading={isLoading}
            />
          </div>

          <ReadyToAssignSection
            projects={readyToAssign}
            isLoading={isLoading}
            onRefresh={refetchProjects}
            onAssign={handleAssign}
          />

          <Card className="border border-[#E7DED0] bg-gradient-to-br from-[#FFF5E8] via-[#FDF1E2] to-[#F3EBDD]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#122022]">Quick Actions</CardTitle>
              <CardDescription className="text-sm text-[#6B7B78]">
                Jump to the areas you use most.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="justify-start gap-2 border-[#E7DED0] bg-white/80 text-[#0F4C4A] hover:bg-[#E7F2EF]"
                  asChild
                >
                  <Link href={action.href}>
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
