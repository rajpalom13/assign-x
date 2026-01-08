"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wallet, Loader2 } from "lucide-react";
import { useWalletStore } from "@/stores";
import { cn } from "@/lib/utils";

/**
 * Wallet balance pill component
 * Minimalist design following Notion/Linear style
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
        "flex items-center gap-2 px-3 h-8 rounded-lg",
        "bg-muted/50 hover:bg-muted transition-colors",
        "text-sm font-medium text-foreground/90"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span>
        {currency}{balance.toLocaleString()}
      </span>
    </Link>
  );
}
