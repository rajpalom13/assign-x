"use client";

import { PersonalizedGreeting } from "./personalized-greeting";
import { WalletPill } from "./wallet-pill";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Dashboard header component
 * Contains greeting, wallet pill, notifications, and theme toggle
 */
export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Greeting */}
        <PersonalizedGreeting />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <WalletPill />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
