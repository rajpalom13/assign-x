import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { SupportClient } from './support-client'

/**
 * Help & Support server component
 * Fetches session from server-side httpOnly cookies
 */
export default async function SupportPage() {
  const supabase = await createClient()

  // Get session from server-side cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Redirect to login if no session
  if (!session || sessionError) {
    redirect(ROUTES.login)
  }

  // Fetch user profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Pass session data to client component
  return <SupportClient userEmail={session.user.email || profile?.email || ''} />
}
