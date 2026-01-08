"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FolderKanban,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { useUserStore } from "@/stores/user-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

/**
 * Navigation items for the main section of the sidebar
 */
const mainNavItems = [
  {
    title: "Dashboard",
    url: "/home",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Campus Connect",
    url: "/connect",
    icon: Users,
  },
]

/**
 * Finance navigation items
 */
const financeNavItems = [
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
]

/**
 * AppSidebar component for user-web dashboard
 * Uses shadcn sidebar-07 pattern with AssignX branding
 * Follows Notion/Linear style minimalist design
 * Fetches actual user data from the user store
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = useUserStore((state) => state.user)

  // Build user data for NavUser component
  const userData = {
    name: user?.full_name || user?.fullName || "User",
    email: user?.email || "",
    avatar: user?.avatar_url || user?.avatarUrl || "",
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40" {...props}>
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-accent/50">
              <Link href="/home">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AssignX</span>
                  <span className="truncate text-xs text-muted-foreground">Beta</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-0">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Finance Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 group-data-[collapsible=icon]:border-0">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
