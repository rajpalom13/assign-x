import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/**
 * Get time-based greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

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

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch doer data for stats
  const { data: doer } = await supabase
    .from('doers')
    .select('*')
    .eq('profile_id', profile?.id)
    .single()

  // Get active projects count
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('doer_id', doer?.id)
    .in('status', ['assigned', 'in_progress', 'revision_requested', 'in_revision'])

  // Get pending earnings
  const { data: pendingProjects } = await supabase
    .from('projects')
    .select('doer_payout')
    .eq('doer_id', doer?.id)
    .in('status', ['submitted_for_qc', 'qc_in_progress', 'qc_approved'])

  const pendingEarnings = pendingProjects?.reduce((sum, p) => sum + (Number(p.doer_payout) || 0), 0) || 0

  // Prepare user data for sidebar
  const userData = {
    name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || profile?.email || '',
    avatar: profile?.avatar_url || '/avatars/default.jpg',
  }

  const firstName = userData.name.split(' ')[0]
  const greeting = getGreeting()

  return (
    <SidebarProvider>
      <AppSidebar
        userData={userData}
        stats={{
          activeProjects: activeProjectsCount || 0,
          pendingEarnings: pendingEarnings,
        }}
      />
      <SidebarInset>
        {/* Enhanced Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

            {/* Greeting */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                {greeting}, <span className="text-primary">{firstName}</span>
              </p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Quick Stats Pills */}
            <div className="hidden md:flex items-center gap-2">
              {(activeProjectsCount || 0) > 0 && (
                <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="font-medium">{activeProjectsCount}</span>
                  <span className="text-teal-600/70 dark:text-teal-400/70">active</span>
                </Badge>
              )}
              {pendingEarnings > 0 && (
                <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <span className="font-medium">₹{pendingEarnings.toLocaleString('en-IN')}</span>
                  <span className="text-emerald-600/70 dark:text-emerald-400/70">pending</span>
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
