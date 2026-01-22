'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'
import { clearAppStorage } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { Profile, Doer } from '@/types/database'

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
    doer,
    isLoading,
    isAuthenticated,
    isOnboarded,
    setUser,
    setDoer,
    setLoading,
    setOnboarded,
    clearAuth,
  } = useAuthStore()

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return profile as Profile | null
  }, [supabase])

  /**
   * Fetch doer data from database
   */
  const fetchDoer = useCallback(async (profileId: string) => {
    const { data: doerData } = await supabase
      .from('doers')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    return doerData as Doer | null
  }, [supabase])

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      setLoading(true)
      logger.debug('Auth', 'Initializing auth...')

      try {
        // First get session to establish client-side session from server cookies
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        logger.debug('Auth', 'Session:', session ? 'Found' : 'None', sessionError ? 'Error occurred' : '')

        if (!session || sessionError) {
          logger.debug('Auth', 'No session found')
          setLoading(false)
          return
        }

        // Now get the user from the established session
        const authUser = session.user
        logger.debug('Auth', 'User:', authUser ? 'Found' : 'None')

        if (!isMounted) return

        if (authUser) {
          logger.debug('Auth', 'User found, fetching profile')
          const profile = await fetchProfile(authUser.id)
          logger.debug('Auth', 'Profile:', profile ? 'Found' : 'Not found')

          if (!isMounted) return

          if (!profile) {
            // Profile doesn't exist - user needs to go through OAuth again to create records
            logger.debug('Auth', 'No profile found, redirecting to login')
            setLoading(false)
            router.push(ROUTES.login)
            return
          }

          setUser(profile)

          const doerData = await fetchDoer(profile.id)
          logger.debug('Auth', 'Doer:', doerData ? 'Found' : 'Not found')

          if (!isMounted) return

          if (!doerData) {
            // Doer record doesn't exist - redirect to profile setup (if not already there)
            const pathname = window.location.pathname
            if (pathname !== '/profile-setup') {
              logger.debug('Auth', 'No doer found, redirecting to profile-setup')
              setLoading(false)
              router.push('/profile-setup')
              return
            }
            logger.debug('Auth', 'No doer found, already on profile-setup')
            setLoading(false)
            return
          }

          setDoer(doerData)
          // Doer exists means profile setup is complete (doer created in profile-setup)
          setOnboarded(true)
        } else {
          logger.debug('Auth', 'No user found')
          // No authenticated user - redirect to login if on protected route
          const pathname = window.location.pathname

          // Complete list of protected route prefixes
          const PROTECTED_ROUTE_PREFIXES = [
            '/dashboard',
            '/projects',
            '/profile',
            '/resources',
            '/reviews',
            '/statistics',
            '/wallet',
            '/payouts',
            '/settings',
            '/notifications',
            '/earnings',
            '/tasks',
          ]

          const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
            prefix => pathname.startsWith(prefix)
          )

          if (isProtectedRoute) {
            logger.debug('Auth', 'On protected route without auth, redirecting')
            window.location.href = ROUTES.login
            return
          }
        }
      } catch (error) {
        logger.error('Auth', 'Error during init:', error)
      }

      if (isMounted) {
        setLoading(false)
        logger.debug('Auth', 'Init complete')
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id)
          setUser(profile)

          if (profile) {
            const doerData = await fetchDoer(profile.id)
            setDoer(doerData)
            // Doer exists means profile setup is complete
            setOnboarded(!!doerData)
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, fetchDoer, setUser, setDoer, setLoading, setOnboarded, clearAuth])

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
      type: 'sms',
    })

    if (error) throw error
    return data
  }

  return {
    user,
    doer,
    isLoading,
    isAuthenticated,
    isOnboarded,
    signUp,
    signIn,
    signOut,
    sendPhoneOtp,
    verifyPhoneOtp,
    fetchProfile,
    fetchDoer,
  }
}
