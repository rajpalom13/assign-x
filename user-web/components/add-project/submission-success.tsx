"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Copy, ArrowRight, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface SubmissionSuccessProps {
  projectId: string;
  projectNumber: string;
  serviceType: "project" | "proofreading" | "report" | "consultation";
}

const serviceMessages = {
  project: {
    title: "Project Submitted!",
    description:
      "Your project has been submitted successfully. Our team will review it and send you a quote shortly.",
    nextStep: "You'll receive a quote within 2-4 hours",
  },
  proofreading: {
    title: "Document Submitted!",
    description:
      "Your document has been submitted for proofreading. Our experts will start working on it soon.",
    nextStep: "You'll receive the proofread document by your selected deadline",
  },
  report: {
    title: "Report Requested!",
    description:
      "Your document has been submitted for analysis. The report will be ready shortly.",
    nextStep: "You'll receive the detailed report within 24 hours",
  },
  consultation: {
    title: "Question Submitted!",
    description:
      "Your question has been sent to our experts. They'll respond with detailed guidance.",
    nextStep: "You'll receive an expert response within 48 hours",
  },
};

/**
 * Submission success screen with confetti
 */
export function SubmissionSuccess({
  projectId,
  projectNumber,
  serviceType,
}: SubmissionSuccessProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const message = serviceMessages[serviceType];

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10B981", "#3B82F6", "#8B5CF6"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10B981", "#3B82F6", "#8B5CF6"],
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectNumber);
      setCopied(true);
      toast.success("Project number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-2xl font-bold"
      >
        {message.title}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 max-w-md text-muted-foreground"
      >
        {message.description}
      </motion.p>

      {/* Project Number Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6 w-full max-w-sm"
      >
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Your Project Number
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold tracking-wider">
                {projectNumber}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Step */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="flex items-center gap-3 p-4">
            <ArrowRight className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <span className="font-medium">Next: </span>
              {message.nextStep}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <Button onClick={() => router.push(`/project/${projectId}`)}>
          <FileText className="mr-2 h-4 w-4" />
          View Project
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </motion.div>
    </motion.div>
  );
}
