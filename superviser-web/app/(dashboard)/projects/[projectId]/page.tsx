/**
 * @fileoverview Individual project detail page showing full project information, timeline, participants, and QC interface.
 * @module app/(dashboard)/projects/[projectId]/page
 */

"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  User,
  UserCircle,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QCReviewModal } from "@/components/projects"
import { AnalyzeQuoteModal } from "@/components/dashboard/analyze-quote-modal"
import type { ProjectRequest } from "@/components/dashboard/request-card"

// Import the useProject hook
import { useProject } from "@/hooks/use-projects"
import type { ProjectWithRelations } from "@/types/database"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { project, isLoading, error, refetch } = useProject(projectId)

  const [qcModalState, setQcModalState] = useState<{
    open: boolean
    mode: "approve" | "reject" | null
  }>({ open: false, mode: null })

  const [quoteModalOpen, setQuoteModalOpen] = useState(false)

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
      setQcModalState({ open: false, mode: null })
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

    try {
      // Get current revision count
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
          requested_by: project?.supervisor_id || "",
          requested_by_type: "supervisor",
          feedback,
          status: "pending",
          severity,
        })

      if (revisionError) throw revisionError

      // Update project status
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
      setQcModalState({ open: false, mode: null })
      await refetch()
    } catch (err) {
      console.error("Failed to reject project:", err)
      toast.error("Failed to request revision. Please try again.")
    }
  }, [project, refetch])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-700",
      analyzing: "bg-purple-100 text-purple-700",
      quoted: "bg-indigo-100 text-indigo-700",
      paid: "bg-green-100 text-green-700",
      assigned: "bg-cyan-100 text-cyan-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      submitted_for_qc: "bg-orange-100 text-orange-700",
      qc_approved: "bg-emerald-100 text-emerald-700",
      qc_rejected: "bg-red-100 text-red-700",
      completed: "bg-green-100 text-green-700",
    }
    return statusColors[status] || "bg-gray-100 text-gray-700"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Project Not Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {error?.message || "The project you're looking for doesn't exist or you don't have access to it."}
        </p>
        <Button onClick={() => router.push("/projects")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    )
  }

  const showQCActions = project.status === "submitted_for_qc" || project.status === "qc_in_progress"

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Project #{project.project_number}
          </p>
        </div>
        {showQCActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setQcModalState({ open: true, mode: "reject" })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            <Button
              onClick={() => setQcModalState({ open: true, mode: "approve" })}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Project
            </Button>
          </div>
        )}
      </div>

      {/* Key Information Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              href={`/users/${project.user_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={project.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {project.profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.profiles?.full_name || "Unknown User"}</p>
                <p className="text-xs text-muted-foreground">
                  {project.profiles?.email || "No email"}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {project.doer_id && project.doers ? (
              <Link
                href={`/doers/${project.doer_id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={project.doers.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {project.doers.profiles?.full_name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.doers.profiles?.full_name || "Unknown Doer"}</p>
                  <p className="text-xs text-muted-foreground">
                    Rating: {project.doers.average_rating?.toFixed(1) || "N/A"} ⭐
                  </p>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financials</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quote:</span>
              <span className="font-medium">₹{project.user_quote || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Commission:</span>
              <span className="font-medium text-green-600">₹{project.supervisor_commission || 0}</span>
            </div>
            {project.status === "analyzing" && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => setQuoteModalOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Set Quote
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="text-sm">{project.subjects?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                  <p className="text-sm">{project.service_type?.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                  <p className="text-sm">{project.word_count || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Count</p>
                  <p className="text-sm">{project.page_count || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                  <p className="text-sm">{formatDate(project.deadline)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(project.created_at)}</p>
                </div>
              </div>

              {project.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{project.description}</p>
                  </div>
                </>
              )}

              {project.specific_instructions && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Special Instructions</p>
                    <p className="text-sm whitespace-pre-wrap">{project.specific_instructions}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Track the progress of this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <TimelineItem
                  icon={<Calendar className="h-4 w-4" />}
                  title="Project Created"
                  timestamp={formatDate(project.created_at)}
                  status="completed"
                />
                {project.doer_assigned_at && (
                  <TimelineItem
                    icon={<UserCircle className="h-4 w-4" />}
                    title="Expert Assigned"
                    timestamp={formatDate(project.doer_assigned_at)}
                    status="completed"
                  />
                )}
                {project.status_updated_at && (
                  <TimelineItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    title={`Status: ${project.status.replace(/_/g, " ")}`}
                    timestamp={formatDate(project.status_updated_at)}
                    status="current"
                  />
                )}
                {project.deadline && (
                  <TimelineItem
                    icon={<Clock className="h-4 w-4" />}
                    title="Deadline"
                    timestamp={formatDate(project.deadline)}
                    status={new Date(project.deadline) < new Date() ? "overdue" : "upcoming"}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Messages and updates for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Chat functionality will be integrated here
                </p>
                <Button variant="outline" className="mt-4" disabled>
                  Start Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QC Review Modal */}
      <QCReviewModal
        project={project ? {
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
        } : null}
        mode={qcModalState.mode}
        open={qcModalState.open}
        onOpenChange={(open) =>
          setQcModalState({ ...qcModalState, open, mode: open ? qcModalState.mode : null })
        }
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Quote Modal */}
      <AnalyzeQuoteModal
        request={project ? {
          id: project.id,
          project_number: project.project_number,
          title: project.title,
          subject: project.subjects?.name || "General",
          service_type: project.service_type,
          user_name: project.profiles?.full_name || "Unknown User",
          deadline: project.deadline || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          word_count: project.word_count ?? undefined,
          page_count: project.page_count ?? undefined,
          created_at: project.created_at || new Date().toISOString(),
        } : null}
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onQuoteSubmit={async () => {
          setQuoteModalOpen(false)
          await refetch()
        }}
      />
    </div>
  )
}

interface TimelineItemProps {
  icon: React.ReactNode
  title: string
  timestamp: string
  status: "completed" | "current" | "upcoming" | "overdue"
}

function TimelineItem({ icon, title, timestamp, status }: TimelineItemProps) {
  const statusColors = {
    completed: "border-green-500 bg-green-50",
    current: "border-blue-500 bg-blue-50",
    upcoming: "border-gray-300 bg-gray-50",
    overdue: "border-red-500 bg-red-50",
  }

  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${statusColors[status]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  )
}
