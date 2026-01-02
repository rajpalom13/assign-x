"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Shield,
  Loader2,
  Smartphone,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getPaymentMethods,
  addCard,
  addUPI,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  type PaymentMethod,
} from "@/lib/actions/payment-methods";

/**
 * Razorpay checkout options type
 */
interface RazorpayOptions {
  key: string;
  customer_id?: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
}

/**
 * Razorpay response type
 */
interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

/**
 * Extended Razorpay window type
 */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

/**
 * Payment Methods Page Content
 * Uses real Supabase data and Razorpay integration
 */
function PaymentMethodsContent() {
  const searchParams = useSearchParams();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addUpiOpen, setAddUpiOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for UPI
  const [upiId, setUpiId] = useState("");

  // Open add dialog if action param is present
  useEffect(() => {
    if (searchParams.get("action") === "add-card") {
      setAddCardOpen(true);
    } else if (searchParams.get("action") === "add-upi") {
      setAddUpiOpen(true);
    }
  }, [searchParams]);

  // Fetch payment methods on mount
  const fetchMethods = useCallback(async () => {
    try {
      const data = await getPaymentMethods();
      setMethods(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Handle adding a new card via Razorpay Checkout
   * Opens Razorpay modal for secure card tokenization
   */
  const handleAddCard = async () => {
    setIsSubmitting(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        setIsSubmitting(false);
        return;
      }

      // Get Razorpay key from environment
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("Payment gateway not configured");
        setIsSubmitting(false);
        return;
      }

      // Create Razorpay customer first (if needed)
      let customerId: string | undefined;
      try {
        const response = await fetch("/api/payments/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          customerId = data.customerId;
        }
      } catch {
        // Continue without customer ID - card will still tokenize
      }

      // Configure Razorpay checkout for card tokenization
      const options: RazorpayOptions = {
        key: razorpayKey,
        customer_id: customerId,
        name: "AssignX",
        description: "Save Card for Future Payments",
        handler: async (response: RazorpayResponse) => {
          // In test mode, Razorpay returns a test token
          // In production, this would be a real card token
          if (response.razorpay_payment_id) {
            // For real Razorpay tokenization, you would use the payment_id
            // to fetch the token details from your backend
            const result = await addCard({
              cardToken: response.razorpay_payment_id,
              cardLast4: "****", // Would be returned from Razorpay
              cardNetwork: "visa", // Would be detected from card
              cardType: "credit",
              displayName: "Saved Card",
            });

            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success("Card added successfully");
              setAddCardOpen(false);
              fetchMethods();
            }
          }
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        theme: {
          color: "#6366F1",
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to initialize payment gateway");
      setIsSubmitting(false);
    }
  };

  /**
   * Handle adding a new UPI ID
   */
  const handleAddUpi = async () => {
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addUPI({
        upiId: upiId.toLowerCase().trim(),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("UPI ID added successfully");
        setAddUpiOpen(false);
        setUpiId("");
        fetchMethods();
      }
    } catch {
      toast.error("Failed to add UPI ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle setting a payment method as default
   */
  const handleSetDefault = async (id: string) => {
    try {
      const result = await setDefaultPaymentMethod(id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Default payment method updated");
        fetchMethods();
      }
    } catch {
      toast.error("Failed to update default payment method");
    }
  };

  /**
   * Handle deleting a payment method
   */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deletePaymentMethod(id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment method removed");
        fetchMethods();
      }
    } catch {
      toast.error("Failed to remove payment method");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <p className="text-sm text-muted-foreground">
          Manage your saved cards and UPI IDs
        </p>
      </div>

      {/* Saved Methods */}
      <div className="space-y-4">
        {methods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium mb-1">No payment methods saved</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add a card or UPI ID for faster checkout
              </p>
            </CardContent>
          </Card>
        ) : (
          methods.map((method) => (
            <Card
              key={method.id}
              className={cn(method.is_default && "border-primary")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        method.method_type === "card"
                          ? "bg-gradient-to-br from-slate-700 to-slate-900"
                          : "bg-gradient-to-br from-green-500 to-green-600"
                      )}
                    >
                      {method.method_type === "card" ? (
                        <CreditCard className="h-6 w-6 text-white" />
                      ) : (
                        <Smartphone className="h-6 w-6 text-white" />
                      )}
                    </div>

                    <div>
                      {method.method_type === "card" ? (
                        <>
                          <p className="font-medium">
                            •••• •••• •••• {method.card_last_four}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {method.display_name || method.card_network?.toUpperCase() || "Card"}
                            {method.card_type && ` • ${method.card_type}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">{method.upi_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.bank_name || "UPI ID"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {method.is_default ? (
                      <Badge className="bg-primary/10 text-primary">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === method.id}
                        >
                          {deletingId === method.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove payment method?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove this payment method from your
                            account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(method.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add New Methods */}
      <div className="flex gap-3">
        <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Debit/Credit Card</DialogTitle>
              <DialogDescription>
                Your card details are securely processed via Razorpay
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="text-center py-6">
                <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Click the button below to securely add your card via
                  Razorpay&apos;s secure payment gateway.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                  <Shield className="h-3 w-3" />
                  Secured by Razorpay • PCI DSS Compliant
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleAddCard}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Open Razorpay to Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addUpiOpen} onOpenChange={setAddUpiOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Smartphone className="h-4 w-4 mr-2" />
              Add UPI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add UPI ID</DialogTitle>
              <DialogDescription>
                Link your UPI ID for quick payments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                />
                <p className="text-xs text-muted-foreground">
                  Example: name@okaxis, name@ybl, name@paytm
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleAddUpi}
                disabled={isSubmitting || !upiId.includes("@")}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add UPI ID
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/**
 * Payment Methods Page
 * Manage saved cards and UPI IDs
 * Implements U91 from feature spec
 */
export default function PaymentMethodsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <PaymentMethodsContent />
        </Suspense>
      </div>
    </div>
  );
}
