"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  FileSearch,
  SlidersHorizontal,
  FolderKanban,
  Plus,
  Download,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  MoreHorizontal,
  Eye,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useProjectsByStatus, useSupervisor, claimProject } from "@/hooks"
import { useRouter } from "next/navigation"
import type { ProjectWithRelations } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import {
  OngoingProjectCard,
  ForReviewCard,
  CompletedProjectCard,
  QCReviewModal,
  type ActiveProject,
} from "@/components/projects"
import { STATUS_CONFIG } from "@/components/projects/types"
import { cn } from "@/lib/utils"

const SUBJECTS = [
  "All Subjects",
  "Computer Science",
  "Business Administration",
  "Environmental Science",
  "Finance",
  "Psychology",
  "Marketing",
  "Nursing",
]

// Mini Stat Card Component
interface MiniStatCardProps {
  icon: React.ElementType
  value: number
  label: string
  color?: "default" | "amber" | "sage" | "blue"
  delay?: number
}

function MiniStatCard({ icon: Icon, value, label, color = "default", delay = 0 }: MiniStatCardProps) {
  const colorStyles = {
    default: { bg: "bg-gray-50", border: "border-gray-100", icon: "text-gray-500" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600" },
    sage: { bg: "bg-[var(--color-sage)]/10", border: "border-[var(--color-sage)]/20", icon: "text-[var(--color-sage)]" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600" },
  }
  const styles = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", styles.bg, styles.border)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Project Card Component for the new grid design
interface ProjectCardProps {
  project: ActiveProject
  variant: "ongoing" | "review" | "completed"
  onApprove?: () => void
  onReject?: () => void
}

function ProjectCard({ project, variant, onApprove, onReject }: ProjectCardProps) {
  const statusConfig = STATUS_CONFIG[project.status]
  const deadlineDate = new Date(project.deadline)
  const isOverdue = deadlineDate < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="p-5 space-y-4">
        {/* Header: Project Number & Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{project.project_number}</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <span className="text-sm font-semibold text-[var(--color-sage)]">
            ${project.quoted_amount.toLocaleString()}
          </span>
        </div>

        {/* Title & Subject */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-[var(--color-sage)] transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">{project.subject}</p>
        </div>

        {/* Doer & Deadline */}
        <div className="flex items-center justify-between py-3 border-y border-border/30">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] text-xs">
                {project.doer_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">{project.doer_name || "Unassigned"}</span>
          </div>
          <div className={cn("flex items-center gap-1.5 text-sm", isOverdue ? "text-red-500" : "text-muted-foreground")}>
            <Clock className="w-4 h-4" />
            <span>{format(deadlineDate, "MMM d")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9" asChild>
            <Link href={`/projects/${project.id}`}>
              <Eye className="w-4 h-4 mr-1.5" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg h-9 px-3">
            <MessageSquare className="w-4 h-4" />
          </Button>
          {variant === "review" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={onApprove}
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onReject}
              >
                <AlertCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-lg h-9 px-3">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Message Client</DropdownMenuItem>
              <DropdownMenuItem>Message Doer</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Cancel Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}

// Loading Card Component
function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between py-3 border-y border-border/30">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All Subjects")
  const [sortBy, setSortBy] = useState<"deadline" | "created" | "amount">("deadline")
  const [qcModalState, setQcModalState] = useState<{
    open: boolean
    project: ActiveProject | null
    mode: "approve" | "reject" | null
  }>({ open: false, project: null, mode: null })

  // Use real data hooks
  const {
    needsQuote,
    readyToAssign,
    inProgress,
    needsQC,
    completed,
    isLoading,
    refetch
  } = useProjectsByStatus()
  const { supervisor } = useSupervisor()

  // Transform projects to component format
  const transformToActiveProject = (project: ProjectWithRelations): ActiveProject => ({
    id: project.id,
    project_number: project.project_number,
    title: project.title,
    subject: project.subjects?.name || "General",
    service_type: project.service_type,
    status: project.status,
    user_name: project.profiles?.full_name || "Unknown User",
    user_id: project.user_id,
    doer_name: project.doers?.profiles?.full_name || "Unassigned",
    doer_id: project.doer_id || "",
    deadline: project.deadline || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    word_count: project.word_count ?? undefined,
    page_count: project.page_count ?? undefined,
    quoted_amount: project.user_quote || 0,
    doer_payout: project.doer_payout || 0,
    supervisor_commission: project.supervisor_commission || 0,
    assigned_at: project.doer_assigned_at ?? undefined,
    submitted_for_qc_at: project.status_updated_at ?? undefined,
    delivered_at: project.delivered_at ?? undefined,
    completed_at: project.completed_at ?? undefined,
    created_at: project.created_at || new Date().toISOString(),
    revision_count: 0,
    has_unread_messages: false,
  })

  // Calculate stats
  const totalProjects = inProgress.length + needsQC.length + completed.length
  const completedThisMonth = completed.filter(p => {
    const completedDate = p.completed_at ? new Date(p.completed_at) : null
    if (!completedDate) return false
    const now = new Date()
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear()
  }).length

  // Filter function
  const filterProjects = (projects: ActiveProject[]) => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.doer_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSubject =
        selectedSubject === "All Subjects" || project.subject === selectedSubject

      return matchesSearch && matchesSubject
    })
  }

  // Sort function
  const sortProjects = (projects: ActiveProject[]) => {
    return [...projects].sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "amount":
          return b.quoted_amount - a.quoted_amount
        default:
          return 0
      }
    })
  }

  const ongoingProjects = useMemo(() => {
    const transformed = inProgress.map(transformToActiveProject)
    return sortProjects(filterProjects(transformed))
  }, [inProgress, searchQuery, selectedSubject, sortBy])

  const forReviewProjects = useMemo(() => {
    const transformed = needsQC.map(transformToActiveProject)
    return sortProjects(filterProjects(transformed))
  }, [needsQC, searchQuery, selectedSubject, sortBy])

  const completedProjects = useMemo(() => {
    const transformed = completed.map(transformToActiveProject)
    return sortProjects(filterProjects(transformed))
  }, [completed, searchQuery, selectedSubject, sortBy])

  const handleApprove = useCallback(async (projectId: string, message?: string) => {
    const supabase = createClient()
    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "qc_approved",
          status_updated_at: new Date().toISOString(),
          completion_notes: message || null,
        })
        .eq("id", projectId)

      if (updateError) throw updateError
      toast.success("Project approved successfully")
      setQcModalState({ open: false, project: null, mode: null })
      await refetch()
    } catch (err) {
      console.error("Failed to approve project:", err)
      toast.error("Failed to approve project. Please try again.")
    }
  }, [refetch])

  const handleReject = useCallback(async (
    projectId: string,
    feedback: string,
    severity: "minor" | "major" | "critical"
  ) => {
    const supabase = createClient()
    if (!supervisor?.id) {
      toast.error("Supervisor data not found")
      return
    }
    try {
      const { count: revisionCount, error: countError } = await supabase
        .from("project_revisions")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)

      if (countError) throw countError
      const newRevisionNumber = (revisionCount || 0) + 1

      const { error: revisionError } = await supabase
        .from("project_revisions")
        .insert({
          project_id: projectId,
          revision_number: newRevisionNumber,
          requested_by: supervisor.profile_id,
          requested_by_type: "supervisor",
          feedback,
          status: "pending",
          severity,
        })

      if (revisionError) throw revisionError

      const { error: projectError } = await supabase
        .from("projects")
        .update({
          status: "qc_rejected",
          status_updated_at: new Date().toISOString(),
          revision_count: newRevisionNumber,
        })
        .eq("id", projectId)

      if (projectError) throw projectError
      toast.success("Revision requested successfully")
      setQcModalState({ open: false, project: null, mode: null })
      await refetch()
    } catch (err) {
      console.error("Failed to reject project:", err)
      toast.error("Failed to request revision. Please try again.")
    }
  }, [supervisor, refetch])

  const openQCModal = (project: ActiveProject, mode: "approve" | "reject") => {
    setQcModalState({ open: true, project, mode })
  }

  const handlePreviewFile = useCallback((file: { url?: string; name?: string }) => {
    if (!file.url) {
      toast.error("File URL not available")
      return
    }
    window.open(file.url, "_blank", "noopener,noreferrer")
  }, [])

  const handleDownloadFile = useCallback(async (file: { url?: string; name?: string }) => {
    if (!file.url) {
      toast.error("File URL not available")
      return
    }
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name || "download"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("File downloaded successfully")
    } catch (error) {
      console.error("Failed to download file:", error)
      toast.error("Failed to download file. Please try again.")
    }
  }, [])

  const handleRunQC = useCallback(async (projectId: string) => {
    toast.info("Running quality checks...")
    setTimeout(() => {
      toast.warning("QC checks require external API integration")
    }, 1500)
  }, [])

  const router = useRouter()

  // Get new requests (unassigned projects) from useProjectsByStatus
  const newRequestsProjects = useMemo(() => {
    return needsQuote.map(transformToActiveProject)
  }, [needsQuote])

  // Get ready to assign projects
  const readyToAssignProjects = useMemo(() => {
    return readyToAssign.map(transformToActiveProject)
  }, [readyToAssign])

  // Handle claiming a new request
  const handleClaimProject = useCallback(async (projectId: string) => {
    try {
      await claimProject(projectId)
      toast.success("Project claimed successfully!")
      await refetch()
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Failed to claim project:", error)
      toast.error("Failed to claim project. It may have been claimed by another supervisor.")
      await refetch()
    }
  }, [refetch, router])

  const tabs = [
    { id: "new", label: "New Requests", count: newRequestsProjects.length, badgeColor: newRequestsProjects.length > 0 ? "bg-emerald-100 text-emerald-700" : undefined },
    { id: "assign", label: "Ready to Assign", count: readyToAssignProjects.length, badgeColor: readyToAssignProjects.length > 0 ? "bg-blue-100 text-blue-700" : undefined },
    { id: "ongoing", label: "Ongoing", count: ongoingProjects.length },
    { id: "review", label: "For Review", count: forReviewProjects.length, badgeColor: forReviewProjects.length > 0 ? "bg-amber-100 text-amber-700" : undefined },
    { id: "completed", label: "Completed", count: completedProjects.length },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Premium gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[#f5f2ed] to-[#edf1e8]" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--color-sage)]/[0.15] via-[var(--color-sage)]/[0.08] to-transparent rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--color-terracotta)]/[0.08] via-transparent to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-900/[0.05] border border-white/70 overflow-hidden"
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-sage)]/10 via-[var(--color-sage)]/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--color-sage)]/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left: Title and description */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-sage)]/20 to-[var(--color-sage)]/10 flex items-center justify-center border border-[var(--color-sage)]/20">
                    <FolderKanban className="h-5 w-5 text-[var(--color-sage)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Projects
                    </h1>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Manage and track all project activities across ongoing, review, and completed stages
                </p>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-3">
                {/* Stats badges */}
                <div className="hidden md:flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] border-[var(--color-sage)]/20">
                    <LayoutGrid className="h-3 w-3 mr-1" />
                    {ongoingProjects.length} Active
                  </Badge>
                  {forReviewProjects.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                      <FileSearch className="h-3 w-3 mr-1" />
                      {forReviewProjects.length} For Review
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {completedProjects.length} Completed
                  </Badge>
                </div>

                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="rounded-xl gap-2 bg-[var(--color-sage)] hover:bg-[var(--color-sage-hover)]">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <MiniStatCard
            icon={LayoutGrid}
            value={totalProjects}
            label="Total Projects"
            color="sage"
            delay={0}
          />
          <MiniStatCard
            icon={Clock}
            value={inProgress.length}
            label="In Progress"
            color="blue"
            delay={100}
          />
          <MiniStatCard
            icon={FileSearch}
            value={needsQC.length}
            label="For Review"
            color={needsQC.length > 0 ? "amber" : "default"}
            delay={200}
          />
          <MiniStatCard
            icon={CheckCircle2}
            value={completedThisMonth}
            label="Completed This Month"
            color="sage"
            delay={300}
          />
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/70 p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, clients, or experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-white border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[160px] rounded-xl bg-white border-border/50">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2 bg-white border-border/50">
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={sortBy === "deadline"}
                    onCheckedChange={() => setSortBy("deadline")}
                  >
                    Deadline (Nearest)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortBy === "created"}
                    onCheckedChange={() => setSortBy("created")}
                  >
                    Recently Created
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortBy === "amount"}
                    onCheckedChange={() => setSortBy("amount")}
                  >
                    Highest Value
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Animated Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/70 overflow-hidden"
        >
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            layoutId="projectsTabIndicator"
          />

          {/* Tab Content */}
          <div className="p-6">
            {/* New Requests Tab */}
            {activeTab === "new" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
                  </div>
                ) : newRequestsProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No new requests</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      New project requests will appear here for you to claim
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {newRequestsProjects.map((project) => (
                      <Card key={project.id} className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">{project.project_number}</span>
                              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                New
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">{project.subject}</p>
                          </div>
                          <div className="flex items-center justify-between py-3 border-y border-border/30">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] text-xs">
                                  {project.user_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">{project.user_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{project.deadline ? format(new Date(project.deadline), "MMM d") : "No deadline"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1 rounded-lg h-9 bg-[var(--color-sage)] hover:bg-[var(--color-sage-hover)]"
                              onClick={() => handleClaimProject(project.id)}
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Claim & Analyze
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Ready to Assign Tab */}
            {activeTab === "assign" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
                  </div>
                ) : readyToAssignProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
                      <TrendingUp className="h-10 w-10 text-blue-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No projects to assign</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Paid projects waiting for doer assignment will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {readyToAssignProjects.map((project) => (
                      <Card key={project.id} className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">{project.project_number}</span>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Paid
                              </Badge>
                            </div>
                            <span className="text-sm font-semibold text-[var(--color-sage)]">
                              ₹{project.quoted_amount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">{project.subject}</p>
                          </div>
                          <div className="flex items-center justify-between py-3 border-y border-border/30">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] text-xs">
                                  {project.user_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">{project.user_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{project.deadline ? format(new Date(project.deadline), "MMM d") : "No deadline"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9" asChild>
                              <Link href={`/projects/${project.id}`}>
                                <Eye className="w-4 h-4 mr-1.5" />
                                View & Assign Doer
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Ongoing Tab */}
            {activeTab === "ongoing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
                  </div>
                ) : ongoingProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--color-sage)]/10 to-[var(--color-sage)]/5 flex items-center justify-center mb-4">
                      <Clock className="h-10 w-10 text-[var(--color-sage)]/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No ongoing projects</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery || selectedSubject !== "All Subjects"
                        ? "Try adjusting your filters"
                        : "Projects will appear here once assigned to experts"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {ongoingProjects.map((project) => (
                      <OngoingProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* For Review Tab */}
            {activeTab === "review" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
                  </div>
                ) : forReviewProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mb-4">
                      <FileSearch className="h-10 w-10 text-amber-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No projects for review</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery || selectedSubject !== "All Subjects"
                        ? "Try adjusting your filters"
                        : "Projects awaiting QC will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {forReviewProjects.map((project) => (
                      <ForReviewCard
                        key={project.id}
                        project={project}
                        files={[]}
                        qcReport={undefined}
                        onApprove={() => openQCModal(project, "approve")}
                        onReject={() => openQCModal(project, "reject")}
                        onPreviewFile={handlePreviewFile}
                        onDownloadFile={handleDownloadFile}
                        onRunQC={handleRunQC}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Completed Tab */}
            {activeTab === "completed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
                  </div>
                ) : completedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No completed projects</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      {searchQuery || selectedSubject !== "All Subjects"
                        ? "Try adjusting your filters"
                        : "Completed projects will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {completedProjects.map((project) => (
                      <CompletedProjectCard
                        key={project.id}
                        project={project}
                        rating={(project as ActiveProject & { rating?: number }).rating || 0}
                        feedback={(project as ActiveProject & { feedback?: string }).feedback || undefined}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* QC Review Modal */}
      <QCReviewModal
        project={qcModalState.project}
        mode={qcModalState.mode}
        open={qcModalState.open}
        onOpenChange={(open) =>
          setQcModalState({ ...qcModalState, open, mode: open ? qcModalState.mode : null })
        }
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
