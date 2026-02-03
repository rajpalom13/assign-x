/**
 * @fileoverview Custom hook for supervisor data and profile management.
 * @module hooks/use-supervisor
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  SupervisorWithProfile,
  Profile
} from "@/types/database"

interface UseSupervisorReturn {
  supervisor: SupervisorWithProfile | null
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateAvailability: (isAvailable: boolean) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export function useSupervisor(): UseSupervisorReturn {
  const [supervisor, setSupervisor] = useState<SupervisorWithProfile | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSupervisor = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      // Use getSession() - faster, no network timeout issues
      const { data: sessionData, error: authError } = await supabase.auth.getSession()
      if (authError) throw authError
      const user = sessionData?.session?.user
      if (!user) throw new Error("Not authenticated")

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Get supervisor data with profile
      const { data: supervisorData, error: supervisorError } = await supabase
        .from("supervisors")
        .select(`
          *,
          profiles!profile_id (*)
        `)
        .eq("profile_id", user.id)
        .single()

      if (supervisorError && supervisorError.code !== "PGRST116") {
        throw supervisorError
      }

      // Transform null to undefined for type compatibility
      const transformedSupervisor = supervisorData ? {
        ...supervisorData,
        profiles: supervisorData.profiles || undefined,
      } : null

      setSupervisor(transformedSupervisor as SupervisorWithProfile | null)
    } catch (err) {
      console.error("[useSupervisor] Failed to fetch supervisor:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch supervisor"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAvailability = useCallback(async (isAvailable: boolean) => {
    if (!supervisor) return

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("supervisors")
      .update({ is_available: isAvailable })
      .eq("id", supervisor.id)

    if (updateError) throw updateError

    setSupervisor(prev => prev ? { ...prev, is_available: isAvailable } : null)
  }, [supervisor])

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    if (!profile) return

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", profile.id)

    if (updateError) throw updateError

    setProfile(prev => prev ? { ...prev, ...data } : null)
  }, [profile])

  useEffect(() => {
    fetchSupervisor()
  }, [fetchSupervisor])

  return {
    supervisor,
    profile,
    isLoading,
    error,
    refetch: fetchSupervisor,
    updateAvailability,
    updateProfile,
  }
}

interface UseSupervisorStatsReturn {
  stats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    pendingQuotes: number
    totalEarnings: number
    pendingEarnings: number
    averageRating: number
    totalDoers: number
  } | null
  isLoading: boolean
  error: Error | null
}

export function useSupervisorStats(): UseSupervisorStatsReturn {
  const [stats, setStats] = useState<UseSupervisorStatsReturn["stats"]>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        // Use getSession() - faster, no network timeout issues
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData?.session?.user
        if (!user) return

        // Get supervisor ID
        const { data: supervisor } = await supabase
          .from("supervisors")
          .select("id, average_rating, total_projects_managed, total_earnings")
          .eq("profile_id", user.id)
          .single()

        if (!supervisor) {
          console.warn("[useSupervisorStats] No supervisor found for user ID:", user.id)
          return
        }
        console.log("[useSupervisorStats] Found supervisor:", supervisor.id, "avg_rating:", supervisor.average_rating, "total_projects:", supervisor.total_projects_managed, "total_earnings:", supervisor.total_earnings)

        // Get project counts by status
        const { data: projects } = await supabase
          .from("projects")
          .select("id, status")
          .eq("supervisor_id", supervisor.id)

        const activeStatuses = [
          "assigned", "in_progress", "submitted_for_qc",
          "qc_in_progress", "revision_requested", "in_revision"
        ]
        const pendingQuoteStatuses = ["submitted", "analyzing"]
        const completedStatuses = ["completed", "auto_approved", "delivered"]

        const activeProjects = projects?.filter(p => activeStatuses.includes(p.status)).length || 0
        const pendingQuotes = projects?.filter(p => pendingQuoteStatuses.includes(p.status)).length || 0
        const completedProjects = projects?.filter(p => completedStatuses.includes(p.status)).length || 0

        // Get wallet data
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance, total_credited")
          .eq("profile_id", user.id)
          .single()

        // Get unique doers count
        const { data: doerAssignments } = await supabase
          .from("projects")
          .select("doer_id")
          .eq("supervisor_id", supervisor.id)
          .not("doer_id", "is", null)

        const uniqueDoers = new Set(doerAssignments?.map(p => p.doer_id)).size

        setStats({
          totalProjects: supervisor.total_projects_managed || projects?.length || 0,
          activeProjects,
          completedProjects,
          pendingQuotes,
          totalEarnings: wallet?.total_credited || supervisor.total_earnings || 0,
          pendingEarnings: wallet?.balance || 0,
          averageRating: supervisor.average_rating || 0,
          totalDoers: uniqueDoers,
        })
      } catch (err) {
        console.error("[useSupervisorStats] Failed to fetch stats:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch stats"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}

interface UseSupervisorExpertiseReturn {
  expertise: { id: string; name: string; isPrimary: boolean }[]
  subjectIds: string[]
  subjectNames: string[]
  isLoading: boolean
  error: Error | null
}

export function useSupervisorExpertise(): UseSupervisorExpertiseReturn {
  const [expertise, setExpertise] = useState<UseSupervisorExpertiseReturn["expertise"]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchExpertise() {
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Get supervisor ID
        const { data: supervisor } = await supabase
          .from("supervisors")
          .select("id")
          .eq("profile_id", user.id)
          .single()

        if (!supervisor) {
          setIsLoading(false)
          return
        }

        // Get expertise areas with subject details
        const { data: expertiseData, error: expertiseError } = await supabase
          .from("supervisor_expertise")
          .select(`
            subject_id,
            is_primary,
            subjects (
              id,
              name
            )
          `)
          .eq("supervisor_id", supervisor.id)

        if (expertiseError) throw expertiseError

        const formattedExpertise = (expertiseData || [])
          .filter((item: { subjects: { id: string; name: string } | null }) => item.subjects)
          .map((item: { subject_id: string; is_primary: boolean | null; subjects: { id: string; name: string } | null }) => ({
            id: item.subjects!.id,
            name: item.subjects!.name,
            isPrimary: item.is_primary || false,
          }))

        setExpertise(formattedExpertise)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch expertise"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpertise()
  }, [])

  return {
    expertise,
    subjectIds: expertise.map(e => e.id),
    subjectNames: expertise.map(e => e.name),
    isLoading,
    error,
  }
}
