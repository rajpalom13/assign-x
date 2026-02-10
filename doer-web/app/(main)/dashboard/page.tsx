import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { DashboardClient } from './dashboard-client'

/** Prevent Next.js from caching this page — always fetch fresh auth data */
export const dynamic = 'force-dynamic'

/**
 * Checks if a Supabase error indicates a missing row.
 */
const isNoRowError = (error: { code?: string; message?: string; details?: string } | null) =>
  error?.code === 'PGRST116' ||
  error?.message?.toLowerCase().includes('no rows') ||
  error?.details?.toLowerCase().includes('results contain 0 rows')

/**
 * Dashboard server component
 * Fetches session and doer profile from server-side httpOnly cookies
 * Passes data to client component for rendering
 */
export default async function DashboardPage() {
  const supabase = await createClient()

  // Get session from server-side cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  console.log('[Dashboard Server] Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    error: sessionError?.message
  })

  // Redirect to login if no session
  if (!session || sessionError) {
    console.log('[Dashboard Server] No session, redirecting to login')
    redirect(ROUTES.login)
  }

  // Fetch profile (user profile data)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  console.log('[Dashboard Server] Profile:', {
    found: !!profile,
    id: profile?.id,
    error: profileError?.message
  })

  // Redirect to login if profile not found
  if (!profile || profileError) {
    console.error('[Dashboard Server] Profile not found:', profileError)
    redirect(ROUTES.login)
  }

  // Fetch doer record (linked to profile)
  const { data: doer, error: doerError } = await supabase
    .from('doers')
    .select('*')
    .eq('profile_id', profile.id)
    .single()

  console.log('[Dashboard Server] Doer:', {
    found: !!doer,
    id: doer?.id,
    profileId: doer?.profile_id,
    error: doerError?.message
  })

  const doerMissing = !doer || isNoRowError(doerError)

  // Redirect to login if doer fetch failed unexpectedly
  if (doerError && !isNoRowError(doerError)) {
    console.error('[Dashboard Server] Doer fetch failed:', doerError)
    redirect(ROUTES.login)
  }

  // Redirect to profile setup if doer not found
  if (doerMissing) {
    console.log('[Dashboard Server] Doer missing, redirecting to profile setup')
    redirect(ROUTES.profileSetup)
  }

  // Pass doer data to client component
  return <DashboardClient initialDoer={doer} />
}
