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

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <Header userName={userData.name} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
