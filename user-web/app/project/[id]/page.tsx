import { notFound, redirect } from "next/navigation";
import { getProjectById } from "@/lib/actions/data";
import { getUser } from "@/lib/actions/auth";
import { ProjectDetailClient } from "./project-detail-client";
import type { ProjectDetail } from "@/types/project";
import type { ProjectStatus } from "@/types/project";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Transform database project to component-friendly format
 */
function transformProjectToDetail(dbProject: Awaited<ReturnType<typeof getProjectById>>): ProjectDetail | null {
  if (!dbProject) return null;

  // Map database status to component status
  const status = dbProject.status as ProjectStatus;

  return {
    id: dbProject.id,
    projectNumber: dbProject.project_number,
    title: dbProject.title,
    subjectId: dbProject.subject_id || "",
    subjectName: dbProject.subject?.name || "Unknown Subject",
    subjectIcon: dbProject.subject?.icon || "BookOpen",
    status,
    progress: dbProject.progress_percentage || 0,
    deadline: dbProject.deadline,
    createdAt: dbProject.created_at,
    wordCount: dbProject.word_count || undefined,
    referenceStyle: dbProject.reference_style?.name,
    quoteAmount: dbProject.final_quote || dbProject.user_quote || undefined,
    deliveredAt: dbProject.delivered_at || undefined,
    completedAt: dbProject.completed_at || undefined,
    cancelledAt: dbProject.cancelled_at || undefined,
    instructions: dbProject.specific_instructions || "",
    budget: dbProject.user_quote ? `₹${dbProject.user_quote}` : undefined,
    liveDocUrl: dbProject.live_document_url || undefined,
    supervisorName: undefined, // Will be fetched from chat room participants
    unreadMessages: 0, // Will be calculated from chat messages
    attachedFiles: (dbProject.files || []).map((file: {
      id: string;
      file_name: string;
      file_size_bytes?: number | null;
      file_type?: string | null;
      created_at?: string | null;
    }) => ({
      id: file.id,
      name: file.file_name,
      size: formatFileSize(file.file_size_bytes || 0),
      type: getFileType(file.file_type || ""),
      uploadedAt: file.created_at || "",
    })),
    deliverables: (dbProject.deliverables || []).map((del: {
      id: string;
      file_name: string;
      file_size_bytes?: number | null;
      version?: number | null;
      created_at?: string | null;
      is_final?: boolean | null;
    }) => ({
      id: del.id,
      name: del.file_name,
      size: formatFileSize(del.file_size_bytes || 0),
      version: del.version || 1,
      uploadedAt: del.created_at || "",
      isFinal: del.is_final || false,
    })),
    qualityReports: [
      {
        type: "ai" as const,
        status: dbProject.ai_score !== null ? "passed" : "locked",
        score: dbProject.ai_score || undefined,
        reportUrl: dbProject.ai_report_url || undefined,
      },
      {
        type: "plagiarism" as const,
        status: dbProject.plagiarism_score !== null ? "passed" : "locked",
        score: dbProject.plagiarism_score || undefined,
        reportUrl: dbProject.plagiarism_report_url || undefined,
      },
    ],
    chatMessages: [], // Will be fetched separately from chat_messages table
  };
}

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file type from mime type or extension
 */
function getFileType(mimeType: string): "pdf" | "doc" | "docx" | "image" {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("docx")) return "docx";
  if (mimeType.includes("doc")) return "doc";
  if (mimeType.includes("image")) return "image";
  return "doc";
}

/**
 * Project Detail Page - Server Component
 * Fetches project data from Supabase and renders client components
 */
export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  // Get current user - redirect to login if not authenticated
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch project from database
  const dbProject = await getProjectById(id);

  // Transform to component-friendly format
  const project = transformProjectToDetail(dbProject);

  // 404 if project not found
  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} userId={user.id} />;
}
