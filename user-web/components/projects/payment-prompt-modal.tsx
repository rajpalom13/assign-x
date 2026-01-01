"use client";

import { useEffect, useState } from "react";
import { CreditCard, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useProjectStore, type Project } from "@/stores/project-store";

interface PaymentPromptModalProps {
  onPay?: (project: Project) => void;
}

/**
 * Auto-popup payment prompt modal (Paytm style)
 * Shows when user has unpaid quotes
 */
export function PaymentPromptModal({ onPay }: PaymentPromptModalProps) {
  const { showPaymentPrompt, unpaidProject, dismissPaymentPrompt } =
    useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  // Delay showing the modal slightly for better UX
  useEffect(() => {
    if (showPaymentPrompt && unpaidProject) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [showPaymentPrompt, unpaidProject]);

  const handleClose = () => {
    setIsOpen(false);
    dismissPaymentPrompt();
  };

  const handlePay = () => {
    if (unpaidProject && onPay) {
      onPay(unpaidProject);
    }
    handleClose();
  };

  if (!unpaidProject) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <SheetTitle>Your Project is Ready!</SheetTitle>
          <SheetDescription>
            Complete the payment to start work on your project.
          </SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {/* Project Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="mb-1 text-sm text-muted-foreground">
              {unpaidProject.projectNumber}
            </p>
            <p className="font-medium">{unpaidProject.title}</p>
            <p className="text-sm text-muted-foreground">
              {unpaidProject.subjectName}
            </p>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-muted-foreground">Amount to Pay</span>
            <span className="text-2xl font-bold text-primary">
              ₹{unpaidProject.quoteAmount || 0}
            </span>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handlePay} className="w-full" size="lg">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-muted-foreground"
          >
            Remind Me Later
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
