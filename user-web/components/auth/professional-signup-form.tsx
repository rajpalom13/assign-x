"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IndustrySelector } from "./industry-selector";
import { TermsModal } from "./terms-modal";
import { SuccessAnimation } from "./success-animation";
import {
  professionalFormSchema,
  type ProfessionalFormData,
} from "@/lib/validations/professional";
import { createProfessionalProfile, getAuthUserData } from "@/lib/actions/auth";
import { toast } from "sonner";

/**
 * Professional signup form
 * Simplified flow with Google OAuth + industry selection
 * Autofills name and email from Google OAuth data
 */
export function ProfessionalSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBusiness = searchParams.get("type") === "business";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [isNameFromGoogle, setIsNameFromGoogle] = useState(false);

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      fullName: "",
      industryId: "",
      phone: "",
      acceptTerms: false,
    },
  });

  // Fetch auth user data on mount to autofill form
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const authData = await getAuthUserData();
        if (authData) {
          // Autofill name
          if (authData.fullName) {
            form.setValue("fullName", authData.fullName);
            setIsNameFromGoogle(true);
          }
          // Store email for display
          if (authData.email) {
            setAuthEmail(authData.email);
          }
        }
      } catch (error) {
        // Silently fail - user can still fill in manually
      }
    };

    fetchAuthData();
  }, [form]);

  const onSubmit = async (data: ProfessionalFormData) => {
    setIsSubmitting(true);

    try {
      const result = await createProfessionalProfile({
        fullName: data.fullName,
        industryId: data.industryId,
        phone: data.phone,
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding?step=role");
  };

  const handleSuccessComplete = () => {
    router.push("/home");
  };

  if (showSuccess) {
    return <SuccessAnimation onComplete={handleSuccessComplete} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">
          {isBusiness ? "Business Registration" : "Professional Registration"}
        </h1>
        <p className="text-muted-foreground">
          {isBusiness
            ? "Set up your business account to get started"
            : "Complete your profile to unlock career opportunities"}
        </p>
      </div>


      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-md space-y-6"
      >
        {/* Show authenticated email */}
        {authEmail && (
          <div className="space-y-2">
            <Label>Account Email</Label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{authEmail}</span>
              <span className="ml-auto text-xs text-muted-foreground">via Google</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullName">Full Name</Label>
            {isNameFromGoogle && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                From Google
              </span>
            )}
          </div>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            {...form.register("fullName")}
            className={form.formState.errors.fullName ? "border-destructive" : ""}
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <IndustrySelector
            value={form.watch("industryId")}
            onChange={(value) => form.setValue("industryId", value)}
            error={form.formState.errors.industryId?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            {...form.register("phone")}
            className={form.formState.errors.phone ? "border-destructive" : ""}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            checked={form.watch("acceptTerms")}
            onCheckedChange={(checked) =>
              form.setValue("acceptTerms", checked as boolean)
            }
          />
          <div className="space-y-1">
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal leading-relaxed"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-medium text-primary underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="font-medium text-primary underline"
              >
                Privacy Policy
              </button>
            </Label>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </motion.form>

      {/* Terms Modal */}
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
    </div>
  );
}
