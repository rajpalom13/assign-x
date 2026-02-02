/**
 * @fileoverview Supervisor Dashboard - Light theme with warm colors.
 * Overview of projects, assignments, and performance.
 * @module app/(dashboard)/dashboard/page
 */

"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useProjectsByStatus, useSupervisorStats, useEarningsStats, useAuth, claimProject } from "@/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RequestCardV2, ProjectRequest } from "@/components/dashboard/request-card-v2"
import { ReadyToAssignCardV2, PaidProject } from "@/components/dashboard/ready-to-assign-card-v2"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface FilterState {
  myFieldOnly: boolean
  selectedFields: string[]
  urgentOnly: boolean
}

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const contentVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
}

type TabId = "requests" | "ready"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("requests")
  const [filters, setFilters] = useState<FilterState>({
    myFieldOnly: true,
    selectedFields: [],
    urgentOnly: false,
  })

  const { user } = useAuth()

  // Use real data hooks
  const {
    needsQuote,
    readyToAssign: readyToAssignProjects,
    inProgress,
    needsQC,
    completed,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useProjectsByStatus()

  const { stats: supervisorStats, isLoading: statsLoading } = useSupervisorStats()
  const { stats: earningsStats, isLoading: earningsLoading } = useEarningsStats()

  const isLoading = projectsLoading || statsLoading || earningsLoading

  // Transform projects to match component types
  const newRequests: ProjectRequest[] = useMemo(() => {
    return needsQuote.map((project) => ({
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
    return readyToAssignProjects.map((project) => ({
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

  // Calculate stats
  const stats = useMemo(
    () => ({
      activeProjects: supervisorStats?.activeProjects || inProgress.length,
      pendingReview: needsQC.length,
      completedThisMonth: supervisorStats?.completedProjects || completed.length,
      earningsThisMonth: earningsStats?.thisMonth || 0,
    }),
    [supervisorStats, earningsStats, inProgress.length, needsQC.length, completed.length]
  )

  const totalAttentionCount = newRequests.length + readyToAssign.length

  const tabs = [
    {
      id: "requests",
      label: "New Requests",
      count: newRequests.length,
      badgeColor: "bg-[var(--color-sage)]/10 text-[var(--color-sage)]",
    },
    {
      id: "ready",
      label: "Ready to Assign",
      count: readyToAssign.length,
      badgeColor: "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]",
    },
  ]

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const router = useRouter()

  const handleAnalyzeRequest = async (request: ProjectRequest) => {
    try {
      // Claim the project (assign to this supervisor)
      await claimProject(request.id)
      toast.success(`Project ${request.project_number} claimed successfully!`)
      // Refresh data
      await refetchProjects()
      // Navigate to project detail page for quoting
      router.push(`/projects/${request.id}`)
    } catch (error) {
      console.error("Failed to claim project:", error)
      toast.error("Failed to claim project. It may have been claimed by another supervisor.")
      await refetchProjects()
    }
  }

  const handleAssignProject = async (project: PaidProject) => {
    // Navigate to project detail to assign a doer
    router.push(`/projects/${project.id}`)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background p-4 lg:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <StatsGrid
            activeProjects={stats.activeProjects}
            pendingReview={stats.pendingReview}
            completedThisMonth={stats.completedThisMonth}
            earningsThisMonth={stats.earningsThisMonth}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Main Content Grid - Two Columns */}
        <div className="grid gap-6 lg:grid-cols-[60%_40%]">
          {/* Left Column - 60% - Requires Attention */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-border/50 rounded-2xl overflow-hidden shadow-none h-full">
              <CardHeader className="border-b border-border/50 pb-0">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold">
                      Requires Attention
                    </CardTitle>
                    {totalAttentionCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="rounded-full bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] border-0"
                      >
                        {totalAttentionCount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Animated Tabs */}
                <AnimatedTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={(tabId) => setActiveTab(tabId as TabId)}
                  layoutId="attention-tabs"
                />
              </CardHeader>
              
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {activeTab === "requests" ? (
                    <motion.div
                      key="requests"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="p-4 space-y-3"
                    >
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                          ))}
                        </div>
                      ) : newRequests.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-12 w-12 rounded-full bg-[var(--color-sage)]/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-6 w-6 text-[var(--color-sage)]" />
                          </div>
                          <p className="text-sm font-medium text-foreground">No new requests</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You&apos;re all caught up!
                          </p>
                        </div>
                      ) : (
                        <>
                          {newRequests.slice(0, 5).map((request) => (
                            <RequestCardV2
                              key={request.id}
                              request={request}
                              onAnalyze={handleAnalyzeRequest}
                              isLoading={isLoading}
                              variant="compact"
                            />
                          ))}
                          {newRequests.length > 5 && (
                            <Button
                              variant="ghost"
                              className="w-full text-[var(--color-sage)] hover:text-[var(--color-sage)]/80 hover:bg-[var(--color-sage)]/5 mt-2"
                              asChild
                            >
                              <Link href="/projects">
                                View all {newRequests.length} requests
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="p-4 space-y-3"
                    >
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                          ))}
                        </div>
                      ) : readyToAssign.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-12 w-12 rounded-full bg-[var(--color-sage)]/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-6 w-6 text-[var(--color-sage)]" />
                          </div>
                          <p className="text-sm font-medium text-foreground">No projects ready</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Projects will appear here after payment
                          </p>
                        </div>
                      ) : (
                        <>
                          {readyToAssign.slice(0, 5).map((project) => (
                            <ReadyToAssignCardV2
                              key={project.id}
                              project={project}
                              onAssign={handleAssignProject}
                              isLoading={isLoading}
                              variant="compact"
                            />
                          ))}
                          {readyToAssign.length > 5 && (
                            <Button
                              variant="ghost"
                              className="w-full text-[var(--color-sage)] hover:text-[var(--color-sage)]/80 hover:bg-[var(--color-sage)]/5 mt-2"
                              asChild
                            >
                              <Link href="/projects">
                                View all {readyToAssign.length} projects
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - 40% - Recent Activity + Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Recent Activity */}
            <RecentActivity
              runsCount={completed.length}
              promptsCount={newRequests.length}
              competitorsCount={readyToAssign.length}
              onViewAllClick={() => {}}
              onRunPromptsClick={() => {}}
            />

            {/* Quick Actions */}
            <QuickActions
              onCreatePromptClick={() => {}}
              onViewAnalyticsClick={() => {}}
              onManageTeamClick={() => {}}
              onUpgradePlanClick={() => {}}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
