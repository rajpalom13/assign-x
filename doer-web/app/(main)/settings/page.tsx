import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { SettingsClient } from './settings-client'

/**
 * Settings server component
 * Fetches session and user data from server-side httpOnly cookies
 */
export default async function SettingsPage() {
  const supabase = await createClient()

  // Get session from server-side cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Redirect to login if no session
  if (!session || sessionError) {
    redirect(ROUTES.login)
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch doer data
  const { data: doer } = await supabase
    .from('doers')
    .select('*')
    .eq('profile_id', profile?.id)
    .single()

  // Pass user data to client component
  return (
    <SettingsClient
      userEmail={session.user.email || profile?.email || ''}
      profile={profile}
      doer={doer}
    />
  )
}
