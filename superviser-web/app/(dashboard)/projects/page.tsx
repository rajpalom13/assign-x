/**
 * @fileoverview Projects management page with tabs for ongoing, review, and completed projects with filtering and QC review.
 * @module app/(dashboard)/projects/page
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  FileSearch,
  SlidersHorizontal,
  FolderKanban,
} from "lucide-react"
import { useProjectsByStatus, useSupervisor } from "@/hooks"
import type { ProjectWithRelations } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  OngoingProjectCard,
  ForReviewCard,
  CompletedProjectCard,
  QCReviewModal,
  type ActiveProject,
} from "@/components/projects"

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

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("ongoing")
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
      // Update project status to qc_approved
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
      // Get current revision count for this project
      const { count: revisionCount, error: countError } = await supabase
        .from("project_revisions")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)

      if (countError) throw countError

      const newRevisionNumber = (revisionCount || 0) + 1

      // Create revision request
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

      // Update project status to qc_rejected
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

  // File preview handler - opens file in new tab
  const handlePreviewFile = useCallback((file: { url?: string; name?: string }) => {
    if (!file.url) {
      toast.error("File URL not available")
      return
    }
    window.open(file.url, "_blank", "noopener,noreferrer")
  }, [])

  // File download handler
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

  // QC run handler - triggers plagiarism/AI check
  const handleRunQC = useCallback(async (projectId: string) => {
    toast.info("Running quality checks...")

    // In a real implementation, this would call an API to run plagiarism/AI checks
    // For now, we show a message that the feature requires API integration
    setTimeout(() => {
      toast.warning("QC checks require external API integration (Plagiarism/AI detection services)")
    }, 1500)
  }, [])

  const LoadingCard = () => (
    <div className="p-6 rounded-xl border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all project activities
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {forReviewProjects.length > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1.5">
              <FileSearch className="h-3.5 w-3.5" />
              {forReviewProjects.length} awaiting review
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients, or experts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
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
              <Button variant="outline" size="icon" className="rounded-xl">
                <SlidersHorizontal className="h-4 w-4" />
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid rounded-xl p-1">
          <TabsTrigger value="ongoing" className="gap-2 rounded-lg">
            <Clock className="h-4 w-4" />
            On Going
            {ongoingProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {ongoingProjects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2 rounded-lg">
            <FileSearch className="h-4 w-4" />
            For Review
            {forReviewProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {forReviewProjects.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            {completedProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {completedProjects.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* On Going Tab */}
        <TabsContent value="ongoing" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
            </div>
          ) : ongoingProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No ongoing projects</h3>
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
        </TabsContent>

        {/* For Review Tab */}
        <TabsContent value="review" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
            </div>
          ) : forReviewProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileSearch className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No projects for review</h3>
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
                  files={[]} // Would fetch from attachments
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
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
            </div>
          ) : completedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No completed projects</h3>
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
        </TabsContent>
      </Tabs>

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
