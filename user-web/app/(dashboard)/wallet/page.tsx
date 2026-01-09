"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletTopUpSheet } from "@/components/profile/wallet-top-up-sheet";
import { getWallet, getWalletTransactions } from "@/lib/actions/data";
import { cn } from "@/lib/utils";

/**
 * All possible transaction types from database enum
 */
type TransactionType =
  | "credit"
  | "debit"
  | "refund"
  | "withdrawal"
  | "top_up"
  | "project_payment"
  | "project_earning"
  | "commission"
  | "bonus"
  | "penalty"
  | "reversal";

/**
 * Transaction interface
 */
interface Transaction {
  id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
  reference_id?: string;
}

/**
 * Incoming transaction types (money coming into wallet)
 */
const INCOMING_TYPES: TransactionType[] = [
  "credit",
  "top_up",
  "refund",
  "project_earning",
  "bonus",
];

/**
 * Check if transaction is incoming
 */
function isIncomingTransaction(type: TransactionType): boolean {
  return INCOMING_TYPES.includes(type);
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Get date group label
 */
function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (date >= startOfMonth) {
    return "This Month";
  }

  return "Earlier";
}

/**
 * Format time for display
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Group transactions by date
 */
function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((tx) => {
    const group = getDateGroup(tx.created_at);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(tx);
  });

  return groups;
}

/**
 * Wallet page content
 */
function WalletContent() {
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

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let income = 0;
    let spent = 0;
    let pendingCount = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      if (txDate >= startOfMonth) {
        if (isIncomingTransaction(tx.transaction_type)) {
          income += tx.amount;
        } else {
          spent += tx.amount;
        }
      }
      if (tx.status === "pending") {
        pendingCount++;
      }
    });

    return { income, spent, pendingCount, totalTransactions: transactions.length };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    if (filter === "credit") {
      return transactions.filter((tx) =>
        isIncomingTransaction(tx.transaction_type)
      );
    }
    return transactions.filter(
      (tx) => !isIncomingTransaction(tx.transaction_type)
    );
  }, [transactions, filter]);

  // Group filtered transactions by date
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  const dateGroupOrder = ["Today", "Yesterday", "This Month", "Earlier"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                {formatCurrency(wallet?.balance || 0)}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-foreground/70" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border">
          <Button
            onClick={() => setTopUpOpen(true)}
            size="sm"
            className="h-9 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(monthlyStats.income)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">This month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Spent</span>
          </div>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(monthlyStats.spent)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">This month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-lg font-semibold tabular-nums">
            {monthlyStats.totalTransactions}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Transactions</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Transactions</h2>
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {(["all", "credit", "debit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" ? "All" : f === "credit" ? "In" : "Out"}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                {filter === "all" ? (
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                ) : filter === "credit" ? (
                  <ArrowDownLeft className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">
                {filter === "all"
                  ? "No transactions yet"
                  : filter === "credit"
                  ? "No incoming transactions"
                  : "No outgoing transactions"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                {filter === "all"
                  ? "Add money to your wallet to get started"
                  : filter === "credit"
                  ? "Top-ups and earnings will appear here"
                  : "Payments and withdrawals will appear here"}
              </p>
              {filter === "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8"
                  onClick={() => setTopUpOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Money
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {dateGroupOrder.map((group) => {
              const groupTxs = groupedTransactions[group];
              if (!groupTxs || groupTxs.length === 0) return null;

              return (
                <div key={group} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                    {group}
                  </p>
                  <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                    {groupTxs.map((tx) => {
                      const isIncoming = isIncomingTransaction(
                        tx.transaction_type
                      );
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                isIncoming
                                  ? "bg-foreground/10 text-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {isIncoming ? (
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
                                {group === "Today" || group === "Yesterday"
                                  ? formatTime(tx.created_at)
                                  : formatDate(tx.created_at)}
                                {tx.status === "pending" && (
                                  <span className="ml-1.5 text-muted-foreground">
                                    • Pending
                                  </span>
                                )}
                                {tx.status === "failed" && (
                                  <span className="ml-1.5 text-muted-foreground">
                                    • Failed
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <p
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              isIncoming
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {isIncoming ? "+" : "−"}
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
