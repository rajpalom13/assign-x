'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Session establishment page
 * After OAuth, this page runs client-side to establish the session in localStorage
 * by calling getSession() which triggers the cookie-to-localStorage sync
 */
export default function SessionPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    const establishSession = async () => {
      try {
        const supabase = createClient()

        setStatus('Fetching session from server...')
        console.log('[Session] Fetching session from server cookies...')

        // Call getSession to sync server session to client localStorage
        // This makes a request to /auth/v1/session with credentials (includes cookies)
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log('[Session] Response:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error?.message
        })

        if (error) {
          console.error('[Session] Error getting session:', error)
          setStatus('Error: ' + error.message)
          // Redirect to login on error
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        if (!session) {
          console.warn('[Session] No session found in server cookies')
          setStatus('No session found - redirecting to login...')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        setStatus('Session established! Redirecting...')
        console.log('[Session] Session successfully established')
        console.log('[Session] User:', session.user.email)

        // Small delay to ensure localStorage write completes
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Verify session is in localStorage
        const stored = localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)
        console.log('[Session] LocalStorage check:', stored ? 'Session stored' : 'No session in storage')

        // Check where to redirect based on the 'next' query param
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/dashboard'

        console.log('[Session] Redirecting to:', next)
        router.push(next)
      } catch (err) {
        console.error('[Session] Unexpected error:', err)
        setStatus('Unexpected error occurred')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    establishSession()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg text-muted-foreground">Setting up your session...</p>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
