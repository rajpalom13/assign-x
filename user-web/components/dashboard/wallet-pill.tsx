"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores";

/**
 * Wallet balance pill component
 * Fetches balance from Supabase and displays with link to wallet page
 */
export function WalletPill() {
  const { balance, currency, isLoading, fetchWallet } = useWalletStore();

  // Fetch wallet on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className="gap-2 rounded-full px-4"
    >
      <Link href="/wallet">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Wallet className="h-4 w-4 text-primary" />
        )}
        <span className="font-semibold">
          {currency}
          {balance.toLocaleString()}
        </span>
      </Link>
    </Button>
  );
}
