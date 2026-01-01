"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletTopUpSheet } from "@/components/profile/wallet-top-up-sheet";
import { getWallet, getWalletTransactions } from "@/lib/actions/data";
import { cn } from "@/lib/utils";

/**
 * Transaction interface
 */
interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
  reference_id?: string;
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

  // Open top-up sheet if action=topup in URL
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Available Balance</p>
              <p className="text-4xl font-bold">
                ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs opacity-70 mt-2">
                Use wallet credits for faster checkout
              </p>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <Wallet className="h-8 w-8" />
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full mt-6"
            onClick={() => setTopUpOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No transactions yet</p>
              <p className="text-sm">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        tx.type === "credit"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      )}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft
                          className={cn(
                            "h-4 w-4",
                            tx.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "font-bold",
                        tx.type === "credit"
                          ? "text-green-600"
                          : "text-foreground"
                      )}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹
                      {tx.amount.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {getStatusIcon(tx.status)}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] capitalize",
                          tx.status === "completed" &&
                            "bg-green-100 text-green-700 dark:bg-green-900/30",
                          tx.status === "pending" &&
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
                          tx.status === "failed" &&
                            "bg-red-100 text-red-700 dark:bg-red-900/30"
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Sheet */}
      <WalletTopUpSheet open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  );
}

/**
 * Wallet Page
 * Shows wallet balance and transaction history
 * Implements U98 (Transaction History) and U99 (Top-Up Wallet) from feature spec
 */
export default function WalletPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-sm text-muted-foreground">
            Manage your wallet balance and transactions
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <WalletContent />
        </Suspense>
      </div>
    </div>
  );
}
