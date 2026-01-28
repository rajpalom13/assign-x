/**
 * @fileoverview Dashboard layout wrapper with sidebar navigation, header, and user authentication.
 * @module app/(dashboard)/layout
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"

interface UserProfile {
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile - using type assertion since table may not exist yet
  let profile: UserProfile | null = null
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single()
    profile = data as UserProfile | null
  } catch {
    // Profile table may not exist yet, use auth metadata
  }

  const userData = {
    name: profile?.full_name || user.user_metadata?.full_name || "Supervisor",
    email: profile?.email || user.email || "",
    avatarUrl: profile?.avatar_url,
  }

  // Fetch supervisor data and stats for header
  let pendingQCCount = 0
  let activeProjectsCount = 0
  let notificationCount = 0

  try {
    const { data: supervisor } = await supabase
      .from("supervisors")
      .select("id")
      .eq("profile_id", user.id)
      .single()

    if (supervisor) {
      const [pendingQCResult, activeProjectsResult, notificationsResult] = await Promise.all([
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("supervisor_id", supervisor.id)
          .eq("status", "submitted_for_qc"),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("supervisor_id", supervisor.id)
          .in("status", ["assigned", "in_progress", "submitted_for_qc", "qc_in_progress", "revision_requested", "in_revision"]),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
      ])

      pendingQCCount = pendingQCResult.count || 0
      activeProjectsCount = activeProjectsResult.count || 0
      notificationCount = notificationsResult.count || 0
    }
  } catch {
    // Stats queries may fail if tables don't exist yet
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <Header
          userName={userData.name}
          pendingQCCount={pendingQCCount}
          activeProjectsCount={activeProjectsCount}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
