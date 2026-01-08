"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardClientShell } from "@/components/dashboard/dashboard-client-shell";
import { WalletPill } from "@/components/dashboard/wallet-pill";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

/**
 * Page title configuration for each route
 */
const pageTitles: Record<string, string> = {
  "/home": "Dashboard",
  "/projects": "Projects",
  "/profile": "Profile",
  "/settings": "Settings",
  "/connect": "Campus Connect",
  "/support": "Help & Support",
  "/payment-methods": "Payment Methods",
  "/wallet": "Wallet",
  "/marketplace": "Marketplace",
};

/**
 * Dashboard layout using shadcn sidebar-07 pattern
 * Provides collapsible sidebar with mobile support via SidebarProvider
 * Unified header with page title, wallet, notifications, and theme toggle
 * Follows Notion/Linear style minimalist design
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Unified Header */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border/40 transition-all duration-200 px-4">
          {/* Left: Sidebar Toggle + Page Title */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 hover:bg-accent/80 transition-colors -ml-1" />
            <Separator orientation="vertical" className="h-5 bg-border/60" />
            <h1 className="text-sm font-medium text-foreground/90 tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-2">
            <WalletPill />
            <Separator orientation="vertical" className="h-5 bg-border/60 mx-1" />
            <NotificationBell />
            <AnimatedThemeToggler />
          </div>
        </header>

        {/* Main Content */}
        <DashboardClientShell>
          {children}
        </DashboardClientShell>
      </SidebarInset>
    </SidebarProvider>
  );
}
