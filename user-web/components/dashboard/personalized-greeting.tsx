"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/stores";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Personalized greeting component
 * Fetches user from Supabase and shows name with contextual greeting based on time
 * Only renders on the home page to avoid redundancy across dashboard pages
 */
export function PersonalizedGreeting() {
  const pathname = usePathname();
  const { user, isLoading, fetchUser } = useUserStore();

  // Only show greeting on home page
  const isHomePage = pathname === "/home" || pathname === "/";

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Gets greeting based on time of day
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get first name, supporting both old and new field names
  const fullName = user?.fullName || user?.full_name;
  const firstName = fullName?.split(" ")[0] || "there";

  // Don't render greeting on non-home pages
  if (!isHomePage) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-1 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {getGreeting()}, {firstName}!
      </h1>
      <p className="text-sm text-muted-foreground">
        What would you like to work on today?
      </p>
    </div>
  );
}
