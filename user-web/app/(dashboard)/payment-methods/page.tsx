"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Shield,
  Loader2,
  Smartphone,
  AlertCircle,
  RefreshCw,
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

/**
 * Payment method interface (matches API response)
 */
interface PaymentMethod {
  id: string;
  type: "card" | "upi";
  isDefault: boolean;
  isVerified?: boolean;
  // Card fields
  cardLast4?: string;
  cardBrand?: string;
  cardType?: string;
  cardExpiry?: string;
  cardholderName?: string;
  bankName?: string;
  // UPI fields
  upiId?: string;
  createdAt?: string;
}

/**
 * Payment Methods Page
 * Manage saved cards and UPI IDs
 * Implements U91 from feature spec
 */
export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addUpiOpen, setAddUpiOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for new card
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Form state for UPI
  const [upiId, setUpiId] = useState("");

  /**
   * Fetch payment methods from API
   */
  const fetchMethods = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/payments/methods");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch payment methods");
      }

      if (data.success && data.methods) {
        setMethods(data.methods);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load payment methods";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleAddCard = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error("Please fill all card details");
      return;
    }

    // Validate card number (basic validation)
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      toast.error("Please enter a valid card number");
      return;
    }

    setIsSubmitting(true);
    try {
      // Detect card brand from first digits
      const cardBrand = detectCardBrand(cleanedCardNumber);

      const response = await fetch("/api/payments/methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "card",
          cardLast4: cleanedCardNumber.slice(-4),
          cardBrand,
          cardExpiry,
          cardholderName: cardName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add card");
      }

      if (data.success && data.method) {
        setMethods((prev) => [...prev, data.method]);
        toast.success("Card added successfully");
        setAddCardOpen(false);
        resetCardForm();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add card";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Detect card brand from card number
   */
  const detectCardBrand = (cardNumber: string): string => {
    const patterns: Record<string, RegExp> = {
      visa: /^4/,
      mastercard: /^5[1-5]|^2[2-7]/,
      amex: /^3[47]/,
      rupay: /^6[0-9]/,
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }
    return "unknown";
  };

  const handleAddUpi = async () => {
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payments/methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "upi",
          upiId: upiId.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add UPI ID");
      }

      if (data.success && data.method) {
        setMethods((prev) => [...prev, data.method]);

        // Show verification status
        if (data.verification) {
          toast.success(data.verification);
        } else {
          toast.success("UPI ID added successfully");
        }

        setAddUpiOpen(false);
        setUpiId("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add UPI ID";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch("/api/payments/methods", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          methodId: id,
          action: "set_default",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set default payment method");
      }

      // Update local state
      setMethods((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m.id === id,
        }))
      );
      toast.success("Default payment method updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update default";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/payments/methods?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove payment method");
      }

      // Update local state
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success("Payment method removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove payment method";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetCardForm = () => {
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">
            Manage your saved cards and UPI IDs
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Error loading payment methods</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMethods}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Saved Methods */}
        <div className="space-y-4">
          {!error && methods.length === 0 ? (
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
                className={cn(method.isDefault && "border-primary")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          method.type === "card"
                            ? "bg-gradient-to-br from-slate-700 to-slate-900"
                            : "bg-gradient-to-br from-green-500 to-green-600"
                        )}
                      >
                        {method.type === "card" ? (
                          <CreditCard className="h-6 w-6 text-white" />
                        ) : (
                          <Smartphone className="h-6 w-6 text-white" />
                        )}
                      </div>

                      <div>
{method.type === "card" ? (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                •••• •••• •••• {method.cardLast4}
                              </p>
                              {method.cardBrand && method.cardBrand !== "unknown" && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {method.cardBrand}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {method.cardholderName}
                              {method.cardExpiry && ` • Expires ${method.cardExpiry}`}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{method.upiId}</p>
                              {method.isVerified && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">UPI ID</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {method.isDefault ? (
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
                              This will remove this payment method from your account.
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
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credit/Debit Card</DialogTitle>
                <DialogDescription>
                  Add a new card for faster checkout
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) =>
                        setCardExpiry(formatExpiry(e.target.value))
                      }
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      type="password"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAddCardOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCard}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addUpiOpen} onOpenChange={setAddUpiOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add UPI ID
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add UPI ID</DialogTitle>
                <DialogDescription>
                  Add a UPI ID for instant payments
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@bankname"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: yourname@bankname (e.g., john@okaxis)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAddUpiOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUpi}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add UPI ID
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}