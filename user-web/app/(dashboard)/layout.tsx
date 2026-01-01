import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DashboardClientShell } from "@/components/dashboard/dashboard-client-shell"

/**
 * Dashboard layout using shadcn sidebar-07 pattern
 * Provides collapsible sidebar with mobile support via SidebarProvider
 * Includes FAB, mobile navigation, and upload sheet
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>
        <DashboardClientShell>
          {children}
        </DashboardClientShell>
      </SidebarInset>
    </SidebarProvider>
  )
}
