"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
 * Payment method interface
 */
interface PaymentMethod {
  id: string;
  type: "card" | "upi";
  isDefault: boolean;
  // Card fields
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  cardholderName?: string;
  // UPI fields
  upiId?: string;
}

/**
 * Card brand icons
 */
const cardBrandIcons: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  rupay: "💳",
  amex: "💳",
};

/**
 * Payment Methods Page
 * Manage saved cards and UPI IDs
 * Implements U91 from feature spec
 */
export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addUpiOpen, setAddUpiOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new card
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Form state for UPI
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        // In production: fetch from Razorpay/Supabase
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMethods([
          {
            id: "card-1",
            type: "card",
            isDefault: true,
            cardLast4: "4242",
            cardBrand: "visa",
            cardExpiry: "12/26",
            cardholderName: "John Doe",
          },
          {
            id: "upi-1",
            type: "upi",
            isDefault: false,
            upiId: "john@okaxis",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const handleAddCard = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error("Please fill all card details");
      return;
    }

    setIsSubmitting(true);
    try {
      // In production: tokenize via Razorpay and save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newCard: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: "card",
        isDefault: methods.length === 0,
        cardLast4: cardNumber.slice(-4),
        cardBrand: "visa",
        cardExpiry,
        cardholderName: cardName,
      };

      setMethods([...methods, newCard]);
      toast.success("Card added successfully");
      setAddCardOpen(false);
      resetCardForm();
    } catch {
      toast.error("Failed to add card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpi = async () => {
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setIsSubmitting(true);
    try {
      // In production: verify and save UPI ID
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUpi: PaymentMethod = {
        id: `upi-${Date.now()}`,
        type: "upi",
        isDefault: methods.length === 0,
        upiId,
      };

      setMethods([...methods, newUpi]);
      toast.success("UPI ID added successfully");
      setAddUpiOpen(false);
      setUpiId("");
    } catch {
      toast.error("Failed to add UPI ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
    toast.success("Default payment method updated");
  };

  const handleDelete = async (id: string) => {
    const methodToDelete = methods.find((m) => m.id === id);
    if (methodToDelete?.isDefault && methods.length > 1) {
      toast.error("Set another method as default first");
      return;
    }

    setMethods(methods.filter((m) => m.id !== id));
    toast.success("Payment method removed");
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
        <div className="flex-1 p-4 lg:p-6 space-y-6">
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
                className={cn(
                  method.isDefault && "border-primary"
                )}
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
                            <p className="font-medium">
                              •••• •••• •••• {method.cardLast4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {method.cardholderName} • Expires {method.cardExpiry}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{method.upiId}</p>
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
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
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
              <Button variant="outline" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Debit/Credit Card</DialogTitle>
                <DialogDescription>
                  Your card details are securely stored via Razorpay
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Secured by Razorpay • PCI DSS Compliant
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
                  Add Card
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
                  disabled={isSubmitting}
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
    </div>
  );
}
