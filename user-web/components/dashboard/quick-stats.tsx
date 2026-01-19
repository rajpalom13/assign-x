"use client";

/**
 * QuickStats Component
 * Displays key metrics in a row of glass-morphism pills
 * Shows: Active Projects | Pending Actions | Wallet Balance
 */

import { motion } from "framer-motion";
import { FolderKanban, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  activeProjects: number;
  pendingActions: number;
  walletBalance: number;
  className?: string;
}

/**
 * Individual stat pill component
 */
function StatPill({
  icon: Icon,
  label,
  value,
  delay,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-card/60 backdrop-blur-sm border border-border/50",
        "text-sm transition-all duration-300",
        "hover:bg-card/80 hover:border-border/70",
        highlight && "border-primary/30 bg-primary/5"
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          highlight ? "text-primary" : "text-muted-foreground"
        )}
        strokeWidth={1.5}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", highlight ? "text-primary" : "text-foreground")}>
        {value}
      </span>
    </motion.div>
  );
}

/**
 * QuickStats - Row of stat pills for dashboard
 */
export function QuickStats({
  activeProjects,
  pendingActions,
  walletBalance,
  className,
}: QuickStatsProps) {
  // Format wallet balance
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(walletBalance);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <StatPill
        icon={FolderKanban}
        label="Active"
        value={activeProjects}
        delay={0.15}
        highlight={activeProjects > 0}
      />
      <StatPill
        icon={Clock}
        label="Pending"
        value={pendingActions}
        delay={0.2}
        highlight={pendingActions > 0}
      />
      <StatPill
        icon={Wallet}
        label="Wallet"
        value={formattedBalance}
        delay={0.25}
      />
    </motion.div>
  );
}
