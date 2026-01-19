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
      <div className="relative min-h-screen">
        {/* Curved Dome Hero Background with Image */}
        <div className="wallet-dome-hero">
          {/* Image Background */}
          <div className="wallet-dome-image">
            <Image
              src="/gradient.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient overlay for smooth transition */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
          {/* Offers Section - Inside the curve */}
          <StaggerItem>
            <section className="px-6 pt-6 pb-4">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Offers</h2>
              <div className="relative">
                <div
                  ref={offersRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {OFFERS.map((offer) => (
                    <button
                      key={offer.id}
                      className="offer-pill flex-shrink-0"
                    >
                      <offer.icon className={cn("h-5 w-5", offer.color)} />
                      <span className="text-sm font-medium">
                        {offer.text}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => scrollOffers("right")}
                    className="offer-pill flex-shrink-0"
                  >
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </section>
          </StaggerItem>

          {/* Spacer - Pushes content to align card center with curve boundary */}
          <div className="h-72 md:h-96" />
        </div>

        {/* Credit Card - Centered exactly at curve boundary (50% inside, 50% outside) */}
        <StaggerItem>
          <section className="relative z-10 -mt-36 px-6 flex justify-center">
            <div className="wallet-credit-card w-full max-w-sm aspect-[1.6/1]">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-xl font-semibold tracking-wide text-white/90">
                  AssignX
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-white/70">
                  CVV
                </span>
              </div>

              {/* Chip */}
              <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300/60 to-amber-500/60 mb-6 flex items-center justify-center">
                <div className="w-6 h-4 rounded-sm bg-gradient-to-r from-amber-200/50 to-amber-400/50" />
              </div>

              {/* Card Number */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-lg tracking-widest text-white/60">****</span>
                <span className="text-lg tracking-widest text-white/60">****</span>
                <span className="text-lg tracking-widest text-white/60">****</span>
                <span className="text-xl tracking-widest font-semibold text-white">
                  4567
                </span>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-white/80">{userName}</span>
                <span className="text-sm font-medium text-white/80">12/26</span>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Balance Widgets - Below the card */}
        <StaggerItem>
          <section className="px-6 pt-6 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Wallet Balance */}
              <div className="balance-widget">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>

              {/* Rewards / Points */}
              <div className="balance-widget">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Rewards / Points</p>
                <p className="text-xl font-semibold tabular-nums">
                  {stats.rewardPoints.toLocaleString()}
                </p>
              </div>

              {/* Pending */}
              <div className="balance-widget">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>

              {/* Monthly Spend */}
              <div className="balance-widget">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Monthly Spend</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(stats.monthlySpend)}
                </p>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Action Buttons */}
        <StaggerItem>
          <section className="px-6 pb-8 flex justify-center gap-3">
            <button className="wallet-action-btn">
              <Send className="h-4 w-4 inline-block mr-2" />
              Send
            </button>
            <button
              className="wallet-action-btn"
              onClick={() => setTopUpOpen(true)}
            >
              <Plus className="h-4 w-4 inline-block mr-2" />
              Add Money
            </button>
            <button className="wallet-action-btn">
              <ArrowUpRight className="h-4 w-4 inline-block mr-2" />
              Withdraw
            </button>
          </section>
        </StaggerItem>

        {/* Transaction History - Outside the curved dome */}
        <StaggerItem>
          <section className="px-6 pb-8">
            <h2 className="text-xl font-semibold mb-1 text-foreground">
              Transaction History
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Last Month</p>

            {lastMonthTransactions.length === 0 ? (
              <div className="action-card-glass rounded-2xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                  Add money to your wallet to get started
                </p>
              </div>
            ) : (
              <div className="action-card-glass rounded-2xl p-4">
                {lastMonthTransactions.map((tx) => {
                  const isIncoming = isIncomingTransaction(tx.transaction_type);
                  const CustomIcon = getTransactionIcon(tx.description);

                  return (
                    <div
                      key={tx.id}
                      className="transaction-item"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Transaction Icon */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            isIncoming
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-muted"
                          )}
                        >
                          {CustomIcon ? (
                            <CustomIcon className="h-5 w-5 text-foreground/70" />
                          ) : isIncoming ? (
                            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Transaction Details */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Amount and Status */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isIncoming ? "text-emerald-600" : "text-foreground"
                          )}
                        >
                          {isIncoming ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            tx.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : tx.status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {tx.status === "completed"
                            ? "Completed"
                            : tx.status === "pending"
                            ? "Pending"
                            : "Failed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </StaggerItem>
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
    <div className="flex-1 min-h-screen">
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
