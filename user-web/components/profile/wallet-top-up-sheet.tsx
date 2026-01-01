"use client";

import { useState } from "react";
import { IndianRupee, CreditCard, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Preset amounts for quick selection
 */
const presetAmounts = [100, 500, 1000, 2000, 5000];

interface WalletTopUpSheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Wallet Top-Up Sheet Component
 * Slide-up modal for adding money to wallet
 * Implements U99 from feature spec
 */
export function WalletTopUpSheet({
  children,
  open,
  onOpenChange,
}: WalletTopUpSheetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const effectiveAmount = selectedAmount || (customAmount ? parseInt(customAmount, 10) : 0);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setCustomAmount(numericValue);
    setSelectedAmount(null);
  };

  const handleProceed = async () => {
    if (!effectiveAmount || effectiveAmount < 10) {
      toast.error("Minimum amount is ₹10");
      return;
    }

    if (effectiveAmount > 50000) {
      toast.error("Maximum amount is ₹50,000");
      return;
    }

    setIsProcessing(true);

    try {
      // In production: Call Razorpay payment API
      // const response = await fetch("/api/payments/create-order", {
      //   method: "POST",
      //   body: JSON.stringify({ amount: effectiveAmount, type: "wallet_topup" }),
      // });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Opening payment for ₹${effectiveAmount}...`);

      // Close sheet after successful initiation
      onOpenChange?.(false);
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const content = (
    <div className="space-y-6 pt-4">
      {/* Preset amounts */}
      <div className="space-y-3">
        <Label>Quick Select</Label>
        <div className="flex flex-wrap gap-2">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? "default" : "outline"}
              className={cn(
                "flex-1 min-w-[80px]",
                selectedAmount === amount && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => handlePresetClick(amount)}
            >
              ₹{amount.toLocaleString("en-IN")}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div className="space-y-3">
        <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="custom-amount"
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="pl-9 text-lg"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Min: ₹10 | Max: ₹50,000
        </p>
      </div>

      {/* Summary */}
      {effectiveAmount > 0 && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span>₹{effectiveAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee</span>
            <span className="text-green-600">₹0</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-lg">₹{effectiveAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {/* Proceed button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleProceed}
        disabled={!effectiveAmount || effectiveAmount < 10 || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Pay
          </>
        )}
      </Button>

      {/* Trust badge */}
      <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
          🔒
        </span>
        Secure payment via Razorpay
      </p>
    </div>
  );

  // If children provided, use as trigger
  if (children) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>Add Money to Wallet</SheetTitle>
            <SheetDescription>
              Top up your wallet to pay for projects faster
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Controlled mode
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Add Money to Wallet</SheetTitle>
          <SheetDescription>
            Top up your wallet to pay for projects faster
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
