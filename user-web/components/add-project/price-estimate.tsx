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
 * Price estimate card showing breakdown
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
    <Card className={cn("bg-muted/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          Price Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Base ({wordCount.toLocaleString()} words × ₹{baseRatePerWord})
            </span>
            <span>₹{basePrice.toLocaleString()}</span>
          </div>

          {urgencyMultiplier > 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Urgency Fee ({Math.round((urgencyMultiplier - 1) * 100)}%)
              </span>
              <span>₹{urgencyFee.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (18%)</span>
            <span>₹{Math.round(gst).toLocaleString()}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-medium">Estimated Total</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Final price may vary based on complexity and requirements.
                      You&apos;ll receive an exact quote before payment.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-lg font-bold text-primary">
              ₹{Math.round(total).toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          * This is an estimate. Actual price will be confirmed after review.
        </p>
      </CardContent>
    </Card>
  );
}
