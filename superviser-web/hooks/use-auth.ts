/**
 * @fileoverview Custom React hook for authentication state management and session handling.
 * @module hooks/use-auth
 */

"use client"

import { useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { ROUTES } from "@/lib/constants"
import { clearAppStorage } from "@/lib/utils"
import { MOCK_PROFILE, MOCK_SUPERVISOR } from "@/lib/mock-data/seed"
import type { Profile, Supervisor, SupervisorActivation } from "@/types/database"

/**
 * Custom hook for authentication management
 * @returns Auth state and methods
 */
export function useAuth() {
  const router = useRouter()
  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  const {
    user,
    supervisor,
    activation,
    isLoading,
    isAuthenticated,
    isOnboarded,
    setUser,
    setSupervisor,
    setActivation,
    setLoading,
    setOnboarded,
    clearAuth,
  } = useAuthStore()

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    return profile as Profile | null
  }, [supabase])

  /**
   * Fetch supervisor data from database
   */
  const fetchSupervisor = useCallback(async (profileId: string) => {
    const { data: supervisorData } = await supabase
      .from("supervisors")
      .select("*")
      .eq("profile_id", profileId)
      .single()

    return supervisorData as Supervisor | null
  }, [supabase])

  /**
   * Fetch supervisor activation data from database
   */
  const fetchActivation = useCallback(async (supervisorId: string) => {
    const { data: activationData } = await supabase
      .from("supervisor_activation")
      .select("*")
      .eq("supervisor_id", supervisorId)
      .single()

    return activationData as SupervisorActivation | null
  }, [supabase])

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      setLoading(true)

      try {
        console.log("[useAuth] Checking auth session...")

        // Add timeout to getSession() to prevent hanging
        let sessionData: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"] | null = null
        let sessionError: Error | null = null

        try {
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("getSession timeout after 5s")), 5000)
          )
          const result = await Promise.race([sessionPromise, timeoutPromise])
          sessionData = result.data
          console.log("[useAuth] getSession result:", {
            hasSession: !!sessionData?.session,
            userId: sessionData?.session?.user?.id,
          })
        } catch (err) {
          sessionError = err instanceof Error ? err : new Error("getSession failed")
          console.warn("[useAuth] getSession failed/timed out:", sessionError.message)
        }

        let authUser = sessionData?.session?.user || null

        // If we have a session, optionally verify with getUser() (with timeout)
        if (sessionData?.session) {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("getUser timeout")), 3000)
            )
            const getUserPromise = supabase.auth.getUser()
            const result = await Promise.race([getUserPromise, timeoutPromise]) as Awaited<typeof getUserPromise>

            if (result.data?.user) {
              authUser = result.data.user
              console.log("[useAuth] getUser verified:", authUser.id)
            }
          } catch (verifyErr) {
            console.warn("[useAuth] getUser verification failed, using session:", verifyErr)
          }
        }

        console.log("[useAuth] Final auth user:", authUser?.id, authUser?.email)

        if (!isMounted) return

        if (authUser) {
          // Try to fetch real profile, fall back to mock on failure
          let profile: Profile | null = null
          try {
            const profilePromise = fetchProfile(authUser.id)
            const profileTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            profile = await Promise.race([profilePromise, profileTimeout])
          } catch {
            console.warn("[useAuth] Failed to fetch profile, using mock data")
          }

          if (!isMounted) return

          if (!profile) {
            console.warn("[useAuth] Using MOCK_PROFILE fallback")
            profile = MOCK_PROFILE as Profile
          }

          setUser(profile)

          // Try to fetch real supervisor, fall back to mock on failure
          let supervisorData: Supervisor | null = null
          try {
            const supPromise = fetchSupervisor(profile.id)
            const supTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            supervisorData = await Promise.race([supPromise, supTimeout])
          } catch {
            console.warn("[useAuth] Failed to fetch supervisor, using mock data")
          }

          if (!isMounted) return

          if (!supervisorData) {
            console.warn("[useAuth] Using MOCK_SUPERVISOR fallback")
            supervisorData = MOCK_SUPERVISOR as Supervisor
          }

          setSupervisor(supervisorData)

          // Fetch activation data (non-critical, skip on failure)
          try {
            const activationData = await fetchActivation(supervisorData.id)
            if (activationData) setActivation(activationData)
          } catch {
            console.warn("[useAuth] Activation fetch failed, skipping")
          }

          setOnboarded(true)
        } else if (sessionError) {
          // Session timed out - use mock data to populate the dashboard
          console.warn("[useAuth] Session unavailable, using mock data for development")
          setUser(MOCK_PROFILE as Profile)
          setSupervisor(MOCK_SUPERVISOR as Supervisor)
          setOnboarded(true)
        } else {
          // No authenticated user - redirect to login if on protected route
          const pathname = window.location.pathname
          const isProtectedRoute = pathname.startsWith("/dashboard") ||
                                   pathname.startsWith("/projects") ||
                                   pathname.startsWith("/profile") ||
                                   pathname.startsWith("/doers") ||
                                   pathname.startsWith("/users") ||
                                   pathname.startsWith("/chat") ||
                                   pathname.startsWith("/earnings") ||
                                   pathname.startsWith("/resources") ||
                                   pathname.startsWith("/settings")

          if (isProtectedRoute) {
            window.location.href = ROUTES.login
            return
          }
        }
      } catch (err) {
        console.error("[useAuth] Auth initialization failed, using mock data:", err)
        // Final fallback - use mock data
        if (isMounted) {
          setUser(MOCK_PROFILE as Profile)
          setSupervisor(MOCK_SUPERVISOR as Supervisor)
          setOnboarded(true)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id)
          setUser(profile)

          if (profile) {
            const supervisorData = await fetchSupervisor(profile.id)
            setSupervisor(supervisorData)
            
            if (supervisorData) {
              const activationData = await fetchActivation(supervisorData.id)
              setActivation(activationData)
            }
            
            // Supervisor exists means profile setup is complete
            setOnboarded(!!supervisorData)
          }
        } else if (event === "SIGNED_OUT") {
          clearAuth()
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, fetchSupervisor, fetchActivation, setUser, setSupervisor, setActivation, setLoading, setOnboarded, clearAuth, router])

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    })

    if (error) throw error
    return data
  }

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  /**
   * Sign out
   * Clears all localStorage data and forces full page reload
   */
  const signOut = async () => {
    // Clear auth store first
    clearAuth()

    // Clear all localStorage (auth tokens, cached data)
    clearAppStorage()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Force full page reload to clear all cached state
    window.location.href = ROUTES.login
  }

  /**
   * Send OTP to phone number
   */
  const sendPhoneOtp = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    })

    if (error) throw error
    return data
  }

  /**
   * Verify phone OTP
   */
  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })

    if (error) throw error
    return data
  }

  return {
    user,
    supervisor,
    activation,
    isLoading,
    isAuthenticated,
    isOnboarded,
    signUp,
    signIn,
    signOut,
    sendPhoneOtp,
    verifyPhoneOtp,
    fetchProfile,
    fetchSupervisor,
    fetchActivation,
  }
}
