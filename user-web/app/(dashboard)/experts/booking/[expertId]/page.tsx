"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  Shield,
  Loader2,
  Video,
  User,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import { BookingCalendar, PriceBreakdown } from "@/components/experts";
import { getExpertById } from "@/lib/data/experts";
import { calculateCommission } from "@/lib/commission";
import { toast } from "sonner";
import type { TimeSlot } from "@/types/expert";

/**
 * Booking steps
 */
type BookingStep = "datetime" | "details" | "payment" | "confirmation";

/**
 * Expert Booking Page
 * Multi-step booking flow with date/time selection and payment
 */
export default function ExpertBookingPage({
  params,
}: {
  params: Promise<{ expertId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<BookingStep>("datetime");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const expert = getExpertById(resolvedParams.expertId);

  // Handle expert not found
  if (!expert) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Expert not found</p>
          <Button
            variant="link"
            onClick={() => router.push("/experts")}
            className="mt-4"
          >
            Back to Experts
          </Button>
        </Card>
      </div>
    );
  }

  const commission = calculateCommission(expert.pricePerSession, "INR");

  /**
   * Get initials from name
   */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Check if can proceed to next step
   */
  const canProceed = () => {
    switch (currentStep) {
      case "datetime":
        return selectedDate && selectedTimeSlot;
      case "details":
        return topic.trim().length > 0;
      case "payment":
        return true;
      default:
        return false;
    }
  };

  /**
   * Go to next step
   */
  const handleNextStep = () => {
    switch (currentStep) {
      case "datetime":
        setCurrentStep("details");
        break;
      case "details":
        setCurrentStep("payment");
        break;
      case "payment":
        handlePayment();
        break;
    }
  };

  /**
   * Go to previous step
   */
  const handlePrevStep = () => {
    switch (currentStep) {
      case "details":
        setCurrentStep("datetime");
        break;
      case "payment":
        setCurrentStep("details");
        break;
    }
  };

  /**
   * Handle payment processing
   */
  const handlePayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate booking ID
      const newBookingId = `BOOK-${Date.now()}`;
      setBookingId(newBookingId);
      setShowConfirmation(true);

      toast.success("Booking confirmed! Check your email for details.");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  /**
   * Handle confirmation close
   */
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.push("/experts");
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => {
    const steps = [
      { key: "datetime", label: "Date & Time", icon: Calendar },
      { key: "details", label: "Details", icon: MessageSquare },
      { key: "payment", label: "Payment", icon: CreditCard },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:inline",
                  isCurrent && "font-medium text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-2",
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mesh-background mesh-gradient-bottom-right min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/experts/${expert.id}`)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-2">Book Consultation</h1>
          <p className="text-muted-foreground">
            Schedule your session with {expert.name}
          </p>
        </motion.div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Date & Time Selection */}
              {currentStep === "datetime" && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <BookingCalendar
                    expertId={expert.id}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onDateSelect={setSelectedDate}
                    onTimeSlotSelect={setSelectedTimeSlot}
                  />
                </motion.div>
              )}

              {/* Step 2: Session Details */}
              {currentStep === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic">
                          Topic / Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="topic"
                          placeholder="e.g., Machine Learning Project Help"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          Brief description of what you need help with
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any specific questions or materials you want to discuss..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {notes.length}/500
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Session Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={expert.avatar} alt={expert.name} />
                          <AvatarFallback>{getInitials(expert.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{expert.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {expert.designation}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedDate
                              ? format(selectedDate, "EEEE, MMMM d, yyyy")
                              : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedTimeSlot?.displayTime} (60 min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span>Google Meet (link will be shared)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{topic}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price Breakdown */}
                  <PriceBreakdown
                    totalAmount={expert.pricePerSession}
                    currency="INR"
                    showDetails
                  />

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Razorpay</p>
                          <p className="text-xs text-muted-foreground">
                            UPI, Cards, Net Banking, Wallets
                          </p>
                        </div>
                        <Badge variant="secondary">Secure</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              {currentStep !== "datetime" ? (
                <Button variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === "payment" ? (
                  <>Pay {formatINR(expert.pricePerSession)}</>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar - Expert Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert.avatar} alt={expert.name} />
                    <AvatarFallback>{getInitials(expert.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{expert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {expert.designation}
                    </p>
                  </div>
                </div>
                <div className="text-center py-3 bg-muted/30 rounded-lg">
                  <span className="text-2xl font-bold">
                    {formatINR(expert.pricePerSession)}
                  </span>
                  <span className="text-muted-foreground">/session</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>100% money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4 text-green-500" />
                  <span>Google Meet session</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>60 minute duration</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-center">
                Your consultation has been scheduled successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono font-medium">{bookingId}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expert</span>
                  <span className="font-medium">{expert.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {selectedTimeSlot?.displayTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">
                    {formatINR(expert.pricePerSession)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                A confirmation email with the Google Meet link has been sent to
                your registered email address.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/home")}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={handleConfirmationClose}
                className="w-full sm:w-auto"
              >
                View My Consultations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
