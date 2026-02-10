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
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />
          <div className="absolute top-40 left-10 h-56 w-56 rounded-full bg-amber-100/50 blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">
          {/* Header with Back Button */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/projects")}
                className="rounded-full hover:bg-orange-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <h2 className="text-3xl font-bold tracking-tight text-[#1C1C1C]">{project.title}</h2>
                  <Badge className={`${getStatusColor(project.status)} text-xs font-medium px-3 py-1`}>
                    {project.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2 font-mono">
                  Project #{project.project_number}
                </p>
              </div>
              {showQCActions && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setQcModalState({ open: true, mode: "reject" })}
                    className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    onClick={() => setQcModalState({ open: true, mode: "approve" })}
                    className="rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Project
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Key Information Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Client Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-[#1C1C1C]">Client</h3>
              </div>
              <Link
                href={`/users/${project.user_id}`}
                className="flex items-center gap-3 group"
              >
                <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                  <AvatarImage src={project.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                    {project.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C1C] group-hover:text-[#F97316] transition-colors truncate">
                    {project.profiles?.full_name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {project.profiles?.email || "No email"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Expert Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-[#1C1C1C]">Expert</h3>
              </div>
              {project.doer_id && project.doers ? (
                <Link
                  href={`/doers/${project.doer_id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                    <AvatarImage src={project.doers.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold">
                      {project.doers.profiles?.full_name?.charAt(0) || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1C1C1C] group-hover:text-[#F97316] transition-colors truncate">
                      {project.doers.profiles?.full_name || "Unknown Doer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rating: {project.doers.average_rating?.toFixed(1) || "N/A"} ⭐
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-gray-500">Not assigned yet</p>
              )}
            </div>

            {/* Financials Card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#F97316]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1C1C1C]">Financials</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quote:</span>
                  <span className="text-lg font-bold text-[#1C1C1C]">₹{project.user_quote || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your Commission:</span>
                  <span className="text-lg font-bold text-green-600">₹{project.supervisor_commission || 0}</span>
                </div>
                {project.status === "analyzing" && (
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl shadow-lg"
                    onClick={() => setQuoteModalOpen(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Set Quote
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg"
              >
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="data-[state=active]:bg-[#F97316] data-[state=active]:text-white rounded-lg"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Communication
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-6">Project Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Subject</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{project.subjects?.name || "General"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Service Type</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{project.service_type?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Word Count</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{project.word_count || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Page Count</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{project.page_count || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Deadline</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{formatDate(project.deadline)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Created</p>
                    <p className="text-base font-semibold text-[#1C1C1C]">{formatDate(project.created_at)}</p>
                  </div>
                </div>

                {project.description && (
                  <>
                    <div className="my-6 border-t border-gray-200" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-3">Description</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                    </div>
                  </>
                )}

                {project.specific_instructions && (
                  <>
                    <div className="my-6 border-t border-gray-200" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-3">Special Instructions</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{project.specific_instructions}</p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">Project Timeline</h3>
                <p className="text-sm text-gray-500 mb-6">Track the progress of this project</p>
                <div className="space-y-4">
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
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">Communication</h3>
                <p className="text-sm text-gray-500 mb-6">Messages and updates for this project</p>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-[#F97316]" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Chat functionality coming soon
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll be able to communicate with clients and experts here
                  </p>
                  <Button variant="outline" className="mt-6 rounded-full border-gray-200" disabled>
                    Start Conversation
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
    completed: "border-green-500 bg-green-50 text-green-600",
    current: "border-orange-500 bg-orange-50 text-[#F97316]",
    upcoming: "border-gray-300 bg-gray-50 text-gray-600",
    overdue: "border-red-500 bg-red-50 text-red-600",
  }

  return (
    <div className="flex gap-4 items-start">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${statusColors[status]} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p className="font-semibold text-sm text-[#1C1C1C]">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
      </div>
    </div>
  )
}
