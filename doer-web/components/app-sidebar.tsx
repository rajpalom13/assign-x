"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  User,
  Star,
  BarChart3,
  HelpCircle,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/**
 * Navigation data for doer-web application
 */
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & tasks",
  },
  {
    title: "My Projects",
    url: "/projects",
    icon: FolderOpen,
    description: "Active work",
  },
  {
    title: "Resources",
    url: "/resources",
    icon: BookOpen,
    description: "Tools & guides",
  },
]

const navProfile = [
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    description: "Your info",
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Star,
    description: "Feedback",
  },
  {
    title: "Statistics",
    url: "/statistics",
    icon: BarChart3,
    description: "Performance",
  },
]

const navSupport = [
  {
    title: "Help & Support",
    url: "/support",
    icon: HelpCircle,
    description: "Get help",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Preferences",
  },
]

type UserData = {
  name: string
  email: string
  avatar: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  userData: UserData
  stats?: {
    activeProjects?: number
    pendingEarnings?: number
  }
}

/**
 * AppSidebar component for doer-web
 * Professional sidebar with gradient logo and active indicators
 */
export function AppSidebar({ userData, stats, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/50">
              <Link href="/dashboard">
                {/* Gradient Logo */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
                  <span className="text-base font-bold text-white">AX</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AssignX Doer</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Freelancer Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Stats (when sidebar is expanded) */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <div className="px-2 py-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-teal-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Ready to work</p>
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                    {stats?.activeProjects || 0} Active Projects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "relative transition-all",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "transition-colors",
                          isActive ? "text-teal-500" : "text-sidebar-foreground/70"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {/* Badge for projects */}
                    {item.url === '/projects' && stats?.activeProjects && stats.activeProjects > 0 && (
                      <SidebarMenuBadge className="bg-teal-500 text-white">
                        {stats.activeProjects}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
            Profile & Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navProfile.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "relative transition-all",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "transition-colors",
                          isActive ? "text-teal-500" : "text-sidebar-foreground/70"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSupport.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "relative transition-all",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "transition-colors",
                          isActive ? "text-teal-500" : "text-sidebar-foreground/70"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Earnings Card (when sidebar is expanded) */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
          <div className="px-2 py-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    ₹{(stats?.pendingEarnings || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
