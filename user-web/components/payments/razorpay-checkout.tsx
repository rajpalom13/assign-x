"use client"

import { useCallback } from "react"
import { Loader2, CreditCard, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { walletService } from "@/services"

/**
 * Razorpay checkout options
 */
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

/**
 * Razorpay response
 */
interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Declare Razorpay on window
 */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void
      close: () => void
    }
  }
}

/**
 * Props for RazorpayCheckout component
 */
interface RazorpayCheckoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number // Amount in rupees
  type: "wallet_topup" | "project_payment"
  projectId?: string
  userId: string
  userEmail?: string
  userName?: string
  userPhone?: string
  walletBalance?: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * RazorpayCheckout component
 * Handles payment via Razorpay or Wallet
 */
export function RazorpayCheckout({
  open,
  onOpenChange,
  amount,
  type,
  projectId,
  userId,
  userEmail,
  userName,
  userPhone,
  walletBalance = 0,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const canPayFromWallet = type === "project_payment" && walletBalance >= amount

  /**
   * Load Razorpay script
   */
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  /**
   * Handle Razorpay payment
   */
  const handleRazorpayPayment = useCallback(async () => {
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error("Failed to load payment gateway")
        onError?.("Failed to load payment gateway")
        return
      }

      // Create order
      const order = type === "wallet_topup"
        ? await walletService.createTopUpOrder(userId, amount)
        : await walletService.createProjectPaymentOrder(projectId!, amount)

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "AssignX",
        description: type === "wallet_topup" ? "Wallet Top-up" : "Project Payment",
        order_id: order.id,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#2563EB",
        },
        handler: async (response: RazorpayResponse) => {
          try {
            await walletService.verifyAndCreditWallet(
              userId,
              response,
              amount
            )
            toast.success(
              type === "wallet_topup"
                ? "Wallet topped up successfully!"
                : "Payment successful!"
            )
            onOpenChange(false)
            onSuccess?.()
          } catch (error) {
            console.error("Verification error:", error)
            toast.error("Payment verification failed. Please contact support.")
            onError?.("Payment verification failed")
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment")
      onError?.("Failed to initiate payment")
    }
  }, [
    amount,
    loadRazorpayScript,
    onError,
    onOpenChange,
    onSuccess,
    projectId,
    type,
    userEmail,
    userName,
    userPhone,
    userId,
  ])

  /**
   * Handle wallet payment
   */
  const handleWalletPayment = useCallback(async () => {
    if (!projectId) return

    try {
      await walletService.payFromWallet(userId, projectId, amount)
      toast.success("Payment successful!")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Wallet payment error:", error)
      toast.error(error.message || "Failed to process payment")
      onError?.(error.message || "Failed to process payment")
    }
  }, [amount, onError, onOpenChange, onSuccess, projectId, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "wallet_topup" ? "Top Up Wallet" : "Complete Payment"}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-3xl font-bold">₹{amount.toLocaleString()}</p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* Wallet Payment (for project payments only) */}
            {type === "project_payment" && (
              <Button
                variant={canPayFromWallet ? "default" : "outline"}
                className="w-full justify-start gap-3 h-14"
                onClick={handleWalletPayment}
                disabled={!canPayFromWallet}
              >
                <Wallet className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Pay from Wallet</p>
                  <p className="text-xs text-muted-foreground">
                    Balance: ₹{walletBalance.toLocaleString()}
                    {!canPayFromWallet && " (Insufficient)"}
                  </p>
                </div>
              </Button>
            )}

            {/* Razorpay Payment */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14"
              onClick={handleRazorpayPayment}
            >
              <CreditCard className="h-5 w-5" />
              <div className="flex-1 text-left">
                <p className="font-medium">Pay with Card/UPI</p>
                <p className="text-xs text-muted-foreground">
                  Credit/Debit Card, UPI, Net Banking
                </p>
              </div>
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-center text-xs text-muted-foreground">
            Secured by Razorpay. Your payment information is encrypted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
