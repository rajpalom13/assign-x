/**
 * @fileoverview Custom hooks for project data management.
 * @module hooks/use-projects
 */

"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Project,
  ProjectWithRelations,
  ProjectStatus
} from "@/types/database"

interface UseProjectsOptions {
  status?: ProjectStatus | ProjectStatus[]
  limit?: number
  offset?: number
}

interface UseProjectsReturn {
  projects: ProjectWithRelations[]
  isLoading: boolean
  error: Error | null
  totalCount: number
  refetch: () => Promise<void>
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { status, limit = 50, offset = 0 } = options
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchProjects = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get supervisor ID
      const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("profile_id", user.id)
        .single()

      if (!supervisor) {
        setProjects([])
        return
      }

      // Build query
      let query = supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_user_id_fkey (*),
          subjects (*),
          doers (
            *,
            profiles!profile_id (*)
          )
        `, { count: "exact" })
        .eq("supervisor_id", supervisor.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      // Filter by status
      if (status) {
        if (Array.isArray(status)) {
          query = query.in("status", status)
        } else {
          query = query.eq("status", status)
        }
      }

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      // Transform null to undefined for type compatibility
      const transformedData = (data || []).map(project => ({
        ...project,
        profiles: project.profiles || undefined,
        subjects: project.subjects || undefined,
        doers: project.doers ? {
          ...project.doers,
          profiles: project.doers.profiles || undefined,
        } : undefined,
      })) as ProjectWithRelations[]

      setProjects(transformedData)
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch projects"))
    } finally {
      setIsLoading(false)
    }
  }, [status, limit, offset])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    totalCount,
    refetch: fetchProjects,
  }
}

interface UseProjectReturn {
  project: ProjectWithRelations | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateProject: (data: Partial<Project>) => Promise<void>
  updateStatus: (status: ProjectStatus) => Promise<void>
  assignDoer: (doerId: string) => Promise<void>
  submitQuote: (quote: number, doerPayout: number) => Promise<void>
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) return

    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from("projects")
        .select(`
          *,
          profiles!projects_user_id_fkey (*),
          subjects (*),
          doers (
            *,
            profiles!profile_id (*)
          ),
          supervisors (
            *,
            profiles!profile_id (*)
          )
        `)
        .eq("id", projectId)
        .single()

      if (queryError) throw queryError

      // Transform null to undefined for type compatibility
      const transformedProject = data ? {
        ...data,
        profiles: data.profiles || undefined,
        subjects: data.subjects || undefined,
        doers: data.doers ? {
          ...data.doers,
          profiles: data.doers.profiles || undefined,
        } : undefined,
        supervisors: data.supervisors ? {
          ...data.supervisors,
          profiles: data.supervisors.profiles || undefined,
        } : undefined,
      } : null

      setProject(transformedProject as ProjectWithRelations | null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch project"))
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  const updateProject = useCallback(async (data: Partial<Project>) => {
    if (!projectId) return

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("projects")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", projectId)

    if (updateError) throw updateError
    await fetchProject()
  }, [projectId, fetchProject])

  const updateStatus = useCallback(async (status: ProjectStatus) => {
    await updateProject({ status })
  }, [updateProject])

  const assignDoer = useCallback(async (doerId: string) => {
    await updateProject({ doer_id: doerId, status: "assigned" })
  }, [updateProject])

  const submitQuote = useCallback(async (quote: number, doerPayout: number) => {
    const platformFee = quote * 0.20 // 20% platform fee
    const supervisorCommission = quote * 0.15 // 15% supervisor commission

    await updateProject({
      user_quote: quote,
      doer_payout: doerPayout,
      supervisor_commission: supervisorCommission,
      platform_fee: platformFee,
      status: "quoted",
      status_updated_at: new Date().toISOString(),
    })
  }, [updateProject])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
    updateProject,
    updateStatus,
    assignDoer,
    submitQuote,
  }
}

// Project status groups for filtering
export const PROJECT_STATUS_GROUPS = {
  needsQuote: ["submitted", "analyzing"] as ProjectStatus[],
  readyToAssign: ["paid"] as ProjectStatus[],
  inProgress: [
    "assigned",
    "in_progress",
    "submitted_for_qc",
    "qc_in_progress",
    "revision_requested",
    "in_revision"
  ] as ProjectStatus[],
  needsQC: ["submitted_for_qc"] as ProjectStatus[],
  completed: ["completed", "auto_approved", "delivered"] as ProjectStatus[],
  cancelled: ["cancelled", "refunded"] as ProjectStatus[],
}

export function useProjectsByStatus() {
  const { projects: allProjects, isLoading, error, refetch } = useProjects()

  const groupedProjects = useMemo(() => {
    return {
      needsQuote: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.needsQuote.includes(p.status as ProjectStatus)
      ),
      readyToAssign: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.readyToAssign.includes(p.status as ProjectStatus)
      ),
      inProgress: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.inProgress.includes(p.status as ProjectStatus)
      ),
      needsQC: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.needsQC.includes(p.status as ProjectStatus)
      ),
      completed: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.completed.includes(p.status as ProjectStatus)
      ),
      cancelled: allProjects.filter(p =>
        PROJECT_STATUS_GROUPS.cancelled.includes(p.status as ProjectStatus)
      ),
    }
  }, [allProjects])

  return {
    ...groupedProjects,
    allProjects,
    isLoading,
    error,
    refetch,
  }
}
