"use client";

import {
  Clock,
  FileCheck,
  CreditCard,
  UserCheck,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";
import { STATUS_CONFIG } from "@/types/project";

interface StatusBannerProps {
  status: ProjectStatus;
  className?: string;
}

/**
 * Get icon for status
 */
function getStatusIcon(status: ProjectStatus) {
  const iconClass = "h-4 w-4";

  switch (status) {
    case "analyzing":
    case "quoted":
      return <Clock className={iconClass} />;
    case "payment_pending":
      return <CreditCard className={iconClass} />;
    case "paid":
    case "assigned":
      return <UserCheck className={iconClass} />;
    case "in_progress":
      return <Loader2 className={cn(iconClass, "animate-spin")} />;
    case "delivered":
    case "qc_approved":
      return <FileCheck className={iconClass} />;
    case "completed":
      return <CheckCircle className={iconClass} />;
    case "cancelled":
      return <XCircle className={iconClass} />;
    case "refunded":
      return <RotateCcw className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
}

/**
 * Thin colored status banner below header
 */
export function StatusBanner({ status, className }: StatusBannerProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex h-10 items-center justify-center gap-2 px-4",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {getStatusIcon(status)}
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
