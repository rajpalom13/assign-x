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
        // Use getUser() instead of getSession() - more reliable with SSR
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (authUser) {
          const profile = await fetchProfile(authUser.id)

          if (!isMounted) return

          if (!profile) {
            // Profile doesn't exist - user needs to go through OAuth again to create records
            setLoading(false)
            router.push(ROUTES.login)
            return
          }

          setUser(profile)

          const supervisorData = await fetchSupervisor(profile.id)

          if (!isMounted) return

          if (!supervisorData) {
            // Supervisor record doesn't exist - redirect to profile setup (if not already there)
            const pathname = window.location.pathname
            if (pathname !== "/profile-setup") {
              setLoading(false)
              router.push("/profile-setup")
              return
            }
            setLoading(false)
            return
          }

          setSupervisor(supervisorData)

          // Fetch activation data
          const activationData = await fetchActivation(supervisorData.id)

          if (activationData) {
            setActivation(activationData)
          }

          // Supervisor exists means profile setup is complete
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
      } catch {
        // Auth initialization failed silently
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
