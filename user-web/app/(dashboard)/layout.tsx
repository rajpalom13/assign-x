"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { DashboardClientShell } from "@/components/dashboard/dashboard-client-shell";
import { WalletPill } from "@/components/dashboard/wallet-pill";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { DockNav } from "@/components/dock";
import { TourProvider, Tour } from "@/components/onboarding";
import { markTourCompleted } from "@/lib/actions/data";

/**
 * Page title configuration for each route
 */
const pageTitles: Record<string, string> = {
  "/home": "Dashboard",
  "/projects": "Projects",
  "/profile": "Profile",
  "/settings": "Settings",
  "/campus-connect": "Campus Connect",
  "/campus-connect/create": "Create Post",
  "/support": "Help & Support",
  "/payment-methods": "Payment Methods",
  "/wallet": "Wallet",
  "/marketplace": "Marketplace",
  "/experts": "Expert Consultations",
  "/experts/booking": "Book Expert",
};

/**
 * Page transition variants - refined, smooth animations
 * Using critically-damped springs for polished feel without bounce
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.985,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // Custom easeOutQuad
      opacity: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const },
      scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }, // Slight overshoot
    },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.55, 0, 1, 0.45] as const, // Custom easeInQuad
    },
  },
};

/**
 * Dashboard layout with macOS-style dock navigation
 * Clean, minimal design with bottom dock and floating header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

  /**
   * Handle tour completion - saves to database
   */
  const handleTourComplete = async () => {
    try {
      await markTourCompleted();
    } catch (error) {
      // Silently fail - local storage already has the completion status
      console.error("Failed to save tour completion to database:", error);
    }
  };

  return (
    <TourProvider autoStart onComplete={handleTourComplete}>
      <div className="h-screen flex flex-col overflow-hidden bg-background" data-tour="welcome">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 dashboard-header-glass border-b border-border/30 transition-all duration-200 px-4 md:px-6">
          {/* Left: Logo + Page Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </div>
              <span className="font-semibold text-sm hidden sm:inline">AssignX</span>
            </Link>
            <div className="h-5 w-px bg-border/40 hidden sm:block" />
            <h1 className="text-sm font-medium text-foreground/80 tracking-tight hidden sm:block">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-3">
            <WalletPill />
            <NotificationBell />
          </div>
        </header>

        {/* Main Content with Page Transitions */}
        <main className="flex-1 overflow-hidden">
          <DashboardClientShell>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="h-full overflow-y-auto pb-[120px] scrollbar-thin"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </DashboardClientShell>
        </main>

        {/* Dock Navigation */}
        <DockNav />

        {/* Onboarding Tour */}
        <Tour />
      </div>
    </TourProvider>
  );
}
