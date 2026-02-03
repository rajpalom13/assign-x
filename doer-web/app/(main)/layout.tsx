import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { MainShell } from '@/components/layouts/main-shell'
/**
 * Main application layout (Server Component)
 * Professional layout with enhanced header and sidebar
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Get session from server-side cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Redirect to login if no session
  if (!session || sessionError) {
    redirect(ROUTES.login)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', session.user.id)
    .single()

  if (!profile || profileError) {
    redirect(ROUTES.login)
  }

  const userData = {
    name: profile.full_name || 'Doer',
    email: profile.email,
    avatar: profile.avatar_url || '',
  }

  return (
    <MainShell userData={userData}>
      {children}
    </MainShell>
  )
}
