"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletTopUpSheet } from "@/components/profile/wallet-top-up-sheet";
import { getWallet, getWalletTransactions } from "@/lib/actions/data";
import { cn } from "@/lib/utils";

/**
 * Transaction interface
 */
interface Transaction {
  id: string;
  transaction_type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
  reference_id?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Wallet page content
 */
function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    if (searchParams.get("action") === "topup") {
      setTopUpOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletData, transactionsData] = await Promise.all([
          getWallet(),
          getWalletTransactions(50),
        ]);
        setWallet(walletData);
        setTransactions(transactionsData as Transaction[]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.transaction_type === filter);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Balance Section */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Available balance</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight">
            ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-lg text-muted-foreground">.00</span>
        </div>
        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={() => setTopUpOpen(true)}
            size="sm"
            className="h-8 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add money
          </Button>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Transactions</h2>
          <div className="flex items-center gap-1">
            {(["all", "credit", "debit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md transition-colors",
                  filter === f
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : f === "credit" ? "In" : "Out"}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-sm"
              onClick={() => setTopUpOpen(true)}
            >
              Add money to get started
            </Button>
          </div>
        ) : (
          <div className="space-y-px">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 group hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      tx.transaction_type === "credit"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tx.transaction_type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.created_at)}
                      {tx.status === "pending" && (
                        <span className="ml-1.5 text-amber-600">• Pending</span>
                      )}
                      {tx.status === "failed" && (
                        <span className="ml-1.5 text-red-600">• Failed</span>
                      )}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    tx.transaction_type === "credit"
                      ? "text-emerald-600"
                      : "text-foreground"
                  )}
                >
                  {tx.transaction_type === "credit" ? "+" : "−"}₹
                  {tx.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <WalletTopUpSheet open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  );
}

/**
 * Wallet Page
 */
export default function WalletPage() {
  return (
    <div className="flex-1 p-6 md:p-8 max-w-lg mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <WalletContent />
      </Suspense>
    </div>
  );
}
