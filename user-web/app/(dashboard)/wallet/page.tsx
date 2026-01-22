"use client";

import { useEffect, useState, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Wallet,
  Trophy,
  Clock,
  CreditCard,
  Send,
  ChevronRight,
  Utensils,
  Coffee,
  Gift,
  ShoppingBag,
  Car,
  Music,
  Search,
} from "lucide-react";
import { PageSkeletonProvider, StaggerItem, WalletSkeleton } from "@/components/skeletons";
import { WalletTopUpSheet } from "@/components/profile/wallet-top-up-sheet";
import { getWallet, getWalletTransactions } from "@/lib/actions/data";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

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
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Mock offers data
 */
const OFFERS = [
  { id: 1, icon: Utensils, text: "10% off Cafeteria", color: "text-orange-600" },
  { id: 2, icon: Gift, text: "Cashback Friday", color: "text-amber-500" },
  { id: 3, icon: Coffee, text: "Free Coffee", color: "text-emerald-600" },
  { id: 4, icon: ShoppingBag, text: "Campus Store Deal", color: "text-blue-600" },
];

/**
 * Get icon for transaction description
 */
function getTransactionIcon(description: string) {
  const desc = description.toLowerCase();
  if (desc.includes("coffee") || desc.includes("cafe")) return Coffee;
  if (desc.includes("food") || desc.includes("cafeteria")) return Utensils;
  if (desc.includes("uber") || desc.includes("ride") || desc.includes("ola")) return Car;
  if (desc.includes("spotify") || desc.includes("music")) return Music;
  if (desc.includes("amazon") || desc.includes("shop")) return ShoppingBag;
  return null;
}

/**
 * Wallet content inner component - renders the actual wallet UI
 * Used inside PageSkeletonProvider for choreographed reveal with staggered animations
 */
interface WalletContentInnerProps {
  wallet: { balance: number } | null;
  stats: { monthlySpend: number; pendingAmount: number; rewardPoints: number };
  lastMonthTransactions: Transaction[];
  userName: string;
  topUpOpen: boolean;
  setTopUpOpen: (open: boolean) => void;
}

