"use client";

import { cn } from "@/lib/utils";
import { SkeletonStatsRow } from "../composites";
import { SkeletonTransactionItem } from "../composites";
import { SkeletonBox, SkeletonText, SkeletonButton, SkeletonBadge } from "../primitives";

interface WalletSkeletonProps {
  className?: string;
}

/**
 * Full page skeleton for Wallet (/wallet)
 * Matches the unified layout structure with credit card hero
 */
export function WalletSkeleton({ className }: WalletSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-4 md:p-6", className)}>
      {/* Hero with Credit Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30 overflow-hidden">
        {/* Offers Pills */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <SkeletonBadge key={i} width={100} delay={i * 30} />
          ))}
        </div>

        {/* Credit Card */}
        <div className="flex justify-center py-6">
          <div className="w-[300px] h-[180px] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 relative overflow-hidden">
            {/* Card shimmer overlay */}
            <div className="skeleton-shimmer absolute inset-0" />

            {/* Card content skeleton */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <SkeletonText width={100} lineHeight={14} animate="pulse" delay={100} />
                <SkeletonBox width={40} height={30} rounded="md" animate="pulse" delay={150} />
              </div>

              <div className="space-y-2">
                <SkeletonText width={180} lineHeight={16} animate="pulse" delay={200} />
                <div className="flex gap-4">
                  <SkeletonText width={60} lineHeight={12} animate="pulse" delay={250} />
                  <SkeletonText width={60} lineHeight={12} animate="pulse" delay={300} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonButton key={i} size="lg" className="w-full" delay={350 + i * 50} />
        ))}
      </div>

      {/* Stats Row */}
      <SkeletonStatsRow delay={500} />

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonText width={160} lineHeight={24} delay={700} />
          <SkeletonBadge width={80} delay={750} />
        </div>

        {/* Date Header */}
        <SkeletonText width={60} lineHeight={14} delay={800} />

        {/* Transaction Items */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonTransactionItem key={i} delay={850 + i * 60} />
          ))}
        </div>
      </div>
    </div>
  );
}
