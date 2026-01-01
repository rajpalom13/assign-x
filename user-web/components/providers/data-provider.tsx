"use client";

import { useEffect, useState } from "react";
import { useUserStore, useWalletStore, useNotificationStore, useProjectStore } from "@/stores";
import { Loader2 } from "lucide-react";

interface DataProviderProps {
  children: React.ReactNode;
}

/**
 * Data provider component
 * Fetches initial data from Supabase when the app loads
 */
export function DataProvider({ children }: DataProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUser = useUserStore((state) => state.fetchUser);
  const fetchWallet = useWalletStore((state) => state.fetchWallet);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    if (!isHydrated) return;

    const initializeData = async () => {
      try {
        // Fetch all data in parallel
        await Promise.all([
          fetchUser(),
          fetchWallet(),
          fetchNotifications(20),
          fetchProjects(),
        ]);
      } catch {
        // Silently handle initialization errors - stores handle their own error states
      } finally {
        setIsInitialized(true);
      }
    };

    initializeData();
  }, [isHydrated, fetchUser, fetchWallet, fetchNotifications, fetchProjects]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