function WalletContentInner({
  wallet,
  stats,
  lastMonthTransactions,
  userName,
  topUpOpen,
  setTopUpOpen,
}: WalletContentInnerProps) {
  const offersRef = useRef<HTMLDivElement>(null);

  // Scroll offers
  const scrollOffers = (direction: "left" | "right") => {
    if (offersRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      offersRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="relative min-h-full pb-32 mesh-background mesh-gradient-bottom-right">
        {/* 2-Column Layout */}
        <div className="container max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN - Credit Card & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">

              {/* Credit Card with Quick Action Buttons - Aligned */}
              <StaggerItem>
                <div className="space-y-4">
                  {/* Credit Card - Compact Premium Design */}
                  <div className="relative w-full max-w-[340px] aspect-[1.7/1] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-xl p-5 overflow-hidden">
                    {/* Card shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                    {/* Mastercard logo - smaller */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-red-500/80" />
                        <div className="w-6 h-6 rounded-full bg-yellow-500/80 -ml-2.5" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Balance */}
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Balance</p>
                        <p className="text-white text-2xl font-bold tabular-nums">
                          {formatCurrency(wallet?.balance || 0)}
                        </p>
                      </div>

                      {/* Card Number */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm tracking-[0.25em] text-white/30">****</span>
                        <span className="text-sm tracking-[0.25em] text-white/30">****</span>
                        <span className="text-sm tracking-[0.25em] text-white/30">****</span>
                        <span className="text-base tracking-[0.25em] font-semibold text-white">
                          4567
                        </span>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-[10px] mb-0.5">CARD HOLDER</p>
                          <p className="text-white text-xs font-medium">{userName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-[10px] mb-0.5">EXPIRES</p>
                          <p className="text-white text-xs font-medium">08/26</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons - Aligned with Card */}
                  <div className="grid grid-cols-2 gap-4 max-w-[340px]">
                    <button
                      onClick={() => setTopUpOpen(true)}
                      className="glass-card p-5 rounded-xl hover:shadow-lg transition-all duration-300 group border border-border/30 hover:border-primary/30"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                          <Plus className="h-5 w-5 text-primary" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80">Add Balance</span>
                      </div>
                    </button>
                    <button className="glass-card p-5 rounded-xl hover:shadow-lg transition-all duration-300 group border border-border/30 hover:border-blue-500/30">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all">
                          <Send className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80">Send Money</span>
                      </div>
                    </button>
                  </div>
                </div>
              </StaggerItem>

              {/* Stats Cards - Minimal Grid */}
              <StaggerItem>
                <div className="grid grid-cols-2 gap-3">
                  {/* Rewards */}
                  <div className="glass-card rounded-xl p-4 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                        <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" strokeWidth={2.5} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Rewards</p>
                    <p className="text-lg font-bold tabular-nums">
                      {stats.rewardPoints.toLocaleString()}
                    </p>
                  </div>

                  {/* Wallet Balance */}
                  <div className="glass-card rounded-xl p-4 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center">
                        <Wallet className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500" strokeWidth={2.5} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Wallet Balance</p>
                    <p className="text-lg font-bold tabular-nums">
                      {formatCurrency(wallet?.balance || 0)}
                    </p>
                  </div>

                  {/* Monthly Spend - Full Width */}
                  <div className="glass-card rounded-xl p-4 border border-border/30 col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                            <CreditCard className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" strokeWidth={2.5} />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Monthly Spend</p>
                      </div>
                      <p className="text-xl font-bold tabular-nums">
                        {formatCurrency(stats.monthlySpend)}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>

            {/* RIGHT COLUMN - Payment Templates & History */}
            <div className="lg:col-span-8 space-y-5">

              {/* Payment Templates - Minimal Pastel Design */}
              <StaggerItem>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold tracking-tight">Offers</h2>
                  </div>
                  <div className="relative">
                    <div
                      ref={offersRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {/* Internet & TV - Soft Blue */}
                      <div className="min-w-[180px] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <Gift className="h-6 w-6 text-blue-600" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-0.5">Internet & TV</h3>
                            <p className="text-xs text-blue-700/70">Airtel</p>
                          </div>
                        </div>
                      </div>

                      {/* Electricity - Soft Green */}
                      <div className="min-w-[180px] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <Gift className="h-6 w-6 text-green-600" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-green-900 mb-0.5">Electricity</h3>
                            <p className="text-xs text-green-700/70">Energy Board</p>
                          </div>
                        </div>
                      </div>

                      {/* Shopping - Soft Purple */}
                      <div className="min-w-[180px] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }}>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <Gift className="h-6 w-6 text-purple-600" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-purple-900 mb-0.5">Shopping</h3>
                            <p className="text-xs text-purple-700/70">Amazon</p>
                          </div>
                        </div>
                      </div>

                      {/* Food - Soft Orange */}
                      <div className="min-w-[180px] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <Gift className="h-6 w-6 text-orange-600" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-orange-900 mb-0.5">Food & Dining</h3>
                            <p className="text-xs text-orange-700/70">Cafeteria</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* Payment History - Premium Minimal */}
              <StaggerItem>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold tracking-tight">Payment History</h2>
                    <button className="w-9 h-9 rounded-xl hover:bg-muted/30 flex items-center justify-center transition-all duration-200">
                      <Search className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    </button>
                  </div>

                  {lastMonthTransactions.length === 0 ? (
                    <div className="glass-card rounded-2xl p-16 text-center border border-border/20">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-5">
                        <CreditCard className="h-7 w-7 text-muted-foreground/50" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-semibold mb-1.5">No transactions yet</p>
                      <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                        Your transaction history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-2 border border-border/20">
                      <div className="space-y-0.5">
                        {lastMonthTransactions.map((tx, index) => {
                          const isIncoming = isIncomingTransaction(tx.transaction_type);
                          const CustomIcon = getTransactionIcon(tx.description);

                          return (
                            <div
                              key={tx.id}
                              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/20 transition-all duration-200 cursor-pointer group"
                            >
                              {/* Icon */}
                              <div
                                className={cn(
                                  "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                  isIncoming
                                    ? "bg-emerald-500/8 group-hover:bg-emerald-500/12"
                                    : "bg-muted/50 group-hover:bg-muted/70"
                                )}
                              >
                                {CustomIcon ? (
                                  <CustomIcon className="h-5 w-5 text-foreground/60" strokeWidth={2} />
                                ) : isIncoming ? (
                                  <ArrowDownLeft className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                                ) : (
                                  <ArrowUpRight className="h-5 w-5 text-foreground/50" strokeWidth={2} />
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate mb-0.5">
                                  {tx.description}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(tx.created_at).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              {/* Amount */}
                              <div className="text-right flex-shrink-0">
                                <p
                                  className={cn(
                                    "text-sm font-bold tabular-nums mb-0.5",
                                    isIncoming
                                      ? "text-emerald-600 dark:text-emerald-500"
                                      : "text-foreground/90"
                                  )}
                                >
                                  {isIncoming ? "+" : "−"} {formatCurrency(tx.amount)}
                                </p>
                                {tx.status !== "completed" && (
                                  <span
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full font-medium inline-block",
                                      tx.status === "pending"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    )}
                                  >
                                    {tx.status === "pending" ? "Pending" : "Failed"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </StaggerItem>
            </div>
          </div>
        </div>
      </div>

      <WalletTopUpSheet open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  );
}

/**
 * Wallet page with data fetching and skeleton provider
 * Manages loading state and provides choreographed reveal
 */
function WalletPageContent() {
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);

  // Handle topup action from URL
  useEffect(() => {
    if (searchParams.get("action") === "topup") {
      setTopUpOpen(true);
    }
  }, [searchParams]);

  // Fetch wallet data
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

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let monthlySpend = 0;
    let pendingAmount = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      if (!isIncomingTransaction(tx.transaction_type) && txDate >= startOfMonth) {
        monthlySpend += tx.amount;
      }
      if (tx.status === "pending") {
        pendingAmount += tx.amount;
      }
    });

    return { monthlySpend, pendingAmount, rewardPoints: 1250 };
  }, [transactions]);

  // Get last month's transactions
  const lastMonthTransactions = useMemo(() => {
    return transactions.slice(0, 10);
  }, [transactions]);

  // Get user display name
  const userName = user?.fullName || user?.full_name || "User";

  return (
    <PageSkeletonProvider
      isLoading={isLoading}
      skeleton={<WalletSkeleton />}
      minimumDuration={1000}
      className="flex-1"
    >
      <WalletContentInner
        wallet={wallet}
        stats={stats}
        lastMonthTransactions={lastMonthTransactions}
        userName={userName}
        topUpOpen={topUpOpen}
        setTopUpOpen={setTopUpOpen}
      />
    </PageSkeletonProvider>
  );
}

/**
 * Wallet Page - Main export with Suspense boundary
 */
export default function WalletPage() {
  return (
    <div className="flex-1">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <WalletPageContent />
      </Suspense>
    </div>
  );
}
