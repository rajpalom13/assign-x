'use client'

import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { API_ROUTES, ROUTES } from '@/lib/constants'
import { clearAppStorage } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { Profile, Doer } from '@/types/database'

/**
 * Module-level flag to prevent duplicate auth initialization.
 * When multiple components call useAuth(), only the first triggers initAuth.
 * Reset on sign-out so the next sign-in properly initializes.
 */
let _authInitStarted = false

/**
 * Custom hook for authentication management.
 * Uses a singleton initialization pattern so navigating between pages
 * does NOT re-fetch auth data or flash loading skeletons.
 */
export function useAuth() {
  const router = useRouter()
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

  // Stable refs for callbacks used inside effects
  const fetchProfileRef = useRef(fetchProfile)
  fetchProfileRef.current = fetchProfile
  const fetchDoerRef = useRef(fetchDoer)
  fetchDoerRef.current = fetchDoer
  const routerRef = useRef(router)
  routerRef.current = router
  const setUserRef = useRef(setUser)
  setUserRef.current = setUser
  const setDoerRef = useRef(setDoer)
  setDoerRef.current = setDoer
  const setLoadingRef = useRef(setLoading)
  setLoadingRef.current = setLoading
  const setOnboardedRef = useRef(setOnboarded)
  setOnboardedRef.current = setOnboarded
  const clearAuthRef = useRef(clearAuth)
  clearAuthRef.current = clearAuth

  /**
   * One-time auth initialization.
   * Runs only once across the entire app lifecycle (until sign-out resets it).
   * Subsequent component mounts that call useAuth() skip re-fetching.
   */
  useEffect(() => {
    if (_authInitStarted) {
      // Already initialized or in progress — if loading is still true
      // but we already have user data (stale flag), clear it.
      if (isLoading && user) {
        setLoadingRef.current(false)
      }
      return
    }
    _authInitStarted = true

    let isMounted = true

    const initAuth = async () => {
      logger.debug('Auth', 'Initializing auth...')

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        logger.debug('Auth', 'Session:', session ? 'Found' : 'None', sessionError ? 'Error occurred' : '')

        if (!session || sessionError) {
          logger.debug('Auth', 'No session found')
          if (isMounted) setLoadingRef.current(false)
          return
        }

        const authUser = session.user
        if (!isMounted) return

        if (authUser) {
          logger.debug('Auth', 'User found, fetching profile')
          const profile = await fetchProfileRef.current(authUser.id)

          if (!isMounted) return

          if (!profile) {
            logger.debug('Auth', 'No profile found, redirecting to login')
            setLoadingRef.current(false)
            routerRef.current.push(ROUTES.login)
            return
          }

          setUserRef.current(profile)

          const doerData = await fetchDoerRef.current(profile.id)
          if (!isMounted) return

          if (!doerData) {
            const pathname = window.location.pathname
            if (pathname !== '/profile-setup') {
              logger.debug('Auth', 'No doer found, redirecting to profile-setup')
              setLoadingRef.current(false)
              routerRef.current.push('/profile-setup')
              return
            }
            setLoadingRef.current(false)
            return
          }

          setDoerRef.current(doerData)
          setOnboardedRef.current(true)
        } else {
          logger.debug('Auth', 'No user found')
          const pathname = window.location.pathname

          const PROTECTED_ROUTE_PREFIXES = [
            '/dashboard', '/projects', '/profile', '/resources',
            '/reviews', '/statistics', '/wallet', '/payouts',
            '/settings', '/notifications', '/earnings', '/tasks',
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
        setLoadingRef.current(false)
        logger.debug('Auth', 'Init complete')
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  /**
   * Auth state change listener — always active.
   * Separate from init so it stays alive across the session.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfileRef.current(session.user.id)
          setUserRef.current(profile)

          if (profile) {
            const doerData = await fetchDoerRef.current(profile.id)
            setDoerRef.current(doerData)
            setOnboardedRef.current(!!doerData)
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthRef.current()
          _authInitStarted = false
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

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
    // Sign out on server to clear auth cookies
    const response = await fetch(API_ROUTES.auth.logout, { method: 'POST' })
    if (!response.ok) {
      throw new Error('Server logout failed')
    }

    // Sign out from Supabase client to revoke tokens
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear auth store and reset init flag
    clearAuth()
    _authInitStarted = false

    // Clear all localStorage (auth tokens, cached data)
    clearAppStorage()

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
