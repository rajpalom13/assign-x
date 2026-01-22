import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

/**
 * Main application layout (Server Component)
 * Fetches user data from server-side cookies and passes to sidebar
 * Wraps all authenticated pages with the new shadcn sidebar pattern
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
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

  // Prepare user data for sidebar
  const userData = {
    name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || profile?.email || '',
    avatar: profile?.avatar_url || '/avatars/default.jpg',
  }

  return (
    <SidebarProvider>
      <AppSidebar userData={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
