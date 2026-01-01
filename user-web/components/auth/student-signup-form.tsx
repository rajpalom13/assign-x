"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressSteps } from "./progress-steps";
import { UniversitySelector } from "./university-selector";
import { CourseSelector } from "./course-selector";
import { TermsModal } from "./terms-modal";
import { SuccessAnimation } from "./success-animation";
import {
  studentStep1Schema,
  studentStep2Schema,
  studentStep3Schema,
  type StudentFormData,
} from "@/lib/validations/student";
import { createStudentProfile, getAuthUserData } from "@/lib/actions/auth";
import { toast } from "sonner";

const steps = ["Personal", "Academic", "Contact"];

/**
 * Multi-step student signup form
 * Step 1: Personal info (name, DOB)
 * Step 2: Academic info (university, course, semester)
 * Step 3: Contact info (email, phone, terms)
 *
 * Autofills name and email from Google OAuth data
 */
export function StudentSignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentFormData>>({});
  const [authEmail, setAuthEmail] = useState<string>("");
  const [isAuthDataLoaded, setIsAuthDataLoaded] = useState(false);

  // Step 1 form
  const step1Form = useForm({
    resolver: zodResolver(studentStep1Schema),
    defaultValues: {
      fullName: formData.fullName || "",
      dateOfBirth: formData.dateOfBirth || "",
    },
  });

  // Step 2 form
  const step2Form = useForm({
    resolver: zodResolver(studentStep2Schema),
    defaultValues: {
      universityId: formData.universityId || "",
      courseId: formData.courseId || "",
      semester: formData.semester || 1,
    },
  });

  // Step 3 form
  const step3Form = useForm({
    resolver: zodResolver(studentStep3Schema),
    defaultValues: {
      collegeEmail: formData.collegeEmail || "",
      phone: formData.phone || "",
      acceptTerms: formData.acceptTerms || false,
    },
  });

  // Fetch auth user data on mount to autofill form
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const authData = await getAuthUserData();
        if (authData) {
          // Autofill name in step 1
          if (authData.fullName) {
            step1Form.setValue("fullName", authData.fullName);
            setFormData((prev) => ({ ...prev, fullName: authData.fullName }));
          }
          // Store email for step 3 (college email field)
          if (authData.email) {
            setAuthEmail(authData.email);
          }
        }
      } catch (error) {
        // Silently fail - user can still fill in manually
      } finally {
        setIsAuthDataLoaded(true);
      }
    };

    fetchAuthData();
  }, [step1Form]);

  const handleStep1Submit = step1Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(1);
  });

  const handleStep2Submit = step2Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  });

  const handleStep3Submit = step3Form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    const finalData = { ...formData, ...data } as StudentFormData;

    try {
      const result = await createStudentProfile({
        fullName: finalData.fullName,
        dateOfBirth: finalData.dateOfBirth,
        universityId: finalData.universityId,
        courseId: finalData.courseId,
        semester: finalData.semester,
        collegeEmail: finalData.collegeEmail,
        phone: finalData.phone,
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
  });

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/onboarding?step=role");
    }
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
        <h1 className="text-2xl font-bold">Student Registration</h1>
        <p className="text-muted-foreground">
          Complete your profile to get started
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>


      {/* Form Steps */}
      <div className="mx-auto w-full max-w-md flex-1">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep1Submit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isAuthDataLoaded && formData.fullName && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      From Google
                    </span>
                  )}
                </div>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...step1Form.register("fullName")}
                  className={step1Form.formState.errors.fullName ? "border-destructive" : ""}
                />
                {step1Form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...step1Form.register("dateOfBirth")}
                  className={step1Form.formState.errors.dateOfBirth ? "border-destructive" : ""}
                />
                {step1Form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.form>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 1 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep2Submit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label>University</Label>
                <UniversitySelector
                  value={step2Form.watch("universityId")}
                  onChange={(value) => step2Form.setValue("universityId", value)}
                  error={step2Form.formState.errors.universityId?.message}
                />
              </div>

              <div className="space-y-2">
                <Label>Course</Label>
                <CourseSelector
                  value={step2Form.watch("courseId")}
                  onChange={(value) => step2Form.setValue("courseId", value)}
                  error={step2Form.formState.errors.courseId?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={step2Form.watch("semester")?.toString()}
                  onValueChange={(value) =>
                    step2Form.setValue("semester", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={step2Form.formState.errors.semester ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step2Form.formState.errors.semester && (
                  <p className="text-sm text-destructive">
                    {step2Form.formState.errors.semester.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.form>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 2 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep3Submit}
              className="space-y-6"
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
                <Label htmlFor="collegeEmail">College Email (Optional)</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  placeholder="your.email@college.edu"
                  {...step3Form.register("collegeEmail")}
                  className={step3Form.formState.errors.collegeEmail ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Add your .edu email for university verification (optional)
                </p>
                {step3Form.formState.errors.collegeEmail && (
                  <p className="text-sm text-destructive">
                    {step3Form.formState.errors.collegeEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...step3Form.register("phone")}
                  className={step3Form.formState.errors.phone ? "border-destructive" : ""}
                />
                {step3Form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {step3Form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptTerms"
                  checked={step3Form.watch("acceptTerms")}
                  onCheckedChange={(checked) =>
                    step3Form.setValue("acceptTerms", checked as boolean)
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
                  {step3Form.formState.errors.acceptTerms && (
                    <p className="text-sm text-destructive">
                      {step3Form.formState.errors.acceptTerms.message}
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
          )}
        </AnimatePresence>
      </div>

      {/* Terms Modal */}
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
    </div>
  );
}
