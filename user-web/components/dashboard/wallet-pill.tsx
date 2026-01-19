"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wallet, Loader2 } from "lucide-react";
import { useWalletStore } from "@/stores";
import { cn } from "@/lib/utils";

/**
 * Wallet balance pill component - Matches new design system
 * Glass morphism style with cleaner appearance
 */
export function WalletPill() {
  const { balance, currency, isLoading, fetchWallet } = useWalletStore();

  // Fetch wallet on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <Link
      href="/wallet"
      className={cn(
        "flex items-center gap-2 px-3.5 h-9 rounded-full",
        "bg-card/80 hover:bg-card border border-border/50",
        "backdrop-blur-sm transition-all duration-200",
        "text-sm font-medium text-foreground/90",
        "hover:shadow-sm hover:border-border"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Wallet className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      )}
      <span className="font-medium">
        Wallet · {currency}{balance.toLocaleString()}
      </span>
    </Link>
  );
}
