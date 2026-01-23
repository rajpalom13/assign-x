"use client";

import { Calculator, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PriceEstimateProps {
  wordCount: number;
  urgencyMultiplier?: number;
  baseRatePerWord?: number;
  className?: string;
}

/**
 * Price estimate card showing breakdown - Premium Glassmorphic Design
 */
export function PriceEstimate({
  wordCount,
  urgencyMultiplier = 1,
  baseRatePerWord = 0.8, // ₹0.80 per word base rate
  className,
}: PriceEstimateProps) {
  const basePrice = wordCount * baseRatePerWord;
  const urgencyFee = basePrice * (urgencyMultiplier - 1);
  const subtotal = basePrice + urgencyFee;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  if (wordCount <= 0) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[20px] p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl", className)}>
      {/* Gradient overlay - Teal/Cyan theme for pricing */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-cyan-50/20 dark:from-teal-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Calculator className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Price Estimate</h4>
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs">
              Base ({wordCount.toLocaleString()} words × ₹{baseRatePerWord})
            </span>
            <span className="font-medium tabular-nums">₹{Math.round(basePrice).toLocaleString()}</span>
          </div>

          {urgencyMultiplier > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">
                Urgency Fee ({Math.round((urgencyMultiplier - 1) * 100)}%)
              </span>
              <span className="font-medium tabular-nums text-amber-600 dark:text-amber-500">
                +₹{Math.round(urgencyFee).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs">GST (18%)</span>
            <span className="font-medium tabular-nums">₹{Math.round(gst).toLocaleString()}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-white/30 dark:border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">Estimated Total</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">
                      Final price may vary based on complexity and requirements.
                      You&apos;ll receive an exact quote before payment.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 tabular-nums">
              ₹{Math.round(total).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 pt-1">
          <span className="h-1 w-1 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This is an estimate. Actual price will be confirmed after review.
          </p>
        </div>
      </div>
    </div>
  );
}
